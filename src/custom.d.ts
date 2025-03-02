declare module 'chart.js/auto' {
  import { Chart } from 'chart.js';
  export default Chart;
}

declare module '*.js' {
  const content: any;
  export default content;
}

interface Window {
  chrome: typeof chrome;
}
