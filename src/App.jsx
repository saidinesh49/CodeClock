import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/chartRegister';
import { setupChromeMock } from './utils/chromeMock';
import DifficultySelector from './components/DifficultySelector';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PopupAnalytics from './components/PopupAnalytics';

// Setup Chrome mock for development
if (import.meta.env.DEV) {
  setupChromeMock();
}

const send = (tabId, msg) =>
  new Promise((resolve) =>
    chrome.tabs.sendMessage(tabId, msg, (res) => resolve(chrome.runtime.lastError ? null : res))
  );

const App = () => {
  const [error, setError] = useState('');

  const handleStart = async (source, difficulty) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return setError('No active tab found');

    const msg = { type: 'START_TIMER', source, difficulty };
    let res = await send(tab.id, msg);
    if (!res) {
      // Page has no live content script (e.g. opened before install/reload): inject it and retry.
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['assets/colors.js', 'assets/content.js']
        });
        res = await send(tab.id, msg);
      } catch {
        return setError('Open a supported problem site first.');
      }
    }
    if (res?.ok) window.close();
  };

  return (
    <Router>
      <Routes>
        <Route path="/analytics" element={<AnalyticsDashboard isPopup={false} />} />
        <Route path="/popup-analytics" element={<PopupAnalytics />} />
        <Route path="/" element={<DifficultySelector onStart={handleStart} error={error} />} />
      </Routes>
    </Router>
  );
};

export default App;
