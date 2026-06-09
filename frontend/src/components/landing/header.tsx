

import { buttonVariants } from "@/components/ui/button";
import { AreaChart, Menu } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <AreaChart className="h-6 w-6 text-primary" />
          <span>Marketo</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link
            href="#features"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Testimonials
          </Link>
          <Link
            href="#pricing"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Company
          </Link>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
          <Link href="/auth/register" className={buttonVariants({ size: "sm" })}>
            Get Started
          </Link>
        </div>
        <button className="inline-flex p-1.5 md:hidden">
          <Menu />
          <span className="sr-only">Open Menu</span>
        </button>
      </div>
    </header>
  );
}