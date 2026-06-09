interface StatisticsItem {
  name: string;
  description: string;
}

const statisticsSample: StatisticsItem[] = [
  { name: "10M+", description: "Posts Scheduled" },
  { name: "50k+", description: "Marketers & Creators" },
  { name: "99.9%", description: "Platform Uptime" },
  { name: "500k+", description: "Accounts Connected" },
];

export default function LandingPageStatistics() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 divide-y sm:divide-y-0 sm:divide-x border-y bg-background px-4 py-12 text-center sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
      {statisticsSample.map((details: StatisticsItem, index: number) => (
        <div key={index} className="px-5 py-4 sm:py-0">
          <h3 className="mb-2 text-4xl font-extrabold text-primary">{details.name}</h3>
          <p className="text-muted-foreground font-medium">{details.description}</p>
        </div>
      ))}
    </section>
  );
}
