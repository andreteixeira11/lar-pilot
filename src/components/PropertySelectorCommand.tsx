import { useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProperty } from "@/contexts/PropertyContext";
import { AddPropertyDialog } from "./AddPropertyDialog";

export function PropertySelectorCommand() {
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { properties, selectedPropertyId, setSelectedPropertyId, selectedProperty } = useProperty();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background hover:bg-accent border-border"
          >
            {selectedProperty ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full text-left">
                    {selectedProperty.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {selectedProperty.address}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar propriedade...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar propriedade..." />
            <CommandList>
              <CommandEmpty>Nenhuma propriedade encontrada.</CommandEmpty>
              <CommandGroup heading="Propriedades">
                {properties.map((property) => (
                  <CommandItem
                    key={property.id}
                    value={property.id}
                    onSelect={() => {
                      setSelectedPropertyId(property.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPropertyId === property.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Building2 className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{property.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {property.address}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowAddDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="font-medium">Adicionar Nova Propriedade</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AddPropertyDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
