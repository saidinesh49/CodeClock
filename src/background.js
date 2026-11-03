const KEY = 'codeclock_data';
const DIFFICULTIES = ['easy', 'medium', 'hard', 'easy-medium', 'medium-hard'];

// One save at a time, so quick back-to-back saves can't overwrite each other.
let queue = Promise.resolve();

const save = async (data, url) => {
  const { time, difficulty, source } = data;
  if (!DIFFICULTIES.includes(difficulty) || typeof time !== 'number' || time < 0 || time > 86400) {
    throw new Error('Invalid timer data');
  }
  const stored = await chrome.storage.local.get(KEY);
  const list = stored[KEY] || [];
  list.push({ time, difficulty, platform: source, timestamp: Date.now(), date: new Date().toISOString(), url });
  await chrome.storage.local.set({ [KEY]: list });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'TIMER_STOPPED') return;
  queue = queue
    .then(() => save(message.data, sender.tab?.url || ''))
    .then(() => sendResponse({ ok: true }))
    .catch((e) => {
      console.error('CodeClock: save failed', e);
      sendResponse({ ok: false });
    });
  return true; // async response
});
