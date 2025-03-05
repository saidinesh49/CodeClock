const STORAGE_KEY = 'codeclock_data';

const extractPlatform = (url) => {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('leetcode')) return 'LeetCode';
    if (hostname.includes('codechef')) return 'CodeChef';
    if (hostname.includes('codeforces')) return 'CodeForces';
    if (hostname.includes('atcoder')) return 'AtCoder';
    if (hostname.includes('hackerearth')) return 'HackerEarth';
    if (hostname.includes('hackerrank')) return 'HackerRank';
    if (hostname.includes('geeksforgeeks')) return 'GeeksforGeeks';
    return 'Other';
  } catch (error) {
    console.error('Error extracting platform:', error);
    return 'Unknown';
  }
};

const extractProblemTitle = (url, title) => {
  try {
    // Remove platform name and common words from title
    const cleanTitle = title
      .replace(/LeetCode|CodeChef|CodeForces|AtCoder|HackerEarth|HackerRank|GeeksforGeeks/g, '')
      .replace(/Problem|Solution|Question|\|/g, '')
      .trim();
    return cleanTitle;
  } catch (error) {
    console.error('Error extracting problem title:', error);
    return 'Unknown Problem';
  }
};

export const saveTimerData = async (data) => {
  const currentData = await chrome.storage.local.get(STORAGE_KEY);
  const existingData = currentData[STORAGE_KEY] || [];
  
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const title = tab.title;

  const newData = [...existingData, {
    ...data,
    timestamp: Date.now(),
    url: url,
    platform: extractPlatform(url),
    problemTitle: extractProblemTitle(url, title),
    timeInSeconds: data.time,
    timeFormatted: formatTime(data.time)
  }];

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: newData });
    console.log('Timer data saved successfully:', {
      difficulty: data.difficulty,
      time: formatTime(data.time),
      platform: extractPlatform(url),
      problem: extractProblemTitle(url, title)
    });
  } catch (error) {
    console.error('Error saving timer data:', error);
  }
};

export const getTimerData = async () => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return (data[STORAGE_KEY] || []).map(item => ({
    ...item,
    platform: item.platform || extractPlatform(item.url)
  }));
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}; 