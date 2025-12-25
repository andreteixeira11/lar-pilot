import { cn } from "@/lib/utils";

interface GlowProps {
  variant?: "top" | "bottom" | "left" | "right" | "center";
  className?: string;
}

export function Glow({ variant = "top", className }: GlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute",
        {
          "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2": variant === "top",
          "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2": variant === "bottom",
          "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2": variant === "left",
          "right-0 top-1/2 -translate-y-1/2 translate-x-1/2": variant === "right",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2": variant === "center",
        },
        className
      )}
    >
      <div
        className={cn(
          "h-[600px] w-[600px] rounded-full",
          "bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30",
          "blur-[100px] opacity-50"
        )}
      />
    </div>
  );
}
