import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Line, Bar } from 'react-chartjs-2';
import { colors } from '../theme/colors';
import { getTimerData } from '../utils/storage';
import { chartOptions, getChartData, getDifficultyDistribution } from '../utils/chartUtils';

const DashboardContainer = styled.div`
  padding: 24px;
  background: ${colors.background.default};
  min-height: 100vh;
  color: ${colors.text.primary};
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.text.primary};
  margin-bottom: 16px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const Select = styled.select`
  background: ${colors.background.paper};
  color: ${colors.text.primary};
  padding: 8px;
  border: 1px solid ${colors.primary.light};
  border-radius: 4px;
`;

const ChartContainer = styled.div`
  background: ${colors.background.paper};
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const DifficultyBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return colors.difficulty.easy;
      case 'medium': return colors.difficulty.medium;
      case 'hard': return colors.difficulty.hard;
      case 'easy-medium': return colors.difficulty.easy_medium;
      case 'medium-hard': return colors.difficulty.medium_hard;
      default: return colors.text.secondary;
    }
  }};
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${colors.background.paper};
  padding: 16px;
  border-radius: 8px;
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.text.secondary};
`;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const SUPPORTED_PLATFORMS = {
    LeetCode: 'leetcode.com',
    CodeForces: 'codeforces.com',
    CodeChef: 'codechef.com',
    GeeksforGeeks: 'geeksforgeeks.org',
    AtCoder: 'atcoder.jp',
    HackerEarth: 'hackerearth.com',
    HackerRank: 'hackerrank.com'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const timerData = await getTimerData();
    // Validate and clean data
    const validData = timerData.filter(item => {
      // Check if all required fields exist and are of correct type
      if (!item.time || typeof item.time !== 'number') return false;
      if (!item.difficulty || typeof item.difficulty !== 'string') return false;
      if (!item.url || typeof item.url !== 'string') return false;
      if (!item.timestamp || typeof item.timestamp !== 'number') return false;
      
      // Validate time is reasonable (less than 24 hours)
      if (item.time < 0 || item.time > 86400) return false;
      
      return true;
    });
    
    setData(validData);
  };

  const getFilteredData = () => {
    let filteredData = [...data];

    // Platform filtering
    if (platformFilter !== 'all') {
      if (platformFilter === 'Other') {
        filteredData = filteredData.filter(item => {
          const url = item.url.toLowerCase();
          return !Object.values(SUPPORTED_PLATFORMS).some(domain => 
            url.includes(domain.toLowerCase())
          );
        });
      } else if (platformFilter !== 'all') {
        const domain = SUPPORTED_PLATFORMS[platformFilter];
        filteredData = filteredData.filter(item => 
          item.url.toLowerCase().includes(domain.toLowerCase())
        );
      }
    }

    // Difficulty filtering
    if (difficultyFilter !== 'all') {
      filteredData = filteredData.filter(item => 
        item.difficulty === difficultyFilter
      );
    }

    // Time period filtering
    const now = Date.now();
    const timeRanges = {
      week: now - (7 * 24 * 60 * 60 * 1000),
      month: now - (30 * 24 * 60 * 60 * 1000),
      year: now - (365 * 24 * 60 * 60 * 1000)
    };

    return filteredData.filter(item => 
      item.timestamp >= timeRanges[timeFilter]
    );
  };

  const processData = (data) => {
    return {
      byDifficulty: data.reduce((acc, item) => {
        const difficulty = item.difficulty;
        if (!acc[difficulty]) {
          acc[difficulty] = {
            count: 0,
            totalTime: 0,
            averageTime: 0,
            bestTime: Infinity,
            worstTime: 0
          };
        }
        
        // Get time in seconds, handle both timeInSeconds and time properties
        const timeInSeconds = item.timeInSeconds || item.time || 0;
        
        // Update stats only if we have valid time
        if (timeInSeconds && timeInSeconds > 0) {
          acc[difficulty].count++;
          acc[difficulty].totalTime += timeInSeconds;
          acc[difficulty].averageTime = Math.round(acc[difficulty].totalTime / acc[difficulty].count);
          acc[difficulty].bestTime = Math.min(acc[difficulty].bestTime, timeInSeconds);
          acc[difficulty].worstTime = Math.max(acc[difficulty].worstTime, timeInSeconds);
        }
        
        return acc;
      }, {})
    };
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Coding Performance Analytics</Title>
        <FilterSection>
          <Select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </Select>
          <Select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All Platforms</option>
            {Object.keys(SUPPORTED_PLATFORMS).map(platform => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
            <option value="Other">Other</option>
          </Select>
          <Select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="easy-medium">Easy-Medium</option>
            <option value="medium-hard">Medium-Hard</option>
          </Select>
        </FilterSection>
      </Header>

      <ChartContainer>
        <Line
          data={getChartData(getFilteredData())}
          options={chartOptions}
        />
      </ChartContainer>

      <ChartContainer>
        <Bar
          data={getDifficultyDistribution(getFilteredData())}
          options={chartOptions}
        />
      </ChartContainer>

      <StatsGrid>
        {Object.entries(processData(getFilteredData()).byDifficulty).map(([difficulty, stats]) => (
          <StatCard key={difficulty}>
            <DifficultyBadge difficulty={difficulty}>
              {difficulty.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join('-')}
            </DifficultyBadge>
            <StatValue>{stats.count} problems</StatValue>
            <StatLabel>Average: {formatTime(stats.averageTime)}</StatLabel>
            <StatLabel>Best: {stats.bestTime === Infinity ? '-' : formatTime(stats.bestTime)}</StatLabel>
            <StatLabel>Worst: {stats.worstTime === 0 ? '-' : formatTime(stats.worstTime)}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard; 