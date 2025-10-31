import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddReservaDialogProps {
  onAdd: (reserva: any) => void;
}

export const AddReservaDialog = ({ onAdd }: AddReservaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    hospede: "",
    checkIn: "",
    checkOut: "",
    plataforma: "Airbnb",
    valor: 0,
    status: "pendente",
  });

  const calculateNoites = () => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospede || !formData.checkIn || !formData.checkOut) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const noites = calculateNoites();
    if (noites <= 0) {
      toast.error("Data de check-out deve ser posterior ao check-in");
      return;
    }

    const novaReserva = {
      id: Date.now().toString(),
      ...formData,
      noites,
    };

    onAdd(novaReserva);
    toast.success("Reserva adicionada com sucesso!");
    setOpen(false);
    setFormData({
      hospede: "",
      checkIn: "",
      checkOut: "",
      plataforma: "Airbnb",
      valor: 0,
      status: "pendente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Reserva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hospede">Nome do Hóspede *</Label>
            <Input
              id="hospede"
              value={formData.hospede}
              onChange={(e) =>
                setFormData({ ...formData, hospede: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Check-in *</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) =>
                  setFormData({ ...formData, checkIn: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out *</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) =>
                  setFormData({ ...formData, checkOut: e.target.value })
                }
                required
              />
            </div>
          </div>
          {formData.checkIn && formData.checkOut && (
            <p className="text-sm text-muted-foreground">
              {calculateNoites()} noites
            </p>
          )}
          <div>
            <Label htmlFor="plataforma">Plataforma</Label>
            <Select
              value={formData.plataforma}
              onValueChange={(value) =>
                setFormData({ ...formData, plataforma: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Airbnb">Airbnb</SelectItem>
                <SelectItem value="Booking">Booking</SelectItem>
                <SelectItem value="Direto">Direto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="valor">Valor Total (€)</Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
