declare module "chart.js/auto" {
	export { Chart } from "chart.js";
	const chart: typeof import("chart.js").Chart;
	export default chart;
}
