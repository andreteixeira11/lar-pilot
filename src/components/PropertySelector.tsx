import { Building2, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperty } from "@/contexts/PropertyContext";
import { AddPropertyDialog } from "./AddPropertyDialog";

export const PropertySelector = () => {
  const { properties, selectedPropertyId, setSelectedPropertyId, selectedProperty } = useProperty();

  return (
    <div className="px-4 py-3 border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
        <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border hover:bg-sidebar-border transition-colors">
          <div className="flex items-center gap-3 w-full">
            <Building2 className="h-5 w-5 text-sidebar-primary shrink-0" />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate w-full">
                {selectedProperty?.name}
              </span>
              <span className="text-xs text-sidebar-foreground/70 truncate w-full">
                {selectedProperty?.address}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/70 shrink-0" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex flex-col">
                <span className="font-medium">{property.name}</span>
                <span className="text-xs text-muted-foreground">
                  {property.address}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AddPropertyDialog />
      </div>
    </div>
  );
};
