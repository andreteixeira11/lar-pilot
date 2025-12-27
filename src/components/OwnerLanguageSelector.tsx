import { useOwnerLanguage, OwnerLanguage, OwnerCurrency } from "@/contexts/OwnerLanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Coins } from "lucide-react";

export function OwnerLanguageSelector() {
  const { language, setLanguage, currency, setCurrency } = useOwnerLanguage();

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={(value) => setLanguage(value as OwnerLanguage)}>
        <SelectTrigger className="w-[130px] bg-background">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={currency} onValueChange={(value) => setCurrency(value as OwnerCurrency)}>
        <SelectTrigger className="w-[100px] bg-background">
          <Coins className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="EUR">€ EUR</SelectItem>
          <SelectItem value="USD">$ USD</SelectItem>
          <SelectItem value="GBP">£ GBP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
