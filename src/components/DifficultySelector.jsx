import React from 'react';
import styled from '@emotion/styled';
import { colors } from '../theme/colors';

const PopupContainer = styled.div`
  width: 280px;
  padding: 24px;
  background: ${colors.background.default};
  color: ${colors.text.primary};
`;

const Title = styled.h2`
  margin: 0 0 16px;
  color: ${colors.text.primary};
`;

const DifficultyButton = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: ${colors.text.primary};
  background: ${props => colors.difficulty[props.level]};
  
  &:hover {
    opacity: 0.9;
  }
`;

const AnalyticsLink = styled.a`
  display: block;
  margin-top: 16px;
  color: ${colors.secondary.main};
  text-decoration: none;
  text-align: center;
  
  &:hover {
    color: ${colors.secondary.light};
  }
`;

const DifficultySelector = ({ onSelectDifficulty }) => {
  return (
    <PopupContainer>
      <Title>Select Problem Difficulty</Title>
      <DifficultyButton 
        level="easy"
        onClick={() => onSelectDifficulty('easy')}
      >
        Easy
      </DifficultyButton>
      <DifficultyButton 
        level="medium"
        onClick={() => onSelectDifficulty('medium')}
      >
        Medium
      </DifficultyButton>
      <DifficultyButton 
        level="hard"
        onClick={() => onSelectDifficulty('hard')}
      >
        Hard
      </DifficultyButton>
      <AnalyticsLink href="#/analytics">View Analysis</AnalyticsLink>
    </PopupContainer>
  );
};

export default DifficultySelector; 