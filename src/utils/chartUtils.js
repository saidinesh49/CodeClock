import { colors } from '../theme/colors';

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: colors.text.primary
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: colors.background.paper
      },
      ticks: {
        color: colors.text.secondary
      }
    },
    y: {
      grid: {
        color: colors.background.paper
      },
      ticks: {
        color: colors.text.secondary
      }
    }
  }
};

export const getChartData = (data) => {
  const datasets = [{
    label: 'Solving Time (minutes)',
    data: data.map(item => item.time / 60),
    borderColor: colors.secondary.main,
    tension: 0.4
  }];

  return {
    labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets
  };
};

export const getDifficultyDistribution = (data) => {
  const difficulties = ['easy', 'medium', 'hard'];
  const counts = difficulties.map(diff => 
    data.filter(item => item.difficulty === diff).length
  );

  return {
    labels: difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)),
    datasets: [{
      label: 'Problems Solved',
      data: counts,
      backgroundColor: [
        colors.difficulty.easy,
        colors.difficulty.medium,
        colors.difficulty.hard
      ]
    }]
  };
}; 