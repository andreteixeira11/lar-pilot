import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MockupProps {
  children: ReactNode;
  className?: string;
}

export function Mockup({ children, className }: MockupProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

interface MockupFrameProps {
  children: ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
}

export function MockupFrame({ children, className, size = "medium" }: MockupFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-b from-muted/50 to-muted",
        "border border-border/50 shadow-2xl",
        {
          "p-1": size === "small",
          "p-2": size === "medium",
          "p-3": size === "large",
        },
        className
      )}
    >
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 pb-2 px-1">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 h-4 rounded bg-muted-foreground/10" />
      </div>
      <div className="overflow-hidden rounded-lg bg-background">
        {children}
      </div>
    </div>
  );
}
