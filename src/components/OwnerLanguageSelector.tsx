import { useOwnerLanguage, OwnerLanguage } from "@/contexts/OwnerLanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function OwnerLanguageSelector() {
  const { language, setLanguage } = useOwnerLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as OwnerLanguage)}>
      <SelectTrigger className="w-[130px]">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt">Português</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
