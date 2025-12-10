import { Button } from "@/components/ui/button";
import { Language } from "@/lib/checkin-translations";

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => onLanguageChange("en")}
        className="gap-2"
      >
        🇬🇧 English
      </Button>
      <Button
        variant={language === "pt" ? "default" : "outline"}
        size="sm"
        onClick={() => onLanguageChange("pt")}
        className="gap-2"
      >
        🇵🇹 Português
      </Button>
    </div>
  );
}
