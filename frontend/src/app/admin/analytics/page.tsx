import React from 'react'
import { getAnalyticsData } from './action';
import AnalyticsPage from './AnalyticsPage';

export default async function page() {
    const analyticsData = await getAnalyticsData();
    console.log("Analytics Data:", analyticsData);
  return <AnalyticsPage analyticsData={analyticsData} />;
}
