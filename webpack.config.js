const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: "production",
	entry: {
		popup: "./src/popup.ts",
		background: "./src/background.ts",
		dashboard: "./src/dashboard.ts",
		"timer-overlay": "./src/timer-overlay.ts",
	},
	optimization: {
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
				},
			},
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
		alias: {
			"chart.js/auto": path.resolve(
				__dirname,
				"node_modules/chart.js/auto/auto.js",
			),
			dayjs: path.resolve(__dirname, "node_modules/dayjs/dayjs.min.js"),
		},
		fallback: {
			"chart.js": require.resolve("chart.js"),
		},
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "src/manifest.json", to: "manifest.json" },
				{ from: "src/popup.html", to: "popup.html" },
				{ from: "src/dashboard.html", to: "dashboard.html" },
				{ from: "src/styles.css", to: "styles.css" },
				{ from: "src/images", to: "images" },
				{
					from: "node_modules/chart.js/dist/chart.umd.js",
					to: "vendor/chart.min.js",
				},
			],
		}),
	],
	performance: {
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};
