export type Difficulty = "easy" | "medium" | "hard";

export type Platform =
	| "LeetCode"
	| "HackerRank"
	| "CodeChef"
	| "CodeForces"
	| "AtCoder"
	| "GeeksforGeeks"
	| "HackerEarth"
	| "Unknown";

export interface TimerResult {
	difficulty: Difficulty;
	timeMs: number;
	platform: Platform;
	timestamp: number;
}

export const DIFFICULTY_COLORS = {
	Easy: "#22c55e", // Green
	"Easy-Medium": "#4ade80", // Light Green
	Medium: "#eab308", // Yellow
	"Medium-Hard": "#fb923c", // Orange
	Hard: "#ef4444", // Red
} as const;

export const SUPPORTED_PLATFORMS = {
	"leetcode.com": "LeetCode",
	"hackerrank.com": "HackerRank",
	"codechef.com": "CodeChef",
	"codeforces.com": "CodeForces",
	"atcoder.jp": "AtCoder",
	"practice.geeksforgeeks.org": "GeeksforGeeks",
	"hackerearth.com": "HackerEarth",
} as const;
