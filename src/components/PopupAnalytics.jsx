import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

const PopupAnalytics = () => {
  return (
    <div style={{ width: '400px', maxHeight: '500px', overflow: 'auto' }}>
      <AnalyticsDashboard isPopup={true} />
    </div>
  );
};

export default PopupAnalytics; 