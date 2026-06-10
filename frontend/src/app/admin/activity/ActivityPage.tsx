import React from 'react'
import StatCard from './StatCard';
import { Brain, CalendarClock, FileEdit, LogIn, Send } from 'lucide-react';
import RecentActivitiesTable from './ActivityTable';
import ActivityTrend from './ActivityTreand';
export default function ActivityPage() {
      const activities = [
    {
      id: 1,
      activity_type: "login",
      title: "User Logged In",
      description: "Login from Chrome browser",
      user_name: "Maruf",
      created_at: "2026-06-10T08:00:00Z",
    },
    {
      id: 2,
      activity_type: "ai_use",
      title: "AI Generated Post",
      description: "Generated marketing content",
      user_name: "Rahim",
      created_at: "2026-06-10T09:10:00Z",
    },
    {
      id: 3,
      activity_type: "schedule_post",
      title: "Post Scheduled",
      description: "Scheduled for 5 PM",
      user_name: "Karim",
      created_at: "2026-06-10T10:30:00Z",
    },
  ];
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold mb-4">Activity Page</h1>
      </div>
      <div>
        <div className="bg-muted p-6 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard icon={<LogIn />} count={120} title="Logins" />
          <StatCard icon={<Brain />} count={45} title="AI Uses" />
          <StatCard icon={<Send />} count={78} title="Direct Posts" />
          <StatCard icon={<FileEdit />} count={32} title="Draft Posts" />
          <StatCard icon={<CalendarClock />} count={18} title="Scheduled" />
        </div>
      </div>
      <div className="p-6 bg-background min-h-screen">
        <RecentActivitiesTable data={activities} />
      </div>

      <div className=" bg-background ">
        <ActivityTrend data={activitiesData} />
      </div>
    </div>
  );
}
 const activitiesData = [
   {
     id: 1,
     activity_type: "login",
     created_at: "2026-06-20T08:00:00Z",
   },
   {
     id: 2,
     activity_type: "ai_use",
     created_at: "2026-06-10T08:10:00Z",
   },
   {
     id: 3,
     activity_type: "schedule_post",
     created_at: "2026-06-15T10:10:00Z",
   },
   {
     id: 4,
     activity_type: "login",
     created_at: "2026-06-01T11:00:00Z",
   },
 ];