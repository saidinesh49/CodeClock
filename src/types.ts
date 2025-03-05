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
	easy: "#00B8A3", // LeetCode Easy green
	medium: "#FFA116", // LeetCode Medium yellow
	hard: "#FF375F", // LeetCode Hard red
} as const;

export const LEETCODE_COLORS = {
	background: "#282828",
	text: "#FFFFFF",
	border: "#3E3E3E",
	hover: "#404040",
	success: "#2CBB5D",
	warning: "#FFA116",
	error: "#FF375F",
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
