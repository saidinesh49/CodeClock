import { Difficulty } from "./types";

// DOM Elements
const difficultySelector = document.getElementById(
	"difficulty-selector",
) as HTMLDivElement;
const countdownSection = document.getElementById("countdown") as HTMLDivElement;
const timerSection = document.getElementById("timer") as HTMLDivElement;
const countdownNumber = document.querySelector(
	".countdown-number",
) as HTMLDivElement;
const countdownText = document.querySelector(
	".countdown-text",
) as HTMLDivElement;
const timeDisplay = document.querySelector(".time-display") as HTMLDivElement;
const endTimerButton = document.getElementById(
	"end-timer",
) as HTMLButtonElement;
const statusDot = document.querySelector(".status-dot") as HTMLDivElement;

// State
let startTime: number | null = null;
let timerInterval: number | null = null;
let selectedDifficulty: Difficulty | null = null;

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

function updateTimer(): void {
	if (!startTime) return;
	const elapsed = Date.now() - startTime;
	timeDisplay.textContent = formatTime(elapsed);
}

async function startProblemTimer(): Promise<void> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	if (!tab.id || !selectedDifficulty) return;

	startTime = Date.now();
	timerInterval = window.setInterval(updateTimer, 1000);

	// Show timer section
	difficultySelector.classList.add("hidden");
	countdownSection.classList.add("hidden");
	timerSection.classList.remove("hidden");

	// Send message to background
	chrome.runtime.sendMessage({
		type: "START_TIMER",
		difficulty: selectedDifficulty,
		windowId: tab.windowId,
		tabId: tab.id,
	});
}

function startCountdown(): void {
	let count = 3;
	difficultySelector.classList.add("hidden");
	countdownSection.classList.remove("hidden");

	const countdown = setInterval(() => {
		count--;
		if (count > 0) {
			countdownNumber.textContent = count.toString();
			countdownText.textContent = "Starting timer...";
		} else {
			clearInterval(countdown);
			startProblemTimer();
		}
	}, 1000);
}

function handleDifficultySelect(event: Event): void {
	const target = event.target as HTMLElement;
	if (!target.matches(".difficulty-btn")) return;

	const difficulty = target.getAttribute("data-difficulty");
	if (difficulty) {
		selectedDifficulty = difficulty as Difficulty;
		startCountdown();
	}
}

async function handleEndTimer(): Promise<void> {
	if (!startTime) return;

	clearInterval(timerInterval!);
	const endTime = Date.now();
	const timeMs = endTime - startTime;

	chrome.runtime.sendMessage({ type: "END_TIMER" }, (response) => {
		window.close();
	});
}

// Event Listeners
difficultySelector.addEventListener("click", handleDifficultySelect);
endTimerButton.addEventListener("click", handleEndTimer);

// Check if timer is already running
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
	if (!tab.id) return;

	chrome.runtime.sendMessage(
		{ type: "GET_TIMER_STATE", tabId: tab.id },
		(response) => {
			if (response.isActive && response.startTime && response.difficulty) {
				selectedDifficulty = response.difficulty;
				startTime = response.startTime;
				startProblemTimer();
			}
		},
	);
});
