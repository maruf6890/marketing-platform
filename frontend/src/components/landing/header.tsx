

import { buttonVariants } from "@/components/ui/button";
import { Menu } from "lucide-react";


export default function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        Logo
        <div className="hidden md:inline-flex">
          <a
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Features
          </a>
          <a
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Pricing
          </a>
          <a
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Blog
          </a>
          <a
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Company
          </a>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <a
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign in
          </a>
          <a href="#" className={buttonVariants({ size: "sm" })}>
            Get Started
          </a>
        </div>
        <button className="inline-flex p-1.5 md:hidden">
          <Menu />
          <span className="sr-only">Open Menu</span>
        </button>
      </div>
    </header>
  );
}