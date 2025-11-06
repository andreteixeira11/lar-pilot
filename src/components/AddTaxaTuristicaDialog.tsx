import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTaxaTuristicaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string | null;
}

export function AddTaxaTuristicaDialog({ open, onOpenChange, propertyId }: AddTaxaTuristicaDialogProps) {
  const [mes, setMes] = useState("");
  const [totalHospedes, setTotalHospedes] = useState("");
  const [totalNoites, setTotalNoites] = useState("");
  const [taxaPorNoite, setTaxaPorNoite] = useState("2");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Save to database when backend is ready
      const totalTaxa = parseFloat(totalNoites) * parseFloat(taxaPorNoite);
      
      console.log("Taxa turística adicionada:", {
        propertyId,
        mes,
        totalHospedes: parseInt(totalHospedes),
        totalNoites: parseInt(totalNoites),
        taxaPorNoite: parseFloat(taxaPorNoite),
        totalTaxa,
        pago: false,
      });

      toast({
        title: "Taxa turística adicionada!",
        description: `Registo de ${mes} adicionado com sucesso.`,
      });

      // Reset form
      setMes("");
      setTotalHospedes("");
      setTotalNoites("");
      setTaxaPorNoite("2");
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
          <DialogTitle>Adicionar Taxa Turística</DialogTitle>
          <DialogDescription>
            Insira os dados manualmente para o mês selecionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mes">Mês *</Label>
            <Select value={mes} onValueChange={setMes} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Janeiro 2025">Janeiro 2025</SelectItem>
                <SelectItem value="Fevereiro 2025">Fevereiro 2025</SelectItem>
                <SelectItem value="Março 2025">Março 2025</SelectItem>
                <SelectItem value="Abril 2025">Abril 2025</SelectItem>
                <SelectItem value="Maio 2025">Maio 2025</SelectItem>
                <SelectItem value="Junho 2025">Junho 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalHospedes">Total de Hóspedes *</Label>
            <Input
              id="totalHospedes"
              type="number"
              min="0"
              placeholder="0"
              value={totalHospedes}
              onChange={(e) => setTotalHospedes(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalNoites">Total de Noites *</Label>
            <Input
              id="totalNoites"
              type="number"
              min="0"
              placeholder="0"
              value={totalNoites}
              onChange={(e) => setTotalNoites(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxaPorNoite">Taxa por Noite (€) *</Label>
            <Input
              id="taxaPorNoite"
              type="number"
              min="0"
              step="0.01"
              placeholder="2.00"
              value={taxaPorNoite}
              onChange={(e) => setTaxaPorNoite(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "A adicionar..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
