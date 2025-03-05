console.log('CodeClock: Content script loaded');

let timerContainer = null;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let startTime;
let timerState = null;
let timerInterval = null;
let timeText = null;
let pausedTime = 0;
let pauseStartTime = null;

const TimerState = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

// Utility functions
const getCurrentPlatform = () => {
  return window.location.hostname;
};

const getTimerState = () => {
  const savedState = localStorage.getItem('codeclock_timer_state');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error('Error getting timer state:', error);
    }
  }
  return null;
};

const clearTimerState = () => {
  localStorage.removeItem('codeclock_timer_state');
};

const saveTimerState = (state) => {
  if (!timerContainer || !state) return;
  
  localStorage.setItem('codeclock_timer_state', JSON.stringify({
    time: calculateElapsedTime(state),
    difficulty: state.difficulty,
    position: {
      x: parseInt(timerContainer.style.left),
      y: parseInt(timerContainer.style.top)
    },
    timestamp: Date.now()
  }));
};

const calculateElapsedTime = (state) => {
  if (!state) return 0;
  
  const now = Date.now();
  let totalPausedTime = 0;

  // Calculate total paused time
  state.pausedSegments.forEach(segment => {
    if (segment.end) {
      totalPausedTime += segment.end - segment.start;
    } else if (state.status === TimerState.PAUSED) {
      totalPausedTime += now - segment.start;
    }
  });

  // Calculate total elapsed time minus paused time
  return Math.floor((now - state.startTime - totalPausedTime) / 1000);
};

const updateTimerDisplay = (time) => {
  if (!timeText || !timerContainer) return;
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  timeText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  if (timerState) saveTimerState(timerState);
};

const updatePauseButton = (symbol) => {
  const pauseButton = timerContainer?.querySelector('button:first-child');
  if (pauseButton) pauseButton.innerHTML = symbol;
};

const startTimer = () => {
  if (!timerContainer || !timerState) return;

  const updateTimer = () => {
    const elapsedTime = calculateElapsedTime(timerState);
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    timeText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    saveTimerState(timerState);
  };

  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
};

// Setup message listener for both development and production
const setupMessageListener = () => {
  // Remove any existing timer state on page load
  if (document.readyState === 'complete') {
    const savedState = loadSavedState();
    if (savedState) {
      injectTimer(savedState.difficulty);
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('CodeClock: Message received:', message);
    if (message.type === 'START_TIMER') {
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        injectTimer(message.difficulty);
        sendResponse({ status: 'Timer started' });
      }, 100);
    } else if (message.type === 'STOP_TIMER') {
      removeTimer();
      sendResponse({ status: 'Timer stopped' });
    }
    return true; // Keep the message channel open for sendResponse
  });
};

setupMessageListener();

// Load saved position and time on init
const loadSavedState = () => {
  const savedState = localStorage.getItem('codeclock_timer_state');
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      // Only restore if state is less than 24 hours old
      if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
        return state;
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }
  return null;
};

const createTimerControls = () => {
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '8px';
  controls.style.marginLeft = '8px';

  const pauseResumeBtn = document.createElement('button');
  pauseResumeBtn.style.cssText = `
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
  `;
  
  const updatePauseResumeButton = () => {
    pauseResumeBtn.textContent = timerState.status === TimerState.PAUSED ? '▶' : '⏸';
  };

  pauseResumeBtn.onclick = () => {
    if (timerState.status === TimerState.PAUSED) {
      resumeTimer();
    } else {
      pauseTimer();
    }
    updatePauseResumeButton();
  };
  updatePauseResumeButton();

  const stopBtn = document.createElement('button');
  stopBtn.textContent = '⏹';
  stopBtn.style.cssText = `
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
  `;
  stopBtn.onclick = handleStop;

  controls.appendChild(pauseResumeBtn);
  controls.appendChild(stopBtn);
  return controls;
};

const handlePause = () => {
  if (!timerState) return;

  if (timerState.status === TimerState.RUNNING) {
    clearInterval(timerInterval);
    timerState.status = TimerState.PAUSED;
    timerState.lastPauseStart = Date.now();
    saveTimerState(timerState);
    updatePauseButton('▶');
  } else {
    timerState.status = TimerState.RUNNING;
    timerState.pausedSegments = timerState.pausedSegments || [];
    if (timerState.lastPauseStart) {
      timerState.pausedSegments.push({
        start: timerState.lastPauseStart,
        end: Date.now()
      });
    }
    startTimer();
    updatePauseButton('⏸');
  }
};

const injectTimer = (difficulty) => {
  console.log('CodeClock: Injecting timer for difficulty:', difficulty);
  if (timerContainer) {
    removeTimer();
  }

  // Check for existing timer
  const existingState = getTimerState();
  if (existingState && existingState.platform === getCurrentPlatform()) {
    if (!confirm('A timer is already running on this platform. Would you like to stop it and start a new one?')) {
      return;
    }
    clearTimerState();
  }

  timerState = {
    startTime: Date.now(),
    difficulty,
    platform: getCurrentPlatform(),
    status: TimerState.RUNNING,
    pausedSegments: []
  };

  const savedState = loadSavedState();
  startTime = savedState ? Date.now() - (savedState.time * 1000) : Date.now();

  // Create timer container
  timerContainer = document.createElement('div');
  timerContainer.id = 'codeclock-timer-container';
  
  // Set initial position from saved state or default
  const initialPosition = savedState?.position || { x: 20, y: 20 };
  timerContainer.style.cssText = `
    position: fixed;
    top: ${initialPosition.y}px;
    left: ${initialPosition.x}px;
    z-index: 10000;
    background: ${window.codeclock_colors.background.paper};
    padding: 6px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    max-width: 200px;
    white-space: nowrap;
    cursor: move;
  `;

  // Create live indicator
  const liveIndicator = document.createElement('div');
  liveIndicator.style.cssText = `
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Create timer text element
  timeText = document.createElement('div');
  timeText.style.cssText = `
    color: white;
    font-family: monospace;
    font-size: 14px;
  `;

  // Create controls
  const controls = createTimerControls();

  // Assemble timer components
  timerContainer.appendChild(liveIndicator);
  timerContainer.appendChild(timeText);
  timerContainer.appendChild(controls);
  document.body.appendChild(timerContainer);

  // Start timer
  startTimer();

  // Make timer draggable
  timerContainer.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  saveTimerState(timerState);
};

const removeTimer = () => {
  if (timerContainer) {
    clearInterval(Number(timerContainer.dataset.interval));
    if (timerInterval) clearInterval(timerInterval);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    timerContainer.remove();
    timerContainer = null;
    isDragging = false;
    timerState = null;
    localStorage.removeItem('codeclock_timer_state');
  }
};

function dragStart(e) {
  if (!timerContainer) return;
  initialX = e.clientX - timerContainer.offsetLeft;
  initialY = e.clientY - timerContainer.offsetTop;
  isDragging = true;
}

function drag(e) {
  if (!isDragging || !timerContainer) return;
  e.preventDefault();
  currentX = e.clientX - initialX;
  currentY = e.clientY - initialY;
  timerContainer.style.left = currentX + "px";
  timerContainer.style.top = currentY + "px";
  saveTimerState();
}

function dragEnd() {
  isDragging = false;
}

const handleStop = () => {
  if (!timerState) return;

  if (window.confirm('Are you sure you want to stop the timer?')) {
    const message = {
      type: 'TIMER_STOPPED',
      data: { 
        time: calculateElapsedTime(timerState), 
        difficulty: timerState.difficulty 
      }
    };
    
    chrome.runtime.sendMessage(message);
    removeTimer();
    timerState = null;
  }
};

// Add pause/resume functions
const pauseTimer = () => {
  if (!timerState || timerState.status !== TimerState.RUNNING) return;
  
  timerState.status = TimerState.PAUSED;
  timerState.pausedSegments.push({
    start: Date.now()
  });
  
  clearInterval(timerInterval);
  saveTimerState(timerState);
};

const resumeTimer = () => {
  if (!timerState || timerState.status !== TimerState.PAUSED) return;

  const lastSegment = timerState.pausedSegments[timerState.pausedSegments.length - 1];
  lastSegment.end = Date.now();
  
  timerState.status = TimerState.RUNNING;
  startTimer();
  saveTimerState(timerState);
};
