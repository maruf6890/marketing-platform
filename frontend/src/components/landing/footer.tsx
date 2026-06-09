import { AreaChart, Dribbble, Github, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-6 px-4 py-12 text-center sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <AreaChart className="h-6 w-6 text-primary" />
          <span>Marketo</span>
        </Link>
        <nav className="flex flex-col flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground sm:flex-row sm:gap-6">
          <Link href="#" className="hover:text-foreground hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#" className="hover:text-foreground hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#" className="hover:text-foreground hover:underline underline-offset-4">
            API
          </Link>
          <Link href="#" className="hover:text-foreground hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="#" className="hover:text-foreground hover:underline underline-offset-4">
            Terms
          </Link>
        </nav>
        <nav className="flex items-center gap-5 text-muted-foreground">
          <a href="#" className="hover:text-foreground" target="_blank" rel="noreferrer noopener">
            <Instagram className="size-5" />
            <span className="sr-only">Instagram</span>
          </a>
          <a href="#" className="hover:text-foreground" target="_blank" rel="noreferrer noopener">
            <Linkedin className="size-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href="#" className="hover:text-foreground" target="_blank" rel="noreferrer noopener">
            <Github className="size-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 Marketo, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
