import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/chartRegister';
import DifficultySelector from './components/DifficultySelector';
import FloatingTimer from './components/FloatingTimer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { saveTimerData } from './utils/storage';

const App = () => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setIsTimerActive(true);
    // Send message to content script to inject timer
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'START_TIMER',
        difficulty: selectedDifficulty
      });
    });
    window.close(); // Close popup after selection
  };

  const handleTimerStop = async (time) => {
    try {
      await saveTimerData({
        difficulty,
        time,
        date: new Date().toISOString()
      });
      // Reset states
      setIsTimerActive(false);
      setDifficulty(null);
      
      // Notify content script to clean up
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_TIMER' });
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert('There was an error saving your time. Please try again.');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route
          path="/"
          element={
            isTimerActive ? (
              <FloatingTimer onStop={handleTimerStop} />
            ) : (
              <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
