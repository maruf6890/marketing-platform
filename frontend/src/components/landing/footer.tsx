import { Dribbble, Github, Instagram, Linkedin } from "lucide-react";

;


export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl">
      <div className="flex w-full flex-col items-center justify-center space-y-5 px-4 py-12 text-center">
        Logo
        <nav className="flex flex-col flex-wrap items-center space-y-4 text-xs font-medium text-muted-foreground sm:flex-row sm:space-x-4 sm:space-y-0">
          <a href="#" className="hover:text-foreground">
            Home
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
          <a href="#" className="hover:text-foreground">
            Docs
          </a>
          <a href="#" className="hover:text-foreground">
            API
          </a>
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
        </nav>
        <nav className="flex items-center gap-4 text-muted-foreground">
          <a href="#" target="_blank" rel="noreferrer noopener">
            <Dribbble className="size-5" />
          </a>
          <a href="#" target="_blank" rel="noreferrer noopener">
            <Github className="size-5" />
          </a>
          <a href="#" target="_blank" rel="noreferrer noopener">
            <Instagram className="size-5" />
          </a>
          <a href="#" target="_blank" rel="noreferrer noopener">
            <Linkedin className="size-5" />
          </a>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 MynaUI, Inc.</p>
      </div>
    </footer>
  );
}
