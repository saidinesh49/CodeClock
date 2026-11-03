// Guard: popup may re-inject this script if the page lost it.
if (!window.__codeclockLoaded) {
  window.__codeclockLoaded = true;

  const KEY = 'codeclock_timer_state';
  const DAY = 24 * 60 * 60 * 1000;
  const DIFFICULTIES = ['easy', 'easy-medium', 'medium', 'medium-hard', 'hard'];

  let state = null; // { startTime, difficulty, source, paused, pausedSegments, pos, savedAt }
  let box = null;
  let timeEl = null;
  let pauseBtn = null;
  let interval = null;
  let drag = null;

  const loadState = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s && Date.now() - s.savedAt < DAY ? s : null;
    } catch {
      return null;
    }
  };

  const saveState = () => {
    if (!state || !box) return;
    state.pos = { x: box.offsetLeft, y: box.offsetTop };
    state.savedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  };

  const elapsed = () => {
    const now = Date.now();
    const pausedMs = state.pausedSegments.reduce((sum, s) => sum + ((s.end || now) - s.start), 0);
    return Math.max(0, Math.floor((now - state.startTime - pausedMs) / 1000));
  };

  const render = () => {
    const t = elapsed();
    timeEl.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    pauseBtn.textContent = state.paused ? '▶' : '⏸';
    saveState();
  };

  const togglePause = () => {
    const now = Date.now();
    if (state.paused) {
      state.pausedSegments[state.pausedSegments.length - 1].end = now;
    } else {
      state.pausedSegments.push({ start: now });
    }
    state.paused = !state.paused;
    render();
  };

  const removeTimer = () => {
    clearInterval(interval);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    box?.remove();
    box = state = null;
    localStorage.removeItem(KEY);
  };

  const stopTimer = () => {
    if (!confirm('Are you sure you want to stop the timer?')) return;
    const data = { time: elapsed(), difficulty: state.difficulty, source: state.source };
    const fail = () => alert('CodeClock could not save this session. Reload the page and try again; your timer is still running.');
    try {
      chrome.runtime.sendMessage({ type: 'TIMER_STOPPED', data }, (res) => {
        if (chrome.runtime.lastError || !res?.ok) fail();
        else removeTimer();
      });
    } catch {
      fail(); // extension was reloaded; this script is stale
    }
  };

  const onMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    box.style.left = `${e.clientX - drag.x}px`;
    box.style.top = `${e.clientY - drag.y}px`;
  };
  const onUp = () => {
    if (drag) saveState();
    drag = null;
  };

  const button = (text, onClick) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.style.cssText = 'background:none;border:none;color:#ffa116;cursor:pointer;padding:0;font-size:16px;';
    b.onclick = onClick;
    return b;
  };

  const injectTimer = (init) => {
    if (box) removeTimer();
    state = { pausedSegments: [], paused: false, startTime: Date.now(), ...init };

    const paper = window.codeclock_colors?.background?.paper || '#1e1e1e';
    const pos = state.pos || { x: 20, y: 20 };
    box = document.createElement('div');
    box.id = 'codeclock-timer-container';
    box.style.cssText = `position:fixed;top:${pos.y}px;left:${pos.x}px;z-index:2147483647;background:${paper};
      padding:6px 12px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;
      gap:8px;white-space:nowrap;cursor:move;user-select:none;`;

    const dot = document.createElement('div');
    dot.style.cssText = 'width:8px;height:8px;background:#ff375f;border-radius:50%;';

    timeEl = document.createElement('div');
    timeEl.style.cssText = 'color:white;font-family:monospace;font-size:14px;';

    const select = document.createElement('select');
    select.style.cssText = 'background:#333;color:white;border:none;border-radius:4px;font-size:12px;cursor:pointer;';
    DIFFICULTIES.forEach((d) => select.add(new Option(d, d, false, d === state.difficulty)));
    select.onchange = () => {
      state.difficulty = select.value;
      saveState();
    };
    select.onmousedown = (e) => e.stopPropagation(); // don't start a drag from the dropdown

    pauseBtn = button('⏸', togglePause);
    box.append(dot, timeEl, select, pauseBtn, button('⏹', stopTimer));
    document.body.appendChild(box);

    box.addEventListener('mousedown', (e) => {
      drag = { x: e.clientX - box.offsetLeft, y: e.clientY - box.offsetTop };
    });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    interval = setInterval(() => !state.paused && render(), 1000);
    render();
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_TIMER') {
      if (box && !confirm('A timer is already running. Stop it and start a new one?')) {
        sendResponse({ ok: false });
      } else {
        injectTimer({ difficulty: message.difficulty, source: message.source });
        sendResponse({ ok: true });
      }
    }
  });

  // Bring back a running timer after refresh / navigation.
  const saved = loadState();
  if (saved) injectTimer(saved);
}
