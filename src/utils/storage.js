const STORAGE_KEY = 'codeclock_data';

export const saveTimerData = async (data) => {
  const currentData = await chrome.storage.local.get(STORAGE_KEY);
  const existingData = currentData[STORAGE_KEY] || [];
  
  const newData = [...existingData, {
    ...data,
    timestamp: Date.now(),
    platform: await getCurrentPlatform(),
    timeInSeconds: data.time,
    timeFormatted: formatTime(data.time),
    problemUrl: window.location.href,
    problemTitle: document.title
  }];

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: newData });
    console.log('Timer data saved successfully:', {
      difficulty: data.difficulty,
      time: formatTime(data.time),
      platform: await getCurrentPlatform()
    });
  } catch (error) {
    console.error('Error saving timer data:', error);
  }
};

export const getTimerData = async () => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
};

const getCurrentPlatform = async () => {
  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab[0].url;
  
  if (url.includes('leetcode.com')) return 'LeetCode';
  if (url.includes('codechef.com')) return 'CodeChef';
  if (url.includes('codeforces.com')) return 'CodeForces';
  if (url.includes('atcoder.jp')) return 'AtCoder';
  if (url.includes('hackerearth.com')) return 'HackerEarth';
  if (url.includes('hackerrank.com')) return 'HackerRank';
  if (url.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
  
  return 'Other';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}; 