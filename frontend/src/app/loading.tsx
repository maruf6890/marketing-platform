export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Loading Dashboard
        </h1>

        <p className="text-muted-foreground">
          We are building your analytics view...
        </p>

        {/* Typing style animation */}
        <div className="text-primary font-medium">
          <span className="animate-pulse">Processing engagement metrics</span>
          <span className="inline-flex ml-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </div>

        {/* Progress vibe text */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>✔ Fetching posts</p>
          <p>✔ Calculating performance</p>
          <p className="animate-pulse">⏳ Generating insights</p>
        </div>
      </div>
    </div>
  );
}

