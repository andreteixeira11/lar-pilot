"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: "default" | "glow" | "outline";
}

interface HeroProps {
  badge?: {
    text: string;
    action?: {
      text: string;
      onClick?: () => void;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    src: string;
    alt: string;
  };
  stats?: string;
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
  stats,
}: HeroProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0 relative"
      )}
    >
      {/* Background glow */}
      <Glow variant="top" className="opacity-30" />

      <div className="mx-auto flex max-w-6xl flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge
              variant="outline"
              className="gap-2 py-1.5 pl-3 pr-2 animate-fade-in rounded-full border-primary/20 bg-primary/5"
            >
              <span className="text-muted-foreground">{badge.text}</span>
              {badge.action && (
                <button
                  onClick={badge.action.onClick}
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </button>
              )}
            </Badge>
          )}

          {/* Title */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in [animation-delay:100ms]">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in [animation-delay:200ms]">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in [animation-delay:300ms]">
            {actions.map((action, index) => (
              <Button
                key={index}
                size="lg"
                variant={action.variant === "outline" ? "outline" : "default"}
                onClick={action.onClick}
                className={cn(
                  action.variant === "glow" &&
                    "relative overflow-hidden bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-shadow"
                )}
              >
                {action.text}
                {action.icon && <span className="ml-2">{action.icon}</span>}
              </Button>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <p className="text-sm text-muted-foreground animate-fade-in [animation-delay:400ms]">
              {stats}
            </p>
          )}
        </div>

        {/* Mockup Image */}
        <div className="relative mx-auto w-full max-w-5xl animate-fade-in [animation-delay:500ms]">
          <MockupFrame size="large" className="shadow-2xl">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto aspect-video object-cover"
            />
          </MockupFrame>

          {/* Decorative elements */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-gradient-to-b from-transparent to-background" />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
