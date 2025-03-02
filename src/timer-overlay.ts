import { Difficulty, DIFFICULTY_COLORS } from "./types";

interface TimerMessage {
	type: "SHOW_TIMER_OVERLAY" | "HIDE_TIMER_OVERLAY" | "GET_TIMER_STATE";
	difficulty?: Difficulty;
}

interface TimerState {
	isActive: boolean;
	startTime?: number;
	difficulty?: Difficulty;
}

class TimerOverlay {
	private container: HTMLDivElement;
	private startTime: number | null = null;
	private updateInterval: number | null = null;

	constructor() {
		this.container = document.createElement("div");
		this.initializeOverlay();
	}

	private initializeOverlay(): void {
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

	private formatTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
			2,
			"0",
		)}:${String(seconds).padStart(2, "0")}`;
	}

	show(difficulty: Difficulty): void {
		this.startTime = Date.now();
		this.container.style.display = "block";
		this.container.style.borderLeft = `4px solid ${DIFFICULTY_COLORS[difficulty]}`;

		this.updateInterval = window.setInterval(() => {
			if (!this.startTime) return;
			const elapsed = Date.now() - this.startTime;
			this.container.textContent = this.formatTime(elapsed);
		}, 1000);
	}

	hide(): void {
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
	} else if (message.type === "HIDE_TIMER_OVERLAY") {
		overlay.hide();
	}
	return true;
});
