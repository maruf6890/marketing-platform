import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans text-foreground">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between rounded-3xl border border-border bg-card px-16 py-32 shadow-sm sm:items-start">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
          Loading...
        </h1>
      </main>
    </div>
  );
}
