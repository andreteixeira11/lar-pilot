import { useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
            className="w-full justify-between bg-background hover:bg-accent border-border transition-all duration-200"
          >
            {selectedProperty ? (
              <motion.div 
                className="flex items-center gap-2 flex-1 min-w-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full text-left">
                    {selectedProperty.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {selectedProperty.address}
                  </span>
                </div>
              </motion.div>
            ) : (
              <span className="text-muted-foreground">Selecionar propriedade...</span>
            )}
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </motion.div>
          </Button>
        </PopoverTrigger>
        <AnimatePresence>
          {open && (
            <PopoverContent className="w-[400px] p-0" align="start" asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Command>
                  <CommandInput placeholder="Pesquisar propriedade..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma propriedade encontrada.</CommandEmpty>
                    <CommandGroup heading="Propriedades">
                      {properties.map((property, index) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                        >
                          <CommandItem
                            value={property.id}
                            onSelect={() => {
                              setSelectedPropertyId(property.id);
                              setOpen(false);
                            }}
                            className="cursor-pointer transition-colors duration-150"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 transition-opacity duration-200",
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
                        </motion.div>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: properties.length * 0.05, duration: 0.2 }}
                      >
                        <CommandItem
                          onSelect={() => {
                            setOpen(false);
                            setShowAddDialog(true);
                          }}
                          className="cursor-pointer transition-colors duration-150"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span className="font-medium">Adicionar Nova Propriedade</span>
                        </CommandItem>
                      </motion.div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>
      </Popover>

      <AddPropertyDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
