"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      <div className="absolute inset-0 bg-primary/90 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply"></div>
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <h2 className="text-balance text-4xl font-extrabold sm:text-5xl md:text-6xl text-white">
          Ready to supercharge your social media?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl text-white/80">
          Join thousands of marketers who are already using Marketo to grow their audience and save hours every week.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">
              Get Started Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-primary-foreground/30 text-white hover:bg-primary-foreground/10 font-semibold">
              Explore the Platform
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}