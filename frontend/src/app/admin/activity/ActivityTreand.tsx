"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Activity = {
  id: number;
  activity_type: string;
  title: string;
  description?: string;
  user_name: string;
  created_at: string;
};

type ChartRow = {
  date: string;
  timestamp: number;
  login: number;
  ai_use: number;
  direct_post: number;
  draft_post: number;
  schedule_post: number;
};

const allowedKeys = [
  "login",
  "ai_use",
  "direct_post",
  "draft_post",
  "schedule_post",
] as const;

type Key = (typeof allowedKeys)[number];

export default function ActivityTrend({ data }: { data: Activity[] }) {
  const chartData: ChartRow[] = useMemo(() => {
    const map: Record<string, ChartRow> = {};

    data.forEach((item) => {
      const d = new Date(item.created_at);

      const dateKey = d.toISOString().split("T")[0]; // stable grouping
      const label = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });

      if (!map[dateKey]) {
        map[dateKey] = {
          date: label,
          timestamp: d.getTime(),
          login: 0,
          ai_use: 0,
          direct_post: 0,
          draft_post: 0,
          schedule_post: 0,
        };
      }

      const type = item.activity_type as Key;

      if (allowedKeys.includes(type)) {
        map[dateKey][type]++;
      }
    });

    return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Activity Trend</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />

              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />

              <Legend />

              <Area
                dataKey="login"
                stroke="#6366f1"
                fill="#6366f1"
                name="Login"
              />
              <Area
                dataKey="ai_use"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                name="AI Uses"
              />
              <Area
                dataKey="direct_post"
                stroke="#22c55e"
                fill="#22c55e"
                name="Direct Posts"
              />
              <Area
                dataKey="draft_post"
                stroke="#f59e0b"
                fill="#f59e0b"
                name="Draft Posts"
              />
              <Area
                dataKey="schedule_post"
                stroke="#06b6d4"
                fill="#06b6d4"
                name="Scheduled Posts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
