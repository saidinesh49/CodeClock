/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/types.ts
const DIFFICULTY_COLORS = {
    Easy: "#22c55e", // Green
    "Easy-Medium": "#4ade80", // Light Green
    Medium: "#eab308", // Yellow
    "Medium-Hard": "#fb923c", // Orange
    Hard: "#ef4444", // Red
};
const SUPPORTED_PLATFORMS = {
    "leetcode.com": "LeetCode",
    "hackerrank.com": "HackerRank",
    "codechef.com": "CodeChef",
    "codeforces.com": "CodeForces",
    "atcoder.jp": "AtCoder",
    "practice.geeksforgeeks.org": "GeeksforGeeks",
    "hackerearth.com": "HackerEarth",
};

;// ./src/timer-overlay.ts

class TimerOverlay {
    constructor() {
        this.startTime = null;
        this.updateInterval = null;
        this.container = document.createElement("div");
        this.initializeOverlay();
    }
    initializeOverlay() {
        this.container.id = "code-clock-overlay";
        this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 16px;
      z-index: 10000;
      display: none;
    `;
        document.body.appendChild(this.container);
    }
    formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    show(difficulty) {
        this.startTime = Date.now();
        this.container.style.display = "block";
        this.container.style.borderLeft = `4px solid ${DIFFICULTY_COLORS[difficulty]}`;
        this.updateInterval = window.setInterval(() => {
            if (!this.startTime)
                return;
            const elapsed = Date.now() - this.startTime;
            this.container.textContent = this.formatTime(elapsed);
        }, 1000);
    }
    hide() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.container.style.display = "none";
        this.startTime = null;
    }
}
// Create and initialize the overlay
const overlay = new TimerOverlay();
// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_TIMER_OVERLAY") {
        overlay.show(message.difficulty);
    }
    else if (message.type === "HIDE_TIMER_OVERLAY") {
        overlay.hide();
    }
    return true;
});

/******/ })()
;