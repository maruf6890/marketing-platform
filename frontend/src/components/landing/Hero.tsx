"use client";


import { Button } from "@/components/ui/button";
import { Ripple } from "../app_ui_element/RippleBg";

export default function HeroSection() {
  return (
    <Ripple className="flex items-center justify-center">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70 backdrop-blur">
          🚀 Build faster with modern UI
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Beautiful Interfaces
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Start With One Component
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-base text-white/60 sm:text-lg">
          A modern Next.js starter with elegant animations, reusable components,
          and production-ready architecture.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            View Docs
          </Button>
        </div>
      </div>
    </Ripple>
  );
}
