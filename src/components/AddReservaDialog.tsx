import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { useProperty } from "@/contexts/PropertyContext";

interface Guest {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  localNascimento: string;
  nacionalidade: string;
  localResidencia: string;
  paisResidencia: string;
  tipoDocumento: "cc" | "passaporte";
  numeroDocumento: string;
  paisEmissor: string;
}

interface AddReservaDialogProps {
  onAdd: (reserva: any) => void;
}

export const AddReservaDialog = ({ onAdd }: AddReservaDialogProps) => {
  const { selectedProperty } = useProperty();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    hospede: "",
    checkIn: "",
    checkOut: "",
    plataforma: "Airbnb",
    valorTotalEstadia: 0,
    valorBaseEstadia: 0,
    ivaEstadia: 0,
    valorTotalLimpeza: 0,
    valorBaseLimpeza: 0,
    ivaLimpeza: 0,
    taxaTuristica: 0,
    status: "pendente",
    numHospedes: 1,
  });
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      nomeCompleto: "",
      dataNascimento: "",
      localNascimento: "",
      nacionalidade: "",
      localResidencia: "",
      paisResidencia: "",
      tipoDocumento: "cc",
      numeroDocumento: "",
      paisEmissor: "",
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

  const calculateIVABreakdown = (total: number, type: 'estadia' | 'limpeza') => {
    if (!selectedProperty || total === 0) return { base: 0, iva: 0 };
    
    const region = selectedProperty.region;
    let divisor: number;
    
    if (type === 'estadia') {
      divisor = region === 'madeira' ? 1.04 : 1.06;
    } else {
      divisor = region === 'madeira' ? 1.22 : 1.23;
    }
    
    const base = total / divisor;
    const iva = total - base;
    
    return { base: parseFloat(base.toFixed(2)), iva: parseFloat(iva.toFixed(2)) };
  };

  const calculateValorTotalReserva = () => {
    return formData.valorTotalEstadia + formData.valorTotalLimpeza + formData.taxaTuristica;
  };

  const calculateComissoes = () => {
    const { plataforma, taxaTuristica, valorTotalEstadia, valorTotalLimpeza } = formData;
    
    if (plataforma === "Booking") {
      const comissaoEstadia = valorTotalEstadia * 0.15;
      const comissaoLimpezaTaxa = (valorTotalLimpeza + taxaTuristica) * 0.014;
      return comissaoEstadia + comissaoLimpezaTaxa;
    } else if (plataforma === "Airbnb") {
      return (valorTotalEstadia + valorTotalLimpeza) * 0.15;
    }
    return 0;
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        id: Date.now().toString(),
        nomeCompleto: "",
        dataNascimento: "",
        localNascimento: "",
        nacionalidade: "",
        localResidencia: "",
        paisResidencia: "",
        tipoDocumento: "cc",
        numeroDocumento: "",
        paisEmissor: "",
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

    // Obter país de origem do primeiro hóspede
    const paisOrigem = guests[0]?.paisResidencia || guests[0]?.nacionalidade || "Portugal";

    const comissaoPlataforma = calculateComissoes();
    const valorTotal = calculateValorTotalReserva();

    const novaReserva = {
      id: Date.now().toString(),
      ...formData,
      noites,
      valor: valorTotal,
      comissaoPlataforma,
      hospedes: guests,
      propertyId: "1",
      paisOrigem,
      status: "confirmada", // Define como confirmada por padrão
      nrHospedes: formData.numHospedes,
    };

    onAdd(novaReserva);
    setOpen(false);
    setFormData({
      hospede: "",
      checkIn: "",
      checkOut: "",
      plataforma: "Airbnb",
      valorTotalEstadia: 0,
      valorBaseEstadia: 0,
      ivaEstadia: 0,
      valorTotalLimpeza: 0,
      valorBaseLimpeza: 0,
      ivaLimpeza: 0,
      taxaTuristica: 0,
      status: "pendente",
      numHospedes: 1,
    });
    setGuests([
      {
        id: "1",
        nomeCompleto: "",
        dataNascimento: "",
        localNascimento: "",
        nacionalidade: "",
        localResidencia: "",
        paisResidencia: "",
        tipoDocumento: "cc",
        numeroDocumento: "",
        paisEmissor: "",
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="numHospedes">N.º de Hóspedes *</Label>
                  <Input
                    id="numHospedes"
                    type="number"
                    min="1"
                    value={formData.numHospedes}
                    onChange={(e) =>
                      setFormData({ ...formData, numHospedes: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valorTotalEstadia">Valor Total Estadia (€) *</Label>
                    <Input
                      id="valorTotalEstadia"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorTotalEstadia || ""}
                      onChange={(e) => {
                        const total = parseFloat(e.target.value) || 0;
                        const { base, iva } = calculateIVABreakdown(total, 'estadia');
                        setFormData({
                          ...formData,
                          valorTotalEstadia: total,
                          valorBaseEstadia: base,
                          ivaEstadia: iva
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valorBaseEstadia">Valor Base Estadia (€)</Label>
                    <Input
                      id="valorBaseEstadia"
                      type="number"
                      value={formData.valorBaseEstadia.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ivaEstadia">IVA Estadia (€)</Label>
                    <Input
                      id="ivaEstadia"
                      type="number"
                      value={formData.ivaEstadia.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valorTotalLimpeza">Valor Total Limpeza (€)</Label>
                    <Input
                      id="valorTotalLimpeza"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorTotalLimpeza || ""}
                      onChange={(e) => {
                        const total = parseFloat(e.target.value) || 0;
                        const { base, iva } = calculateIVABreakdown(total, 'limpeza');
                        setFormData({
                          ...formData,
                          valorTotalLimpeza: total,
                          valorBaseLimpeza: base,
                          ivaLimpeza: iva
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valorBaseLimpeza">Valor Base Limpeza (€)</Label>
                    <Input
                      id="valorBaseLimpeza"
                      type="number"
                      value={formData.valorBaseLimpeza.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ivaLimpeza">IVA Limpeza (€)</Label>
                    <Input
                      id="ivaLimpeza"
                      type="number"
                      value={formData.ivaLimpeza.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
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
              {formData.plataforma !== "Direto" && (formData.valorTotalEstadia > 0 || formData.valorTotalLimpeza > 0) && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Comissão {formData.plataforma}: €{calculateComissoes().toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.plataforma === "Booking" && "15% sobre estadia + 1.4% sobre (limpeza + taxa turística)"}
                    {formData.plataforma === "Airbnb" && "15% sobre (estadia + limpeza)"}
                  </p>
                </div>
              )}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Valor Total da Reserva:</span>
                  <span className="text-xl font-bold text-primary">€{calculateValorTotalReserva().toFixed(2)}</span>
                </div>
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
                        value={guest.nomeCompleto}
                        onChange={(e) => updateGuest(guest.id, "nomeCompleto", e.target.value)}
                        placeholder="Nome completo do hóspede"
                      />
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
                        <Label>Local de Nascimento</Label>
                        <Input
                          value={guest.localNascimento}
                          onChange={(e) =>
                            updateGuest(guest.id, "localNascimento", e.target.value)
                          }
                          placeholder="Cidade/Local"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                      <div>
                        <Label>Local de Residência</Label>
                        <Input
                          value={guest.localResidencia}
                          onChange={(e) =>
                            updateGuest(guest.id, "localResidencia", e.target.value)
                          }
                          placeholder="Cidade"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>País de Residência</Label>
                      <Input
                        value={guest.paisResidencia}
                        onChange={(e) =>
                          updateGuest(guest.id, "paisResidencia", e.target.value)
                        }
                        placeholder="País"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
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
                          value={guest.numeroDocumento}
                          onChange={(e) => updateGuest(guest.id, "numeroDocumento", e.target.value)}
                          placeholder="Número"
                        />
                      </div>
                      <div>
                        <Label>País Emissor</Label>
                        <Input
                          value={guest.paisEmissor}
                          onChange={(e) =>
                            updateGuest(guest.id, "paisEmissor", e.target.value)
                          }
                          placeholder="País"
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