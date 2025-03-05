import type { Chart as ChartType } from "chart.js";
import Chart from "chart.js/auto";
import { Difficulty, DIFFICULTY_COLORS } from "./types";

// Type definitions
interface TimerResult {
	difficulty: Difficulty;
	timeMs: number;
	platform: string;
	timestamp: number;
}

interface Session {
	problems: Problem[];
	startedAt: number;
}

interface Problem {
	endTime?: number;
	difficulty: Difficulty;
	timeMs?: number;
	platform: string;
	startTime: number;
}

type TimeRange = "week" | "month" | "year" | "all";

// DOM Elements
const totalProblemsElement = document.getElementById(
	"total-problems",
) as HTMLDivElement;
const avgTimeElement = document.getElementById("avg-time") as HTMLDivElement;
const fastestSolveElement = document.getElementById(
	"fastest-solve",
) as HTMLDivElement;
const favoritePlatformElement = document.getElementById(
	"favorite-platform",
) as HTMLDivElement;
const platformSelect = document.getElementById(
	"platformSelect",
) as HTMLSelectElement;
const timeRangeSelect = document.getElementById(
	"timeRangeSelect",
) as HTMLSelectElement;
const difficultySelect = document.getElementById(
	"difficultySelect",
) as HTMLSelectElement;
const statsContainer = document.getElementById(
	"stats-container",
) as HTMLDivElement;
const timelineContainer = document.getElementById("timeline") as HTMLDivElement;

// Chart instances
let difficultyChartInstance: ChartType | null = null;
let progressChartInstance: ChartType | null = null;

interface StorageData {
	results: TimerResult[];
}

// Utility functions
function formatTime(ms: number): string {
	const hours = Math.floor(ms / 3600000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
		2,
		"0",
	)}:${String(seconds).padStart(2, "0")}`;
}

function getTimeRangeFilter(range: string): number {
	const now = Date.now();
	switch (range) {
		case "week":
			return now - 7 * 24 * 60 * 60 * 1000;
		case "month":
			return now - 30 * 24 * 60 * 60 * 1000;
		case "year":
			return now - 365 * 24 * 60 * 60 * 1000;
		default:
			return 0;
	}
}

function filterResults(
	results: TimerResult[],
	platform: string,
	timeRange: string,
): TimerResult[] {
	const timeFilter = getTimeRangeFilter(timeRange);
	return results.filter((result) => {
		const platformMatch = platform === "all" || result.platform === platform;
		const timeMatch = result.timestamp >= timeFilter;
		return platformMatch && timeMatch;
	});
}

// Chart creation functions
function createDifficultyChart(results: TimerResult[]): void {
	try {
		const ctx = document.getElementById("difficultyChart") as HTMLCanvasElement;
		if (!ctx) return;

		if (difficultyChartInstance) {
			difficultyChartInstance.destroy();
		}

		const difficultyData = {
			easy: [] as number[],
			medium: [] as number[],
			hard: [] as number[],
		};

		results.forEach((result) => {
			difficultyData[result.difficulty].push(result.timeMs);
		});

		const data = Object.entries(difficultyData).map(([difficulty, times]) => ({
			difficulty,
			avgTime: times.length
				? times.reduce((a, b) => a + b, 0) / times.length / 60000
				: 0,
		}));

		difficultyChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: data.map((d) => d.difficulty.toUpperCase()),
				datasets: [
					{
						label: "Average Time (minutes)",
						data: data.map((d) => d.avgTime),
						backgroundColor: data.map(
							(d) => DIFFICULTY_COLORS[d.difficulty as Difficulty],
						),
						borderRadius: 8,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
			},
		});
	} catch (error) {
		console.error("Error creating difficulty chart:", error);
	}
}

function createProgressChart(results: TimerResult[], difficulty: string): void {
	const filteredResults =
		difficulty === "all"
			? results
			: results.filter((r) => r.difficulty === difficulty);

	const chartData = filteredResults
		.map((result) => ({
			x: result.timestamp,
			y: result.timeMs / 60000,
			difficulty: result.difficulty,
		}))
		.sort((a, b) => a.x - b.x);

	const ctx = document.getElementById("progressChart") as HTMLCanvasElement;

	if (progressChartInstance) {
		progressChartInstance.destroy();
	}

	progressChartInstance = new Chart(ctx, {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "Solve Time",
					data: chartData,
					backgroundColor: chartData.map(
						(data) => DIFFICULTY_COLORS[data.difficulty as Difficulty],
					),
					pointRadius: 6,
					pointHoverRadius: 8,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					callbacks: {
						label(context: any): string[] {
							const point = chartData[context.dataIndex];
							return [
								`Difficulty: ${point.difficulty}`,
								`Time: ${Math.round(point.y)} minutes`,
							];
						},
					},
				},
			},
			scales: {
				x: {
					type: "time",
					time: {
						unit: "day",
						displayFormats: {
							day: "MMM D",
						},
					},
					title: {
						display: true,
						text: "Date",
					},
				},
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "Minutes",
					},
				},
			},
		},
	});
}

function updateStatistics(results: TimerResult[]): void {
	totalProblemsElement.textContent = results.length.toString();

	const avgTime = results.length
		? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length
		: 0;
	avgTimeElement.textContent = formatTime(avgTime);

	const fastestTime = results.length
		? Math.min(...results.map((r) => r.timeMs))
		: 0;
	fastestSolveElement.textContent = formatTime(fastestTime);

	const platforms = results.map((r) => r.platform);
	const platformCounts: { [key: string]: number } = {};
	platforms.forEach((p) => (platformCounts[p] = (platformCounts[p] || 0) + 1));
	const favoritePlatform =
		Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
	favoritePlatformElement.textContent = favoritePlatform;
}

function updateFilters(results: TimerResult[]): void {
	// Update platform filter
	const platforms = [...new Set(results.map((r) => r.platform))];
	platformSelect.innerHTML =
		'<option value="all">All Platforms</option>' +
		platforms.map((p) => `<option value="${p}">${p}</option>`).join("");

	// Update difficulty filter
	const difficulties = [...new Set(results.map((r) => r.difficulty))];
	difficultySelect.innerHTML =
		'<option value="all">All Difficulties</option>' +
		difficulties.map((d) => `<option value="${d}">${d}</option>`).join("");
}

// Event handlers
function handleFilterChange(): void {
	chrome.storage.local.get("results", (data: any) => {
		const results = data.results || [];
		const filteredResults = filterResults(
			results,
			platformSelect.value,
			timeRangeSelect.value,
		);

		createDifficultyChart(filteredResults);
		createProgressChart(filteredResults, difficultySelect.value);
		updateStatistics(filteredResults);
	});
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get(["results"], (data) => {
		const results = data.results || [];
		updateFilters(results);
		handleFilterChange();
	});
});

// Event listeners
platformSelect.addEventListener("change", handleFilterChange);
timeRangeSelect.addEventListener("change", handleFilterChange);
difficultySelect.addEventListener("change", handleFilterChange);

function calculateStats(results: TimerResult[]) {
	const stats = {
		easy: { count: 0, totalTime: 0 },
		medium: { count: 0, totalTime: 0 },
		hard: { count: 0, totalTime: 0 },
	};

	results.forEach((result) => {
		stats[result.difficulty].count++;
		stats[result.difficulty].totalTime += result.timeMs;
	});

	return stats;
}

function renderStats(results: TimerResult[]) {
	const stats = calculateStats(results);

	statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card easy">
                <h3>Easy</h3>
                <p>Count: ${stats.easy.count}</p>
                <p>Avg Time: ${
									stats.easy.count
										? formatTime(stats.easy.totalTime / stats.easy.count)
										: "00:00:00"
								}</p>
            </div>
            <div class="stat-card medium">
                <h3>Medium</h3>
                <p>Count: ${stats.medium.count}</p>
                <p>Avg Time: ${
									stats.medium.count
										? formatTime(stats.medium.totalTime / stats.medium.count)
										: "00:00:00"
								}</p>
            </div>
            <div class="stat-card hard">
                <h3>Hard</h3>
                <p>Count: ${stats.hard.count}</p>
                <p>Avg Time: ${
									stats.hard.count
										? formatTime(stats.hard.totalTime / stats.hard.count)
										: "00:00:00"
								}</p>
            </div>
        </div>
    `;
}

function renderTimeline(results: TimerResult[]) {
	const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);

	timelineContainer.innerHTML = sortedResults
		.map(
			(result) => `
        <div class="timeline-item ${
					result.difficulty
				}" style="border-left-color: ${DIFFICULTY_COLORS[result.difficulty]}">
            <div class="timeline-content">
                <span class="difficulty-badge">${result.difficulty.toUpperCase()}</span>
                <span class="platform-badge">${result.platform}</span>
                <span class="time">${formatTime(result.timeMs)}</span>
                <span class="date">${new Date(
									result.timestamp,
								).toLocaleDateString()}</span>
            </div>
        </div>
    `,
		)
		.join("");
}

// Initialize dashboard
chrome.storage.local.get("results", (data) => {
	const results = data.results || [];
	renderStats(results);
	renderTimeline(results);
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
	if (changes.results) {
		renderStats(changes.results.newValue);
		renderTimeline(changes.results.newValue);
	}
});

// Type-safe time range filter
const timeRanges: Record<TimeRange, number> = {
	week: 7 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	year: 365 * 24 * 60 * 60 * 1000,
	all: 0,
};

function filterByTimeRange(
	results: TimerResult[],
	range: TimeRange,
): TimerResult[] {
	const now = Date.now();
	const timeFilter = now - timeRanges[range];
	return results.filter((r) => r.timestamp >= timeFilter);
}

// Get data from both sync and local storage
async function getAllResults(): Promise<TimerResult[]> {
	return new Promise((resolve) => {
		chrome.storage.sync.get(["results"], (syncData) => {
			chrome.storage.local.get(["currentSession"], (localData) => {
				const syncResults = syncData.results || [];
				const session: Session = localData.currentSession || {
					problems: [],
					startedAt: Date.now(),
				};

				// Convert current session problems to TimerResult format
				const sessionResults = session.problems
					.filter((p: Problem): p is Required<Problem> => !!p.endTime)
					.map(
						(p): TimerResult => ({
							difficulty: p.difficulty,
							timeMs: p.timeMs || 0,
							platform: p.platform,
							timestamp: p.startTime,
						}),
					);

				resolve([...syncResults, ...sessionResults]);
			});
		});
	});
}

function filterByPlatform(
	results: TimerResult[],
	platform: string,
): TimerResult[] {
	return platform === "all"
		? results
		: results.filter((r) => r.platform === platform);
}

function updateDashboard(): void {
	getAllResults().then((results) => {
		const timeRange = timeRangeSelect.value as TimeRange;
		const platform = platformSelect.value;

		let filteredResults = results;
		filteredResults = filterByTimeRange(filteredResults, timeRange);
		filteredResults = filterByPlatform(filteredResults, platform);

		updateStatistics(filteredResults);
		createDifficultyChart(filteredResults);
		createProgressChart(filteredResults, difficultySelect.value);
		updateFilters(results);
	});
}

// Update event handlers
platformSelect.addEventListener("change", updateDashboard);
timeRangeSelect.addEventListener("change", updateDashboard);
difficultySelect.addEventListener("change", updateDashboard);

// Initialize dashboard
updateDashboard();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
	if (changes.results || changes.currentSession) {
		updateDashboard();
	}
});
