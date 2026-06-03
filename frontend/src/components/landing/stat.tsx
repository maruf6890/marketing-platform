interface StatisticsItem {
  name: string;
  description: string;
}

const statisticsSample: StatisticsItem[] = [
  { name: "40 Million", description: "Bookmarks saved" },
  { name: "100k", description: "Monthly Active Users" },
  { name: "2.1 Billion", description: "Cached Pages" },
  { name: "400k", description: "Monthly Images Served" },
];

export default function LandingPageStatistics() {
  return (
    <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 divide-x-0 bg-background px-4 py-12 text-center sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:py-20">
      {statisticsSample.map((details: StatisticsItem, index: number) => (
        <div key={index} className="px-5">
          <h3 className="mb-2 text-3xl font-extrabold">{details.name}</h3>
          <p className="text-muted-foreground">{details.description}</p>
        </div>
      ))}
    </section>
  );
}
