chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TIMER_STOPPED') {
    // Handle timer data
    chrome.storage.local.get('codeclock_data', (result) => {
      const existingData = result.codeclock_data || [];
      const newData = [...existingData, {
        ...message.data,
        timestamp: Date.now(),
        url: sender.tab.url
      }];
      chrome.storage.local.set({ codeclock_data: newData });
    });
  }
}); 