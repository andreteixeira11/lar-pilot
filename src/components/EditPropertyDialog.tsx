import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProperty } from "@/contexts/PropertyContext";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/contexts/PropertyContext";

interface EditPropertyDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPropertyDialog = ({ property, open, onOpenChange }: EditPropertyDialogProps) => {
  const { updateProperty } = useProperty();
  const { toast } = useToast();
  
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [capacity, setCapacity] = useState(property.capacity.toString());
  const [alNumber, setAlNumber] = useState(property.alNumber || "");

  useEffect(() => {
    if (open) {
      setName(property.name);
      setAddress(property.address);
      setCapacity(property.capacity.toString());
      setAlNumber(property.alNumber || "");
    }
  }, [open, property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProperty(property.id, {
      name,
      address,
      capacity: parseInt(capacity),
      alNumber: alNumber || undefined,
    });

    toast({
      title: "Propriedade atualizada",
      description: "As alterações foram guardadas com sucesso.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Propriedade</DialogTitle>
          <DialogDescription>
            Atualize as informações da propriedade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome da Propriedade *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Apartamento T2 Centro"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Morada *</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, cidade"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-capacity">Capacidade (nº de hóspedes) *</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-al-number">Número AL (opcional)</Label>
              <Input
                id="edit-al-number"
                value={alNumber}
                onChange={(e) => setAlNumber(e.target.value)}
                placeholder="Ex: AL/12345/2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
