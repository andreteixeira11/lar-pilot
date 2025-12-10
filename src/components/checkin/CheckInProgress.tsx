import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface CheckInProgressProps {
  currentStep: number;
  steps: Step[];
}

export function CheckInProgress({ currentStep, steps }: CheckInProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
              currentStep > step.id
                ? "bg-primary text-primary-foreground"
                : currentStep === step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step.id ? (
              <Check className="h-4 w-4" />
            ) : (
              step.id
            )}
          </div>
          <span
            className={cn(
              "ml-2 text-sm hidden sm:inline",
              currentStep >= step.id
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-16 h-0.5 mx-2",
                currentStep > step.id ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
