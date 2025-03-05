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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const timerData = await getTimerData();
    setData(timerData);
  };

  const getFilteredData = () => {
    let filtered = [...data];
    
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item => item.platform === platformFilter);
    }

    const now = Date.now();
    const timeFilters = {
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
      year: now - 365 * 24 * 60 * 60 * 1000
    };

    return filtered.filter(item => item.timestamp >= timeFilters[timeFilter]);
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
            <option value="LeetCode">LeetCode</option>
            <option value="CodeForces">CodeForces</option>
            <option value="CodeChef">CodeChef</option>
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