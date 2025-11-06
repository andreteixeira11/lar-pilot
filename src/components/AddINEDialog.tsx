import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddINEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string | null;
  selectedMonth: string;
}

export function AddINEDialog({ open, onOpenChange, propertyId, selectedMonth }: AddINEDialogProps) {
  const [pais, setPais] = useState("");
  const [nrHospedes, setNrHospedes] = useState("");
  const [nrNoites, setNrNoites] = useState("");
  const [dormidas, setDormidas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Save to database when backend is ready
      console.log("Registo INE adicionado:", {
        propertyId,
        mes: selectedMonth,
        pais,
        nrHospedes: parseInt(nrHospedes),
        nrNoites: parseInt(nrNoites),
        dormidas: parseInt(dormidas),
      });

      toast({
        title: "Registo INE adicionado!",
        description: `Dados de ${pais} adicionados com sucesso.`,
      });

      // Reset form
      setPais("");
      setNrHospedes("");
      setNrNoites("");
      setDormidas("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Registo INE</DialogTitle>
          <DialogDescription>
            Insira os dados de hóspedes por país manualmente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pais">País *</Label>
            <Select value={pais} onValueChange={setPais} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Espanha">Espanha</SelectItem>
                <SelectItem value="França">França</SelectItem>
                <SelectItem value="Alemanha">Alemanha</SelectItem>
                <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nrHospedes">Nº de Hóspedes *</Label>
            <Input
              id="nrHospedes"
              type="number"
              min="0"
              placeholder="0"
              value={nrHospedes}
              onChange={(e) => setNrHospedes(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nrNoites">Nº de Noites *</Label>
            <Input
              id="nrNoites"
              type="number"
              min="0"
              placeholder="0"
              value={nrNoites}
              onChange={(e) => setNrNoites(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dormidas">Dormidas *</Label>
            <Input
              id="dormidas"
              type="number"
              min="0"
              placeholder="0"
              value={dormidas}
              onChange={(e) => setDormidas(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Normalmente: Dormidas = Nº Hóspedes × Nº Noites
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "A adicionar..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
