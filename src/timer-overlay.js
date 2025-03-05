/* Timer Overlay Script - Updated to count up from 00:00 with blinking dot indicator */
let seconds = 0;
let timerElement = document.getElementById("timer");
if (!timerElement) {
  timerElement = document.createElement("div");
  timerElement.id = "timer";
  timerElement.style.position = "fixed";
  timerElement.style.top = "10px";
  timerElement.style.right = "10px";
  timerElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  timerElement.style.color = "white";
  timerElement.style.padding = "5px 10px";
  timerElement.style.borderRadius = "5px";
  document.body.appendChild(timerElement);
}

function updateTimer() {
  seconds++;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerElement.innerHTML = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} <span class="blinking-dot">●</span>`;
}

// Initialize timer to 00:00 with blinking dot indicator and start updating every second
timerElement.innerHTML = `00:00 <span class="blinking-dot">●</span>`;
setInterval(updateTimer, 1000);
