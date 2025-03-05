import { Difficulty, DIFFICULTY_COLORS, LEETCODE_COLORS } from "./types";

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
	private static instance: TimerOverlay | null = null;
	private container: HTMLDivElement;
	private timeDisplay: HTMLDivElement;
	private dragHandle: HTMLDivElement;
	private startTime: number | null = null;
	private updateInterval: number | null = null;
	private isDragging: boolean = false;
	private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

	// Make constructor private for singleton
	private constructor() {
		this.container = document.createElement("div");
		this.timeDisplay = document.createElement("div");
		this.dragHandle = document.createElement("div");

		// Initialize with 00:00 immediately
		this.timeDisplay.textContent = "00:00";

		this.initializeOverlay();
		this.initializeDragHandling();
	}

	public static getInstance(): TimerOverlay {
		if (!TimerOverlay.instance) {
			TimerOverlay.instance = new TimerOverlay();
		}
		return TimerOverlay.instance;
	}

	public static removeInstance(): void {
		if (TimerOverlay.instance) {
			TimerOverlay.instance.hide();
			TimerOverlay.instance = null;
		}
	}

	private initializeOverlay(): void {
		// Remove any existing overlay first
		const existingOverlay = document.getElementById("code-clock-overlay");
		if (existingOverlay) {
			existingOverlay.remove();
		}

		this.container.id = "code-clock-overlay";
		this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${LEETCODE_COLORS.background};
            color: ${LEETCODE_COLORS.text};
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            z-index: 100000;
            cursor: move;
            user-select: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 80px;
            opacity: 0.9;
            transition: opacity 0.2s;
        `;

		// Add status indicator
		const statusDot = document.createElement("div");
		statusDot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ade80;
            animation: pulse 2s infinite;
        `;

		this.timeDisplay.style.cssText = `
            color: ${LEETCODE_COLORS.text};
            font-weight: 500;
            flex-grow: 1;
            text-align: center;
            font-family: monospace;
        `;

		this.container.appendChild(statusDot);
		this.container.appendChild(this.timeDisplay);

		// Add stop button
		const stopBtn = document.createElement("button");
		stopBtn.innerHTML = "⏹";
		stopBtn.style.cssText = `
            background: none;
            border: none;
            color: ${LEETCODE_COLORS.text};
            cursor: pointer;
            padding: 0 4px;
            font-size: 12px;
            opacity: 0.7;
            &:hover {
                opacity: 1;
            }
        `;
		stopBtn.onclick = (e) => {
			e.stopPropagation();
			this.handleStop();
		};

		this.container.appendChild(stopBtn);
		document.body.appendChild(this.container);
	}

	private initializeDragHandling(): void {
		this.container.addEventListener("mousedown", this.startDragging.bind(this));
		document.addEventListener("mousemove", this.drag.bind(this));
		document.addEventListener("mouseup", this.stopDragging.bind(this));
	}

	private startDragging(e: MouseEvent): void {
		if (e.target === this.container) {
			this.isDragging = true;
			const rect = this.container.getBoundingClientRect();
			this.dragOffset = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		}
	}

	private drag(e: MouseEvent): void {
		if (!this.isDragging) return;

		const x = e.clientX - this.dragOffset.x;
		const y = e.clientY - this.dragOffset.y;

		// Keep within viewport bounds
		const maxX = window.innerWidth - this.container.offsetWidth;
		const maxY = window.innerHeight - this.container.offsetHeight;

		this.container.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
		this.container.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
		this.container.style.right = "auto";
	}

	private stopDragging(): void {
		this.isDragging = false;
	}

	private handleClick(e: MouseEvent): void {
		if (!this.isDragging) {
			const shouldStop = confirm("Do you want to stop the timer?");
			if (shouldStop) {
				chrome.runtime.sendMessage({ type: "END_TIMER" });
			}
		}
	}

	private handleStop(): void {
		const shouldStop = confirm("End the timer?");
		if (shouldStop) {
			chrome.runtime.sendMessage({ type: "END_TIMER" });
		}
	}

	private formatTime(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
			2,
			"0",
		)}`;
	}

	show(difficulty: Difficulty): void {
		this.startTime = Date.now();
		this.container.style.display = "flex";
		this.container.style.borderLeft = `3px solid ${DIFFICULTY_COLORS[difficulty]}`;

		// Ensure timer is visible immediately
		this.container.style.opacity = "0.9";
		this.timeDisplay.textContent = "00:00";

		// Update timer immediately and then start interval
		this.updateTimer();
		this.updateInterval = window.setInterval(() => this.updateTimer(), 1000);

		// Force layout recalculation
		void this.container.offsetHeight;
	}

	private updateTimer(): void {
		if (!this.startTime) return;
		const elapsed = Date.now() - this.startTime;
		this.timeDisplay.textContent = this.formatTime(elapsed);
	}

	hide(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
		this.container.style.display = "none";
		this.startTime = null;

		// Save final time before hiding
		const endTime = Date.now();
		const elapsed = endTime - (this.startTime || endTime);
		chrome.storage.local.get("activeTimer", (data) => {
			if (data.activeTimer) {
				chrome.storage.local.set({
					lastTimerResult: {
						timeMs: elapsed,
						difficulty: data.activeTimer.difficulty,
						timestamp: endTime,
					},
				});
			}
		});

		// Save position
		const rect = this.container.getBoundingClientRect();
		chrome.storage.local.set({
			timerPosition: {
				top: this.container.style.top,
				left: this.container.style.left,
			},
		});
	}
}

// Ensure single instance
const overlay = TimerOverlay.getInstance();

// Cleanup on page unload
window.addEventListener("unload", () => {
	TimerOverlay.removeInstance();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "SHOW_TIMER_OVERLAY") {
		// Force immediate creation and display
		requestAnimationFrame(() => {
			TimerOverlay.getInstance().show(message.difficulty);
		});
	} else if (message.type === "HIDE_TIMER_OVERLAY") {
		TimerOverlay.getInstance().hide();
		TimerOverlay.removeInstance();
	}
	return true;
});
