"use client";

import React, { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode; // pass any icon component
  title?: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title = "Nothing Here",
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-2 p-6 ${className}`}
    >
      {icon && <div className="text-4xl text-muted-foreground">{icon}</div>}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
