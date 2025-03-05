import { Difficulty, Platform, TimerResult } from "./types";

interface ActiveTimer {
	startTime: number;
	difficulty: Difficulty;
	windowId: number;
	tabId: number;
	platform: Platform;
}

interface TimerState {
	isActive: boolean;
	startTime: number | null;
	difficulty: Difficulty | null;
	windowId: number | null;
	tabId: number | null;
}

let timerState: TimerState = {
	isActive: false,
	startTime: null,
	difficulty: null,
	windowId: null,
	tabId: null,
};

function getCurrentPlatform(url: string): Platform {
	if (url.includes("leetcode.com")) return "LeetCode";
	if (url.includes("hackerrank.com")) return "HackerRank";
	if (url.includes("codechef.com")) return "CodeChef";
	if (url.includes("codeforces.com")) return "CodeForces";
	if (url.includes("atcoder.jp")) return "AtCoder";
	if (url.includes("geeksforgeeks.org")) return "GeeksforGeeks";
	if (url.includes("hackerearth.com")) return "HackerEarth";
	return "Unknown";
}

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
	// Initialize both sync and local storage
	chrome.storage.sync.get(["results", "settings"], (syncData) => {
		if (!syncData.results) {
			chrome.storage.sync.set({ results: [] });
		}
		if (!syncData.settings) {
			chrome.storage.sync.set({
				settings: {
					defaultDifficulty: "medium",
					showTimer: true,
				},
			});
		}
	});

	chrome.storage.local.get(["activeTimer", "currentSession"], (localData) => {
		if (!localData.currentSession) {
			chrome.storage.local.set({
				currentSession: {
					startedAt: Date.now(),
					problems: [],
				},
			});
		}
	});
});

let activeTimer: ActiveTimer | null = null;

// Update timer state persistence
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// For asynchronous operations, return true and handle sendResponse later
	if (message.type === "START_TIMER") {
		handleStartTimer(message, sendResponse);
		return true; // Will respond asynchronously
	} else if (message.type === "END_TIMER") {
		handleEndTimer(sendResponse);
		return true; // Will respond asynchronously
	} else if (message.type === "GET_TIMER_STATE") {
		handleGetTimerState(message, sendResponse);
		return false; // Synchronous response
	}
});

async function handleStartTimer(message: any, sendResponse: Function) {
	try {
		// Clear any existing timer first
		if (activeTimer) {
			chrome.tabs.sendMessage(activeTimer.tabId, {
				type: "HIDE_TIMER_OVERLAY",
			});
		}

		// Get current tab URL for platform detection
		chrome.tabs.get(message.tabId, (tab) => {
			const platform = tab.url ? getCurrentPlatform(tab.url) : "Unknown";

			activeTimer = {
				startTime: Date.now(),
				difficulty: message.difficulty,
				windowId: message.windowId,
				tabId: message.tabId,
				platform: platform,
			};

			timerState = {
				isActive: true,
				startTime: Date.now(),
				difficulty: message.difficulty,
				windowId: message.windowId,
				tabId: message.tabId,
			};

			chrome.tabs.sendMessage(message.tabId, {
				type: "SHOW_TIMER_OVERLAY",
				difficulty: message.difficulty,
			});

			// Store in both sync and local storage
			chrome.storage.local.set({
				activeTimer,
				currentSession: {
					problems: [
						{
							startTime: Date.now(),
							difficulty: message.difficulty,
							platform: platform,
							timestamp: Date.now(),
						},
					],
					startedAt: Date.now(),
				},
			});
		});
		sendResponse({ success: true });
	} catch (err: unknown) {
		const error = err as Error;
		sendResponse({
			success: false,
			error: error.message || "Unknown error occurred",
		});
	}
}

async function handleEndTimer(sendResponse: Function) {
	try {
		if (activeTimer) {
			const endTime = Date.now();
			const timeMs = endTime - activeTimer.startTime;
			chrome.tabs.sendMessage(activeTimer.tabId, {
				type: "HIDE_TIMER_OVERLAY",
			});

			// Save to sync storage for persistence
			chrome.storage.sync.get("results", (data) => {
				const results = data.results || [];
				const newResult = {
					difficulty: activeTimer!.difficulty,
					timeMs,
					platform: activeTimer!.platform,
					timestamp: endTime,
				};
				results.push(newResult);

				chrome.storage.sync.set({ results }, () => {
					// Update local session data
					chrome.storage.local.get("currentSession", (sessionData) => {
						const session = sessionData.currentSession;
						if (session && session.problems.length > 0) {
							const currentProblem =
								session.problems[session.problems.length - 1];
							currentProblem.endTime = endTime;
							currentProblem.timeMs = timeMs;
							chrome.storage.local.set({ currentSession: session });
						}
					});
				});
			});

			// Clear active timer from local storage
			chrome.storage.local.remove("activeTimer");

			// Save result
			chrome.storage.local.get("results", (data) => {
				const results: TimerResult[] = data.results || [];
				const newResult: TimerResult = {
					difficulty: activeTimer!.difficulty,
					timeMs: timeMs,
					platform: activeTimer!.platform || "Unknown",
					timestamp: endTime,
				};
				results.push(newResult);
				chrome.storage.local.set({
					results: results,
					lastResult: newResult,
					activeTimer: null,
				});
			});

			activeTimer = null;
			timerState = {
				isActive: false,
				startTime: null,
				difficulty: null,
				windowId: null,
				tabId: null,
			};
			sendResponse({ success: true, timeMs });
		} else {
			sendResponse({ error: "No active timer" });
		}
	} catch (err: unknown) {
		const error = err as Error;
		sendResponse({
			success: false,
			error: error.message || "Unknown error occurred",
		});
	}
}

function handleGetTimerState(message: any, sendResponse: Function) {
	if (activeTimer && message.tabId === activeTimer.tabId) {
		sendResponse({
			isActive: true,
			startTime: activeTimer.startTime,
			difficulty: activeTimer.difficulty,
		});
	} else {
		sendResponse({ isActive: false });
	}
}

// Add storage change listener
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === "sync" && changes.results) {
		console.log("Results updated:", changes.results.newValue);
	}
});

// Window and tab monitoring
chrome.windows.onRemoved.addListener((windowId) => {
	if (windowId === timerState.windowId) {
		timerState = {
			isActive: false,
			startTime: null,
			difficulty: null,
			windowId: null,
			tabId: null,
		};
	}
});

chrome.tabs.onRemoved.addListener((tabId) => {
	if (tabId === timerState.tabId) {
		timerState = {
			isActive: false,
			startTime: null,
			difficulty: null,
			windowId: null,
			tabId: null,
		};
	}
});

// Inject timer overlay script into supported platforms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (
		changeInfo.status === "complete" &&
		tab.url &&
		(tab.url.includes("leetcode.com") ||
			tab.url.includes("hackerrank.com") ||
			tab.url.includes("codechef.com") ||
			tab.url.includes("codeforces.com") ||
			tab.url.includes("atcoder.jp") ||
			tab.url.includes("geeksforgeeks.org") ||
			tab.url.includes("hackerearth.com"))
	) {
		chrome.scripting
			.executeScript({
				target: { tabId },
				files: ["timer-overlay.js"],
			})
			.catch(console.error);
	}
});
