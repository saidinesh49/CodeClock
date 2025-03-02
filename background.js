// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with empty results array if not exists
  chrome.storage.local.get('results', (data) => {
    if (!data.results) {
      chrome.storage.local.set({ results: [] });
    }
  });
});

// Keep service worker active
chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    // Cleanup when popup is closed
  });
});
