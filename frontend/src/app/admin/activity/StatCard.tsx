"use client";

import { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  count: number | string;
  title: string;
};

export default function StatCard({ icon, count, title }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-4 hover:bg-accent/20 transition">
      <div className="flex items-center gap-3">
        {/* icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>

        {/* text */}
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h2 className="text-2xl font-semibold text-foreground">{count}</h2>
        </div>
      </div>
    </div>
  );
}
