"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type TrendItem = {
  date: string;
  activity_type: string;
  total: number;
};

type ChartRow = {
  label: string;
  value: number;
};

export default function ActivityTrend({
  data,
}: {
  data: TrendItem[];
}) {
  const chartData: ChartRow[] = useMemo(() => {
    return data.map((item) => ({
      label: `${item.date} • ${item.activity_type}`,
      value: item.total,
    }));
  }, [data]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Activity Trend</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                name="Total Activity"
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}