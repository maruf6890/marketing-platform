import {
  CalendarDays,
  Bot,
  ChartPie,
  FolderOpen,
  MessageCircle,
  Share2,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Visual Content Calendar",
    description:
      "Plan your strategy with a drag-and-drop calendar view. easily schedule posts weeks in advance.",
  },
  {
    icon: Share2,
    title: "Multi-Channel Scheduling",
    description:
      "Schedule and publish posts across all major social networks simultaneously from one dashboard.",
  },
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description:
      "Overcome writer's block with our smart AI assistant. Generate engaging captions and hashtags instantly.",
  },
  {
    icon: FolderOpen,
    title: "Unified Media Library",
    description:
      "Store and organize all your creative assets in one central location for your entire team to use.",
  },
  {
    icon: ChartPie,
    title: "Advanced Analytics",
    description:
      "Track engagement, clicks, follower growth, and ROI with beautiful, easy-to-understand reports.",
  },
  {
    icon: MessageCircle,
    title: "Team Collaboration",
    description:
      "Review, approve, and manage workflows with your entire marketing team inside the platform.",
  },
];

const Features = () => {
  return (
    <section id="features" className="flex flex-col items-center justify-center py-24 bg-muted/30">
      <div className="w-full">
        <h2 className="text-center font-bold text-4xl tracking-tight sm:text-5xl">
          Everything you need to grow
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Powerful features designed to help marketers and creators scale their social media presence efficiently.
        </p>
        <div className="mx-auto mt-12 grid max-w-(--breakpoint-lg) gap-6 px-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className="flex flex-col rounded-xl border px-5 py-6"
              key={feature.title}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <feature.icon className="size-5" />
              </div>
              <span className="font-semibold text-lg">{feature.title}</span>
              <p className="mt-1 text-[15px] text-foreground/80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;