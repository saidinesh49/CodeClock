const TIMER_STATE_KEY = 'codeclock_current_state';

export const TimerState = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

export const saveTimerState = (state) => {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
    ...state,
    lastUpdated: Date.now()
  }));
};

export const getTimerState = () => {
  try {
    const state = JSON.parse(localStorage.getItem(TIMER_STATE_KEY));
    if (!state) return null;
    return state;
  } catch {
    return null;
  }
};

export const clearTimerState = () => {
  localStorage.removeItem(TIMER_STATE_KEY);
};

export const calculateElapsedTime = (state) => {
  if (!state) return 0;
  
  const now = Date.now();
  let totalTime = 0;

  // Add time from previous segments
  if (state.pausedSegments) {
    totalTime += state.pausedSegments.reduce((acc, segment) => 
      acc + (segment.end - segment.start), 0);
  }

  // Add current segment if running
  if (state.status === TimerState.RUNNING) {
    const lastPauseEnd = state.lastPauseEnd || state.startTime;
    totalTime += now - lastPauseEnd;
  }

  return Math.floor(totalTime / 1000);
};

export const checkExistingTimer = async (platform) => {
  const state = getTimerState();
  if (state && state.platform === platform && 
      state.status !== TimerState.STOPPED &&
      (Date.now() - state.lastUpdated) < 24 * 60 * 60 * 1000) {
    return true;
  }
  return false;
}; 