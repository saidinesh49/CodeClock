const STORAGE_KEY = 'codeclock_data';

export const SOURCES = ['LeetCode', 'CodeForces', 'CodeChef', 'AtCoder', 'CSES', 'GeeksforGeeks', 'HackerRank', 'HackerEarth', 'Coding Ninjas'];

const SOURCE_HOSTS = {
  'leetcode.com': 'LeetCode',
  'codeforces.com': 'CodeForces',
  'codechef.com': 'CodeChef',
  'atcoder.jp': 'AtCoder',
  'cses.fi': 'CSES',
  'geeksforgeeks.org': 'GeeksforGeeks',
  'hackerrank.com': 'HackerRank',
  'hackerearth.com': 'HackerEarth',
  'codingninjas.com': 'Coding Ninjas',
  'naukri.com/code360': 'Coding Ninjas'
};

// Returns a source name, or null if the URL isn't a supported site.
export const detectSource = (url) => {
  try {
    const { hostname, pathname } = new URL(url);
    const where = hostname + pathname;
    const host = Object.keys(SOURCE_HOSTS).find((h) => where.includes(h));
    return host ? SOURCE_HOSTS[host] : null;
  } catch {
    return null;
  }
};

export const getTimerData = async () => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return (data[STORAGE_KEY] || []).map((item) => ({
    ...item,
    platform: item.platform || detectSource(item.url) || 'Other'
  }));
};
