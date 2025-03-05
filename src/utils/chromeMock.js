// Mock Chrome APIs for development
export const setupChromeMock = () => {
  if (!window.chrome) {
    window.chrome = {
      runtime: {
        sendMessage: (message) => {
          console.log('Mock chrome.runtime.sendMessage:', message);
        },
        onMessage: {
          addListener: (callback) => {
            window.addEventListener('message', (event) => {
              if (event.data.type) {
                callback(event.data);
              }
            });
          }
        }
      },
      tabs: {
        query: (queryInfo, callback) => {
          callback([{ id: 1, url: window.location.href }]);
        },
        sendMessage: (tabId, message) => {
          console.log('Mock chrome.tabs.sendMessage:', message);
          window.postMessage(message, '*');
        }
      },
      storage: {
        local: {
          get: (key, callback) => {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            callback({ [key]: data });
          },
          set: (data, callback) => {
            Object.keys(data).forEach(key => {
              localStorage.setItem(key, JSON.stringify(data[key]));
            });
            if (callback) callback();
          }
        }
      }
    };
  }
}; 