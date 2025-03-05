import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { colors } from '../theme/colors';

const TimerContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.background.paper};
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: move;
  user-select: none;
  z-index: 10000;
`;

const LiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #ff375f;
  border-radius: 50%;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

const TimerText = styled.div`
  color: ${colors.text.primary};
  font-family: monospace;
  font-size: 14px;
`;

const StopButton = styled.button`
  background: none;
  border: none;
  color: ${colors.secondary.main};
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${colors.secondary.light};
  }
`;

const FloatingTimer = ({ onStop }) => {
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const timerRef = useRef(null);
  const dragRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    dragRef.current = {
      startX: e.pageX - position.x,
      startY: e.pageY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    
    setPosition({
      x: e.pageX - dragRef.current.startX,
      y: e.pageY - dragRef.current.startY
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const handleStop = async () => {
    if (window.confirm('Are you sure you want to stop the timer?')) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      await onStop(time);
      
      const timerContainer = document.getElementById('codeclock-timer-container');
      if (timerContainer) {
        timerContainer.remove();
      }
    }
  };

  return (
    <TimerContainer
      id="codeclock-timer-container"
      ref={timerRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <LiveIndicator />
      <TimerText>{formatTime(time)}</TimerText>
      <StopButton onClick={handleStop}>⏹</StopButton>
    </TimerContainer>
  );
};

export default FloatingTimer; 