import { useState } from "react";
import { Building2, ChevronDown, Settings, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { AddPropertyDialog } from "./AddPropertyDialog";
import { EditPropertyDialog } from "./EditPropertyDialog";
import { useToast } from "@/hooks/use-toast";

export const PropertySelector = () => {
  const { properties, selectedPropertyId, setSelectedPropertyId, selectedProperty, deleteProperty } = useProperty();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    if (selectedProperty) {
      deleteProperty(selectedProperty.id);
      toast({
        title: "Propriedade removida",
        description: "A propriedade foi removida com sucesso.",
      });
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="px-4 py-3 border-b border-sidebar-border space-y-3">
      <div className="flex items-center gap-2">
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger className="flex-1 bg-sidebar-accent border-sidebar-border hover:bg-sidebar-border transition-colors">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddPropertyDialog />

      {selectedProperty && (
        <>
          <EditPropertyDialog
            property={selectedProperty}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser revertida. A propriedade "{selectedProperty.name}" será permanentemente removida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
