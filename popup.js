// DOM Elements
const difficultySelector = document.getElementById('difficulty-selector');
const countdownSection = document.getElementById('countdown');
const timerSection = document.getElementById('timer');
const countdownNumber = document.querySelector('.countdown-number');
const timeDisplay = document.querySelector('.time-display');
const endTimerButton = document.getElementById('end-timer');

// State
let startTime = null;
let timerInterval = null;
let selectedDifficulty = null;

// Platform detection
async function detectPlatform() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;
  
  if (domain.includes('leetcode.com')) return 'LeetCode';
  if (domain.includes('hackerrank.com')) return 'HackerRank';
  if (domain.includes('codechef.com')) return 'CodeChef';
  if (domain.includes('codeforces.com')) return 'CodeForces';
  return 'Other';
}

// Timer functions
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
  if (!startTime) return;
  const elapsed = Date.now() - startTime;
  timeDisplay.textContent = formatTime(elapsed);
}

function startProblemTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  difficultySelector.classList.add('hidden');
  timerSection.classList.remove('hidden');
}

// Countdown functions
function startCountdown() {
  let count = 3;
  difficultySelector.classList.add('hidden');
  countdownSection.classList.remove('hidden');
  
  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
    } else {
      clearInterval(countdown);
      countdownSection.classList.add('hidden');
      startProblemTimer();
    }
  }, 1000);
}

// Storage functions
async function saveResult(timeMs) {
  const platform = await detectPlatform();
  const timestamp = Date.now();
  
  const result = {
    difficulty: selectedDifficulty,
    timeMs,
    platform,
    timestamp
  };
  
  // Get existing results
  const { results = [] } = await chrome.storage.local.get('results');
  results.push(result);
  
  // Save updated results
  await chrome.storage.local.set({ results });
}

// Event Listeners
document.querySelectorAll('.difficulty-btn').forEach(button => {
  button.addEventListener('click', () => {
    selectedDifficulty = button.dataset.difficulty;
    startCountdown();
  });
});

endTimerButton.addEventListener('click', async () => {
  if (!startTime) return;
  
  clearInterval(timerInterval);
  const endTime = Date.now();
  const timeMs = endTime - startTime;
  
  await saveResult(timeMs);
  window.close();
});
