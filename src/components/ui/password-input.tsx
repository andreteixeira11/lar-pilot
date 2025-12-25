import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState((value as string) || "");

    React.useEffect(() => {
      if (value !== undefined) {
        setPassword(value as string);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      onChange?.(e);
    };

    const requirements = [
      { text: "Pelo menos 8 caracteres", met: password.length >= 8 },
      { text: "Pelo menos 1 número", met: /\d/.test(password) },
      { text: "Pelo menos 1 letra minúscula", met: /[a-z]/.test(password) },
      { text: "Pelo menos 1 letra maiúscula", met: /[A-Z]/.test(password) },
    ];

    const strengthScore = requirements.filter((r) => r.met).length;
    
    const getStrengthColor = () => {
      if (strengthScore === 0) return "bg-border";
      if (strengthScore <= 1) return "bg-red-500";
      if (strengthScore <= 2) return "bg-orange-500";
      if (strengthScore <= 3) return "bg-amber-500";
      return "bg-emerald-500";
    };

    const getStrengthText = () => {
      if (strengthScore === 0) return "Introduza uma palavra-passe";
      if (strengthScore <= 1) return "Fraca";
      if (strengthScore <= 2) return "Razoável";
      if (strengthScore <= 3) return "Boa";
      return "Forte";
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            value={password}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {showStrength && password.length > 0 && (
          <div className="space-y-3">
            {/* Strength bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((segment) => (
                <div
                  key={segment}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300",
                    strengthScore >= segment ? getStrengthColor() : "bg-border"
                  )}
                />
              ))}
            </div>

            {/* Strength text */}
            <p className={cn(
              "text-sm font-medium transition-colors",
              strengthScore <= 1 && "text-red-500",
              strengthScore === 2 && "text-orange-500",
              strengthScore === 3 && "text-amber-500",
              strengthScore === 4 && "text-emerald-500"
            )}>
              {getStrengthText()}
            </p>

            {/* Requirements list */}
            <ul className="space-y-1.5">
              {requirements.map((req, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    req.met ? "text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  {req.met ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  <span>{req.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
