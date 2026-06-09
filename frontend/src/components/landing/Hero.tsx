"use client";


import { Button } from "@/components/ui/button";
import { Ripple } from "../app_ui_element/RippleBg";

import Link from "next/link";

export default function HeroSection() {
  return (
    <Ripple className="flex items-center justify-center">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur">
          🚀 The future of social media marketing
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-7xl">
          Supercharge Your
          <br />
          <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Marketing Strategy
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
          The all-in-one platform to plan, schedule, collaborate, and analyze your social media marketing. Grow your audience faster and save hours every week.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="h-12 px-8 text-base">Get Started Free</Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 border-border text-foreground hover:bg-muted">
              Explore Features
            </Button>
          </Link>
        </div>
      </div>
    </Ripple>
  );
}
