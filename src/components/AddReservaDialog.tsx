import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Guest {
  id: string;
  nome: string;
  documento: string;
  tipoDocumento: "passaporte" | "cc";
  dataNascimento: string;
  nacionalidade: string;
}

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
    valorEstadia: 0,
    valorLimpeza: 0,
    taxaTuristica: 0,
    status: "pendente",
  });
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      nome: "",
      documento: "",
      tipoDocumento: "cc",
      dataNascimento: "",
      nacionalidade: "",
    },
  ]);

  const calculateNoites = () => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const calculateComissoes = () => {
    const { plataforma, valorEstadia, valorLimpeza, taxaTuristica } = formData;
    
    if (plataforma === "Booking") {
      const comissaoEstadia = valorEstadia * 0.15;
      const comissaoLimpezaTaxa = (valorLimpeza + taxaTuristica) * 0.014;
      return comissaoEstadia + comissaoLimpezaTaxa;
    } else if (plataforma === "Airbnb") {
      return (valorEstadia + valorLimpeza) * 0.15;
    }
    return 0;
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        id: Date.now().toString(),
        nome: "",
        documento: "",
        tipoDocumento: "cc",
        dataNascimento: "",
        nacionalidade: "",
      },
    ]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter((g) => g.id !== id));
    }
  };

  const updateGuest = (id: string, field: keyof Guest, value: string) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
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

    const comissaoPlataforma = calculateComissoes();
    const valorTotal = formData.valorEstadia + formData.valorLimpeza + formData.taxaTuristica;

    const novaReserva = {
      id: Date.now().toString(),
      ...formData,
      noites,
      valor: valorTotal,
      comissaoPlataforma,
      hospedes: guests,
      propertyId: "1",
    };

    onAdd(novaReserva);
    toast.success("Reserva adicionada com sucesso!");
    setOpen(false);
    setFormData({
      hospede: "",
      checkIn: "",
      checkOut: "",
      plataforma: "Airbnb",
      valorEstadia: 0,
      valorLimpeza: 0,
      taxaTuristica: 0,
      status: "pendente",
    });
    setGuests([
      {
        id: "1",
        nome: "",
        documento: "",
        tipoDocumento: "cc",
        dataNascimento: "",
        nacionalidade: "",
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Reserva</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações da Reserva</h3>
              <div>
                <Label htmlFor="hospede">Nome do Hóspede Principal *</Label>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valorEstadia">Valor Estadia (€)</Label>
                  <Input
                    id="valorEstadia"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valorEstadia}
                    onChange={(e) =>
                      setFormData({ ...formData, valorEstadia: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valorLimpeza">Taxa Limpeza (€)</Label>
                  <Input
                    id="valorLimpeza"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valorLimpeza}
                    onChange={(e) =>
                      setFormData({ ...formData, valorLimpeza: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="taxaTuristica">Taxa Turística (€)</Label>
                  <Input
                    id="taxaTuristica"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxaTuristica}
                    onChange={(e) =>
                      setFormData({ ...formData, taxaTuristica: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              {formData.plataforma !== "Direto" && (formData.valorEstadia > 0 || formData.valorLimpeza > 0 || formData.taxaTuristica > 0) && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Comissão {formData.plataforma}: €{calculateComissoes().toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.plataforma === "Booking" && "15% sobre estadia + 1.4% sobre (limpeza + taxa turística)"}
                    {formData.plataforma === "Airbnb" && "15% sobre (estadia + limpeza)"}
                  </p>
                </div>
              )}
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Dados dos Hóspedes</h3>
                <Button type="button" variant="outline" size="sm" onClick={addGuest}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Hóspede
                </Button>
              </div>

              {guests.map((guest, index) => (
                <Card key={guest.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Hóspede {index + 1}</CardTitle>
                      {guests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuest(guest.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Nome Completo</Label>
                      <Input
                        value={guest.nome}
                        onChange={(e) => updateGuest(guest.id, "nome", e.target.value)}
                        placeholder="Nome completo do hóspede"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tipo de Documento</Label>
                        <Select
                          value={guest.tipoDocumento}
                          onValueChange={(value: "passaporte" | "cc") =>
                            updateGuest(guest.id, "tipoDocumento", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cc">Cartão de Cidadão</SelectItem>
                            <SelectItem value="passaporte">Passaporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Número do Documento</Label>
                        <Input
                          value={guest.documento}
                          onChange={(e) => updateGuest(guest.id, "documento", e.target.value)}
                          placeholder="Número"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Data de Nascimento</Label>
                        <Input
                          type="date"
                          value={guest.dataNascimento}
                          onChange={(e) =>
                            updateGuest(guest.id, "dataNascimento", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Nacionalidade</Label>
                        <Input
                          value={guest.nacionalidade}
                          onChange={(e) =>
                            updateGuest(guest.id, "nacionalidade", e.target.value)
                          }
                          placeholder="Ex: Portuguesa"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Reserva</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
