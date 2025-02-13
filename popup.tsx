import React from 'react';
import ReactDOM from 'react-dom';

const Popup = () => {
  const handleClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            console.log('Timer started');
          }
        });
      }
    });
  };

  return (
    <div>
      <h1>Code Timer</h1>
      <button onClick={handleClick}>Start Timer</button>
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));

export {};
