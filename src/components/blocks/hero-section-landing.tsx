"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
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
        "text-foreground relative",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0 min-h-[85vh] flex items-center"
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image.src})` }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

      {/* Background glow */}
      <Glow variant="top" className="opacity-20" />

      <div className="mx-auto flex max-w-6xl flex-col gap-12 pt-16 sm:gap-16 relative z-10">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-10">
          {/* Badge */}
          {badge && (
            <Badge
              variant="outline"
              className="gap-2 py-1.5 pl-3 pr-2 animate-fade-in rounded-full border-white/30 bg-white/10 backdrop-blur-sm"
            >
              <span className="text-white/90">{badge.text}</span>
              {badge.action && (
                <button
                  onClick={badge.action.onClick}
                  className="flex items-center gap-1 font-medium text-white hover:underline"
                >
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </button>
              )}
            </Badge>
          )}

          {/* Title */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in [animation-delay:100ms] text-white drop-shadow-lg">
            {title}
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-lg sm:text-xl animate-fade-in [animation-delay:200ms] text-white/90 drop-shadow-md">
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
                    "relative overflow-hidden bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-shadow",
                  action.variant === "outline" &&
                    "border-white/50 text-white hover:bg-white/10 hover:text-white"
                )}
              >
                {action.text}
                {action.icon && <span className="ml-2">{action.icon}</span>}
              </Button>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <p className="text-sm text-white/80 animate-fade-in [animation-delay:400ms] drop-shadow-sm">
              {stats}
            </p>
          )}
        </div>
      </div>

      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
}
