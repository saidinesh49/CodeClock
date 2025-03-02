// DOM Elements
const platformSelect = document.getElementById('platformSelect');
const totalProblemsElement = document.getElementById('total-problems');
const avgTimeElement = document.getElementById('avg-time');
const favoritePlatformElement = document.getElementById('favorite-platform');
const difficultyChart = document.getElementById('difficultyChart');
const progressChart = document.getElementById('progressChart');

// Chart instances
let difficultyChartInstance = null;
let progressChartInstance = null;

// Utility functions
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function calculateAverageTime(results) {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + result.timeMs, 0);
  return Math.floor(total / results.length);
}

function getMostFrequentPlatform(results) {
  const platforms = results.map(r => r.platform);
  return platforms.sort((a, b) =>
    platforms.filter(v => v === a).length - platforms.filter(v => v === b).length
  ).pop();
}

// Chart creation functions
function createDifficultyChart(results, platform = 'all') {
  const filteredResults = platform === 'all' ? results : results.filter(r => r.platform === platform);
  
  const difficultyData = {
    'Easy': [],
    'Easy-Medium': [],
    'Medium': [],
    'Medium-Hard': [],
    'Hard': []
  };

  filteredResults.forEach(result => {
    difficultyData[result.difficulty].push(result.timeMs);
  });

  const labels = Object.keys(difficultyData);
  const data = labels.map(difficulty => {
    const times = difficultyData[difficulty];
    return times.length ? Math.floor(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  });

  if (difficultyChartInstance) {
    difficultyChartInstance.destroy();
  }

  difficultyChartInstance = new Chart(difficultyChart, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Average Solve Time (minutes)',
        data: data.map(ms => Math.floor(ms / 60000)),
        backgroundColor: '#2196f3',
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      }
    }
  });
}

function createProgressChart(results) {
  const timeData = results.map(result => ({
    x: result.timestamp,
    y: result.timeMs / 60000, // Convert to minutes
    difficulty: result.difficulty
  })).sort((a, b) => a.x - b.x);

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  progressChartInstance = new Chart(progressChart, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Solve Time',
        data: timeData,
        backgroundColor: timeData.map(data => {
          switch(data.difficulty) {
            case 'Easy': return '#4caf50';
            case 'Easy-Medium': return '#8bc34a';
            case 'Medium': return '#ffc107';
            case 'Medium-Hard': return '#ff9800';
            case 'Hard': return '#f44336';
          }
        })
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      }
    }
  });
}

// Update dashboard
async function updateDashboard() {
  const { results = [] } = await chrome.storage.local.get('results');
  
  // Update statistics
  totalProblemsElement.textContent = results.length;
  avgTimeElement.textContent = formatTime(calculateAverageTime(results));
  favoritePlatformElement.textContent = getMostFrequentPlatform(results) || '-';

  // Update platform selector
  const platforms = [...new Set(results.map(r => r.platform))];
  platformSelect.innerHTML = '<option value="all">All Platforms</option>' +
    platforms.map(p => `<option value="${p}">${p}</option>`).join('');

  // Create charts
  createDifficultyChart(results);
  createProgressChart(results);
}

// Event listeners
platformSelect.addEventListener('change', async (e) => {
  const { results = [] } = await chrome.storage.local.get('results');
  createDifficultyChart(results, e.target.value);
});

// Initial load
document.addEventListener('DOMContentLoaded', updateDashboard);
