import { Difficulty } from "./types";

interface ActiveTimer {
	startTime: number;
	difficulty: Difficulty;
	windowId: number;
	tabId: number;
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

// Initialize empty storage
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get("results", (data) => {
		if (!data.results) {
			chrome.storage.local.set({ results: [] });
		}
	});
});

let activeTimer: ActiveTimer | null = null;

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (
		message.type === "START_TIMER" &&
		message.difficulty &&
		message.windowId &&
		message.tabId
	) {
		activeTimer = {
			startTime: Date.now(),
			difficulty: message.difficulty,
			windowId: message.windowId,
			tabId: message.tabId,
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

		sendResponse({ success: true });
	} else if (message.type === "END_TIMER") {
		if (activeTimer) {
			const timeMs = Date.now() - activeTimer.startTime;
			chrome.tabs.sendMessage(activeTimer.tabId, {
				type: "HIDE_TIMER_OVERLAY",
			});

			// Save result
			chrome.storage.local.get("results", (data) => {
				const results = data.results || [];
				results.push({
					difficulty: activeTimer!.difficulty,
					timeMs,
					platform: "Unknown",
					timestamp: Date.now(),
				});
				chrome.storage.local.set({ results });
			});

			activeTimer = null;
			timerState = {
				isActive: false,
				startTime: null,
				difficulty: null,
				windowId: null,
				tabId: null,
			};
			sendResponse({ timeMs });
		} else {
			sendResponse({ error: "No active timer" });
		}
	} else if (message.type === "GET_TIMER_STATE") {
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
	return true;
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
