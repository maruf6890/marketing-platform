import React from 'react'
import { getFacebookAnalyticsById } from '../action';
import AnalyticsDetails from './AnalyticsDetails';

export default async function page({ params }: { params: { analytics_id: string } }) {
    const { analytics_id } = await params;
    const analyticsData = await getFacebookAnalyticsById(analytics_id);
    if (!analyticsData) {
        return (
            <div>
                <h1>Analytics not found</h1>
                <p>The requested analytics data could not be found.</p>
            </div>
        )
    }
    console.log("Analytics Data for ID:", analyticsData);
    return <AnalyticsDetails data={analyticsData} />;
}
