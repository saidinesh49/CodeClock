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
  const difficulties = ['easy', 'easy-medium', 'medium', 'medium-hard', 'hard'];
  const counts = difficulties.map(diff => 
    data.filter(item => item.difficulty === diff).length
  );

  return {
    labels: difficulties.map(d => {
      if (d.includes('-')) {
        const [first, second] = d.split('-');
        return `${first.charAt(0).toUpperCase() + first.slice(1)}-${second.charAt(0).toUpperCase() + second.slice(1)}`;
      }
      return d.charAt(0).toUpperCase() + d.slice(1);
    }),
    datasets: [{
      label: 'Problems Solved',
      data: counts,
      backgroundColor: [
        colors.difficulty.easy,
        colors.difficulty.easy_medium,
        colors.difficulty.medium,
        colors.difficulty.medium_hard,
        colors.difficulty.hard
      ]
    }]
  };
};

const difficultyColors = {
  easy: colors.difficulty.easy,
  medium: colors.difficulty.medium,
  hard: colors.difficulty.hard,
  'easy-medium': colors.difficulty.easy_medium,
  'medium-hard': colors.difficulty.medium_hard
}; 