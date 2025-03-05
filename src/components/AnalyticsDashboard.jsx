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

const AnalyticsDashboard = () => {
  const [data, setData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [platformFilter, setPlatformFilter] = useState('all');

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
    let filtered = [...data];
    
    if (platformFilter !== 'all') {
      if (platformFilter === 'Other') {
        // For 'Other', show only data from unsupported platforms
        filtered = filtered.filter(item => {
          const url = item.url.toLowerCase();
          return !Object.values(SUPPORTED_PLATFORMS).some(domain => 
            url.includes(domain.toLowerCase())
          );
        });
      } else if (platformFilter !== 'all') {
        // For specific platforms, filter by domain
        const domain = SUPPORTED_PLATFORMS[platformFilter];
        filtered = filtered.filter(item => 
          item.url.toLowerCase().includes(domain.toLowerCase())
        );
      }
    }
    
    // If not showing 'Other', exclude unsupported platforms from 'all'
    if (platformFilter === 'all') {
      filtered = filtered.filter(item => {
        const url = item.url.toLowerCase();
        return Object.values(SUPPORTED_PLATFORMS).some(domain => 
          url.includes(domain.toLowerCase())
        );
      });
    }

    const now = Date.now();
    const timeFilters = {
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
      year: now - 365 * 24 * 60 * 60 * 1000
    };

    return filtered.filter(item => item.timestamp >= timeFilters[timeFilter]);
  };

  const processData = (data) => {
    return {
      byPlatform: data.reduce((acc, item) => {
        const platform = item.platform;
        if (!acc[platform]) acc[platform] = [];
        acc[platform].push(item);
        return acc;
      }, {}),
      // ... rest of the processing
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
    </DashboardContainer>
  );
};

export default AnalyticsDashboard; 