const TIMER_STATE_KEY = 'codeclock_timer_state';

export const saveTimerState = (state) => {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
    ...state,
    timestamp: Date.now()
  }));
};

export const getTimerState = () => {
  try {
    const state = JSON.parse(localStorage.getItem(TIMER_STATE_KEY));
    if (!state) return null;

    // If state is older than 24 hours, clear it
    if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(TIMER_STATE_KEY);
      return null;
    }

    return state;
  } catch {
    return null;
  }
};

export const clearTimerState = () => {
  localStorage.removeItem(TIMER_STATE_KEY);
}; 