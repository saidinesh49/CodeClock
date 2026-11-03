import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { colors } from '../theme/colors';
import { SOURCES, detectSource } from '../utils/storage';

const Container = styled.div`
  padding: 12px;
  width: 200px;
  background: ${colors.background.default};
`;

const Title = styled.h2`
  color: ${colors.text.primary};
  font-size: 16px;
  margin: 0 0 12px 0;
  text-align: center;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  color: black;
  
  &:hover {
    opacity: 0.9;
  }

  ${({ difficulty }) => {
    switch (difficulty) {
      case 'easy':
        return `background: ${colors.difficulty.easy};`;
      case 'medium':
        return `background: ${colors.difficulty.medium};`;
      case 'hard':
        return `background: ${colors.difficulty.hard};`;
      case 'easy-medium':
        return `background: ${colors.difficulty.easy_medium}; filter: brightness(1.1);`;
      case 'medium-hard':
        return `background: ${colors.difficulty.medium_hard}; filter: brightness(0.9);`;
      default:
        return `background: ${colors.primary.main};`;
    }
  }}
`;

const AnalyticsLink = styled.a`
  display: block;
  margin-top: 12px;
  color: #d874ed;
  text-decoration: none;
  text-align: center;
  font-size: 13px;
  
  &:hover {
    color: #c014e2;
    text-decoration: underline;
  }
`;

const SourceSelect = styled.select`
  width: 100%;
  margin-bottom: 12px;
  padding: 6px;
  background: ${colors.background.paper};
  color: ${colors.text.primary};
  border: 1px solid ${colors.primary.light};
  border-radius: 4px;
`;

const ErrorText = styled.div`
  color: #ff375f;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const LEVELS = [
  ['easy', 'Easy'],
  ['medium', 'Medium'],
  ['hard', 'Hard'],
  ['easy-medium', 'Easy-Medium'],
  ['medium-hard', 'Medium-Hard']
];

const DifficultySelector = ({ onStart, error }) => {
  const [source, setSource] = useState('');

  // Auto-detect from the active tab; the user can still change it.
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setSource(detectSource(tabs[0]?.url) || '');
    });
  }, []);

  return (
    <Container>
      <Title>Select Source & Difficulty</Title>
      <SourceSelect value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="" disabled>Source</option>
        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
      </SourceSelect>
      <ButtonGrid>
        {LEVELS.map(([level, label]) => (
          <Button
            key={level}
            difficulty={level}
            disabled={!source}
            onClick={() => onStart(source, level)}
            style={level === 'medium-hard' ? { gridColumn: 'span 2' } : undefined}
          >
            {label}
          </Button>
        ))}
      </ButtonGrid>
      {error && <ErrorText>{error}</ErrorText>}
      <AnalyticsLink href="#/analytics">View Analysis</AnalyticsLink>
    </Container>
  );
};

export default DifficultySelector;
