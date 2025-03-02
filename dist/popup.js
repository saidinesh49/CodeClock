/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
// DOM Elements
const difficultySelector = document.getElementById("difficulty-selector");
const countdownSection = document.getElementById("countdown");
const timerSection = document.getElementById("timer");
const countdownNumber = document.querySelector(".countdown-number");
const countdownText = document.querySelector(".countdown-text");
const timeDisplay = document.querySelector(".time-display");
const endTimerButton = document.getElementById("end-timer");
const statusDot = document.querySelector(".status-dot");
// State
let startTime = null;
let timerInterval = null;
let selectedDifficulty = null;
// Utility functions
function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function updateTimer() {
    if (!startTime)
        return;
    const elapsed = Date.now() - startTime;
    timeDisplay.textContent = formatTime(elapsed);
}
async function startProblemTimer() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab.id || !selectedDifficulty)
        return;
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
function startCountdown() {
    let count = 3;
    difficultySelector.classList.add("hidden");
    countdownSection.classList.remove("hidden");
    const countdown = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count.toString();
            countdownText.textContent = "Starting timer...";
        }
        else {
            clearInterval(countdown);
            startProblemTimer();
        }
    }, 1000);
}
function handleDifficultySelect(event) {
    const target = event.target;
    if (!target.matches(".difficulty-btn"))
        return;
    const difficulty = target.getAttribute("data-difficulty");
    if (difficulty) {
        selectedDifficulty = difficulty;
        startCountdown();
    }
}
async function handleEndTimer() {
    if (!startTime)
        return;
    clearInterval(timerInterval);
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
    if (!tab.id)
        return;
    chrome.runtime.sendMessage({ type: "GET_TIMER_STATE", tabId: tab.id }, (response) => {
        if (response.isActive && response.startTime && response.difficulty) {
            selectedDifficulty = response.difficulty;
            startTime = response.startTime;
            startProblemTimer();
        }
    });
});


/******/ })()
;