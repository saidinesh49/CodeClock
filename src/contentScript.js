let timerContainer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    injectTimer(message.difficulty);
  } else if (message.type === 'STOP_TIMER') {
    removeTimer();
  }
});

const injectTimer = (difficulty) => {
  if (timerContainer) {
    removeTimer();
  }

  timerContainer = document.createElement('div');
  timerContainer.id = 'codeclock-timer-container';
  timerContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: ${colors.background.paper};
    padding: 6px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  let time = 0;
  const updateTimer = () => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    timeText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    time++;
  };

  // Create live indicator
  const liveIndicator = document.createElement('div');
  liveIndicator.style.cssText = `
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;

  // Create timer text
  const timeText = document.createElement('div');
  timeText.style.cssText = `
    color: white;
    font-family: monospace;
    font-size: 14px;
  `;

  // Create stop button
  const stopButton = document.createElement('button');
  stopButton.innerHTML = '⏹';
  stopButton.style.cssText = `
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
  `;

  stopButton.onclick = () => {
    if (window.confirm('Are you sure you want to stop the timer?')) {
      chrome.runtime.sendMessage({
        type: 'TIMER_STOPPED',
        data: { time, difficulty }
      });
      removeTimer();
    }
  };

  timerContainer.appendChild(liveIndicator);
  timerContainer.appendChild(timeText);
  timerContainer.appendChild(stopButton);
  document.body.appendChild(timerContainer);

  // Start timer
  const interval = setInterval(updateTimer, 1000);
  timerContainer.dataset.interval = interval;

  // Make timer draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  timerContainer.onmousedown = dragStart;
  document.onmousemove = drag;
  document.onmouseup = dragEnd;
};

const removeTimer = () => {
  if (timerContainer) {
    clearInterval(Number(timerContainer.dataset.interval));
    timerContainer.remove();
    timerContainer = null;
  }
};

function dragStart(e) {
  initialX = e.clientX - timerContainer.offsetLeft;
  initialY = e.clientY - timerContainer.offsetTop;
  isDragging = true;
}

function drag(e) {
  if (isDragging && timerContainer) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    timerContainer.style.left = currentX + "px";
    timerContainer.style.top = currentY + "px";
  }
}

function dragEnd() {
  isDragging = false;
} 