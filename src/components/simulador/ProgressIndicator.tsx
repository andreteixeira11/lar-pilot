import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (step: number) => void;
}

export const ProgressIndicator = ({
  currentStep,
  steps,
  onStepClick,
}: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isClickable = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                    isCompleted && "bg-primary text-primary-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {step.name}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 md:w-16 h-0.5 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
