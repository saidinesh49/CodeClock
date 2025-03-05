import React from 'react';
import styled from '@emotion/styled';
import { colors } from '../theme/colors';

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

const DifficultySelector = ({ onSelectDifficulty }) => {
  return (
    <Container>
      <Title>Select Problem Difficulty</Title>
      <ButtonGrid>
        <Button
          difficulty="easy"
          onClick={() => onSelectDifficulty('easy')}
        >
          Easy
        </Button>
        <Button
          difficulty="medium"
          onClick={() => onSelectDifficulty('medium')}
        >
          Medium
        </Button>
        <Button
          difficulty="hard"
          onClick={() => onSelectDifficulty('hard')}
        >
          Hard
        </Button>
        <Button
          difficulty="easy-medium"
          onClick={() => onSelectDifficulty('easy-medium')}
        >
          Easy-Medium
        </Button>
        <Button
          difficulty="medium-hard"
          onClick={() => onSelectDifficulty('medium-hard')}
          style={{ gridColumn: 'span 2' }}
        >
          Medium-Hard
        </Button>
      </ButtonGrid>
      <AnalyticsLink href="#/analytics">View Analysis</AnalyticsLink>
    </Container>
  );
};

export default DifficultySelector; 