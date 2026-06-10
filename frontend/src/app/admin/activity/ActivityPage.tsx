"use client"

import React, { useEffect, useState } from 'react'
import StatCard from './StatCard';
import { Brain, CalendarClock, FileEdit, Loader2, LogIn, Send } from 'lucide-react';
import RecentActivitiesTable from './ActivityTable';
import ActivityTrend from './ActivityTreand';
import { private_api_call } from '@/actions/parivate_api_calll';
import { toast } from 'sonner';

type Activity = {
  id: number;
  activity_type: string;
  title: string;
  description?: string;
  user_name: string;
  created_at: string;
};

export default function ActivityPage() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);


  // const activities = [
  //   {
  //     id: 1,
  //     activity_type: "login",
  //     title: "User Logged In",
  //     description: "Login from Chrome browser",
  //     user_name: "Maruf",
  //     created_at: "2026-06-10T08:00:00Z",
  //   },
  //   {
  //     id: 2,
  //     activity_type: "ai_use",
  //     title: "AI Generated Post",
  //     description: "Generated marketing content",
  //     user_name: "Rahim",
  //     created_at: "2026-06-10T09:10:00Z",
  //   },
  //   {
  //     id: 3,
  //     activity_type: "schedule_post",
  //     title: "Post Scheduled",
  //     description: "Scheduled for 5 PM",
  //     user_name: "Karim",
  //     created_at: "2026-06-10T10:30:00Z",
  //   },
  // ];

  const fetchActivity = async () => {
    try {
      setLoading(true);

      const response = await private_api_call({
        path: "/analytics",
        method: "GET",
      });

      if (response.success) {
        setActivities(response.data);

      } else {
        toast.error(response.message);
        console.error("Failed to fetch feed:", response.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Facebook feed");
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
            <Loader2 className="size-8 animate-spin text-muted-foreground" /> Loading posts...
          </h1>
        </div>
      )}

      <div>
        <div className="bg-muted px-6 pb-4 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard icon={<LogIn />} count={120} title="Logins" />
          <StatCard icon={<Brain />} count={45} title="AI Uses" />
          <StatCard icon={<Send />} count={78} title="Direct Posts" />
          <StatCard icon={<FileEdit />} count={32} title="Draft Posts" />
          <StatCard icon={<CalendarClock />} count={18} title="Scheduled" />
        </div>
      </div>
      <div className="p-6 bg-background">
        <RecentActivitiesTable data={activities} />
      </div>

      <div className="bg-background p-6">
        <ActivityTrend data={activities} />
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