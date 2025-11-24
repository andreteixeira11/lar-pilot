import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/lib/countries";
import { Plus, Trash2, Check } from "lucide-react";

interface Guest {
  nome_completo: string;
  data_nascimento: string;
  local_nascimento: string;
  nacionalidade: string;
  local_residencia: string;
  pais_residencia: string;
  tipo_documento: string;
  numero_documento: string;
  pais_emissor: string;
}

export function CheckInForm({ reservation }: { reservation: any }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    {
      nome_completo: "",
      data_nascimento: "",
      local_nascimento: "",
      nacionalidade: "",
      local_residencia: "",
      pais_residencia: "",
      tipo_documento: "",
      numero_documento: "",
      pais_emissor: "",
    },
  ]);

  const addGuest = () => {
    if (guests.length < reservation.num_guests) {
      setGuests([
        ...guests,
        {
          nome_completo: "",
          data_nascimento: "",
          local_nascimento: "",
          nacionalidade: "",
          local_residencia: "",
          pais_residencia: "",
          tipo_documento: "",
          numero_documento: "",
          pais_emissor: "",
        },
      ]);
    }
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all guests are filled
    const allFilled = guests.every(
      (guest) =>
        guest.nome_completo &&
        guest.data_nascimento &&
        guest.pais_residencia &&
        guest.tipo_documento &&
        guest.numero_documento
    );

    if (!allFilled) {
      toast({
        title: "Dados incompletos",
        description: "Por favor preencha todos os campos obrigatórios de todos os hóspedes",
        variant: "destructive",
      });
      return;
    }

    if (guests.length !== reservation.num_guests) {
      toast({
        title: "Número de hóspedes incorreto",
        description: `Por favor adicione os dados de todos os ${reservation.num_guests} hóspedes`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert all guests
      const guestsToInsert = guests.map((guest) => ({
        ...guest,
        reservation_id: reservation.id,
      }));

      const { error } = await supabase.from("reservation_guests").insert(guestsToInsert);

      if (error) throw error;

      toast({
        title: "Check-in completo!",
        description: "Os seus dados foram registados com sucesso. Aguardamos por si!",
      });

      // Redirect to success page
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting check-in:", error);
      toast({
        title: "Erro ao guardar dados",
        description: error.message || "Ocorreu um erro ao processar o check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {guests.map((guest, index) => (
        <Card key={index} className="p-6 border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Hóspede {index + 1} {index === 0 && "(Titular)"}
            </h3>
            {guests.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuest(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor={`nome-${index}`}>Nome Completo *</Label>
              <Input
                id={`nome-${index}`}
                value={guest.nome_completo}
                onChange={(e) => updateGuest(index, "nome_completo", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor={`nascimento-${index}`}>Data de Nascimento</Label>
              <DatePicker
                date={guest.data_nascimento ? new Date(guest.data_nascimento) : undefined}
                onDateChange={(date) =>
                  updateGuest(index, "data_nascimento", date ? date.toISOString().split("T")[0] : "")
                }
              />
            </div>

            <div>
              <Label htmlFor={`local-nascimento-${index}`}>Local de Nascimento</Label>
              <Input
                id={`local-nascimento-${index}`}
                value={guest.local_nascimento}
                onChange={(e) => updateGuest(index, "local_nascimento", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`nacionalidade-${index}`}>Nacionalidade</Label>
              <Select
                value={guest.nacionalidade}
                onValueChange={(value) => updateGuest(index, "nacionalidade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`pais-residencia-${index}`}>País de Residência *</Label>
              <Select
                value={guest.pais_residencia}
                onValueChange={(value) => updateGuest(index, "pais_residencia", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor={`local-residencia-${index}`}>Local/Cidade de Residência</Label>
              <Input
                id={`local-residencia-${index}`}
                value={guest.local_residencia}
                onChange={(e) => updateGuest(index, "local_residencia", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`tipo-documento-${index}`}>Tipo de Documento *</Label>
              <Select
                value={guest.tipo_documento}
                onValueChange={(value) => updateGuest(index, "tipo_documento", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cartão de Cidadão">Cartão de Cidadão</SelectItem>
                  <SelectItem value="Passaporte">Passaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`numero-documento-${index}`}>Número do Documento *</Label>
              <Input
                id={`numero-documento-${index}`}
                value={guest.numero_documento}
                onChange={(e) => updateGuest(index, "numero_documento", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor={`pais-emissor-${index}`}>País Emissor do Documento</Label>
              <Select
                value={guest.pais_emissor}
                onValueChange={(value) => updateGuest(index, "pais_emissor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}

      {guests.length < reservation.num_guests && (
        <Button
          type="button"
          variant="outline"
          onClick={addGuest}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Hóspede ({guests.length}/{reservation.num_guests})
        </Button>
      )}

      <Button
        type="submit"
        disabled={loading || guests.length !== reservation.num_guests}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>Aguarde...</>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Concluir Check-in
          </>
        )}
      </Button>
    </form>
  );
}
