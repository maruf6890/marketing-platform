"use client"

import { useEffect, useState } from 'react'
import StatCard from './StatCard';
import { Brain, CalendarClock, FileEdit, Loader2, LogIn, Send } from 'lucide-react';
import RecentActivitiesTable from './ActivityTable';
import ActivityTrend from './ActivityTreand';
import { private_api_call } from '@/actions/parivate_api_calll';
import { toast } from 'sonner';

export type SummaryItem = {
  activity_type:   string;
  total_activity: number;
};

export type RecentActivity = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  activity_type:  string;
  name: string;
};

export type TrendItem = {
  date: string; 
  activity_type:  string;
  total: number;
};

export type ActivityAnalyticsResponse = {
  summary: SummaryItem[];
  recentActivities: RecentActivity[];
  trend: TrendItem[];
};

export default function ActivityPage() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityAnalyticsResponse | null>(null);




  const fetchActivity = async () => {
    try {
      setLoading(true);

      const response = await private_api_call({
        path: "analytics",
        method: "GET",
      });
     console.log("API response for analytics:", response);

      if (response.success) {
        setActivities(response.data);

      } else {
        toast.error(response.message);
        console.error("Failed to fetch feed:", response.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [])

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold mb-4 px-6 pt-4">Activity Page</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-50 py-10">
          <h1 className="text-2xl font-bold text-muted-foreground flex items-center gap-4">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />{" "}
            Loading posts...
          </h1>
        </div>
      )}

      <div>
        <div className="bg-muted px-6 pb-4 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            icon={<LogIn />}
            count={
              activities?.summary.find((item) => item.activity_type === "login")
                ?.total_activity || 0
            }
            title="Logins"
          />
          <StatCard
            icon={<Brain />}
            count={
              activities?.summary.find(
                (item) => item.activity_type === "facebook_analytics_generated",
              )?.total_activity || 0
            }
            title="AI Uses"
          />
          <StatCard
            icon={<Send />}
            count={
              activities?.summary.find(
                (item) => item.activity_type === "post_published",
              )?.total_activity || 0
            }
            title="Direct Posts"
          />
          <StatCard
            icon={<FileEdit />}
            count={
              activities?.summary.find(
                (item) => item.activity_type === "post_draft",
              )?.total_activity || 0
            }
            title="Draft Posts"
          />
          <StatCard
            icon={<CalendarClock />}
            count={
              activities?.summary.find(
                (item) => item.activity_type === "post_scheduled",
              )?.total_activity || 0
            }
            title="Scheduled"
          />
        </div>
      </div>
      <div className="p-6 bg-background">
        <RecentActivitiesTable data={activities?.recentActivities || []} />
      </div>

      <div className="bg-background p-6">
        <ActivityTrend data={activities?.trend || []} />
      </div>
    </div>
  );
}
// const activitiesData = [
//   {
//     id: 1,
//     activity_type: "login",
//     created_at: "2026-06-20T08:00:00Z",
//   },
//   {
//     id: 2,
//     activity_type: "ai_use",
//     created_at: "2026-06-10T08:10:00Z",
//   },
//   {
//     id: 3,
//     activity_type: "schedule_post",
//     created_at: "2026-06-15T10:10:00Z",
//   },
//   {
//     id: 4,
//     activity_type: "login",
//     created_at: "2026-06-01T11:00:00Z",
//   },
// ];