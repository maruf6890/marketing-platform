"use client";

import { buttonVariants } from "@/components/ui/button";

interface GlobalErrorPageProps {
  code?: string | number; 
  title?: string; 
  description?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
  };
}

export default function GlobalErrorPage({
  code = "500",
  title = "Something went wrong",
  description = "Oops! An unexpected error occurred. Please try again later.",
  primaryAction,
  secondaryAction,
}: GlobalErrorPageProps) {
  return (
    <div className="flex justify-center items-center w-full h-screen bg-background">
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-32 text-center">
        <span className="font-semibold uppercase text-muted-foreground text-xl">
          {code}
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="text-muted-foreground">{description}</p>

        <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-4 mt-4">
          {primaryAction &&
            (primaryAction.href ? (
              <a
                href={primaryAction.href}
                className={buttonVariants({
                  variant: primaryAction.variant || "default",
                  size: "sm",
                })}
              >
                {primaryAction.label}
              </a>
            ) : (
              <button
                onClick={primaryAction.onClick}
                className={buttonVariants({
                  variant: primaryAction.variant || "default",
                  size: "sm",
                })}
              >
                {primaryAction.label}
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                className={buttonVariants({
                  variant: secondaryAction.variant || "outline",
                  size: "sm",
                })}
              >
                {secondaryAction.label}
              </a>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className={buttonVariants({
                  variant: secondaryAction.variant || "outline",
                  size: "sm",
                })}
              >
                {secondaryAction.label}
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
