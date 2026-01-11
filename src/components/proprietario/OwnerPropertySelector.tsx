import { Building2, ChevronDown, Check } from "lucide-react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OwnerPropertySelector() {
  const { owner, switchProperty } = useOwnerAuth();
  const { t } = useOwnerLanguage();

  if (!owner || owner.properties.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2 h-auto py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium truncate">{owner.propertyName}</p>
              <p className="text-xs text-muted-foreground">
                {owner.properties.length} {t("sidebar.properties") || "propriedades"}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {owner.properties.map((property) => (
          <DropdownMenuItem
            key={property.id}
            onClick={() => switchProperty(property.id)}
            className={cn(
              "flex items-center justify-between gap-2 cursor-pointer",
              property.id === owner.propertyId && "bg-primary/10"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{property.name}</p>
              {property.address && (
                <p className="text-xs text-muted-foreground truncate">{property.address}</p>
              )}
            </div>
            {property.id === owner.propertyId && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
