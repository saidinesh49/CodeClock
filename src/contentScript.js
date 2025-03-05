let timerContainer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    injectTimer(message.difficulty);
  } else if (message.type === 'STOP_TIMER') {
    removeTimer();
  }
});

const injectTimer = (difficulty) => {
  // Create container for timer iframe
  timerContainer = document.createElement('div');
  timerContainer.id = 'codeclock-timer-container';
  timerContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: transparent;
    border: none;
  `;

  // Create iframe for timer
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('index.html#/timer');
  iframe.style.cssText = `
    border: none;
    background: transparent;
    width: 150px;
    height: 40px;
  `;

  timerContainer.appendChild(iframe);
  document.body.appendChild(timerContainer);
};

const removeTimer = () => {
  if (timerContainer) {
    timerContainer.remove();
    timerContainer = null;
  }
}; 