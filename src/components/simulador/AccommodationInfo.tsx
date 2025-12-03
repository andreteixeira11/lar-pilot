import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

interface AccommodationInfoProps {
  packageName: string;
  totalCommission: number;
  selectedServices: string[];
  onOpenProposal: (commission: number, services: string[]) => void;
  onBack: () => void;
}

export const AccommodationInfo = ({
  packageName,
  totalCommission,
  selectedServices,
  onOpenProposal,
  onBack,
}: AccommodationInfoProps) => {
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyType: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    capacity: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenProposal(totalCommission, selectedServices);
  };

  const isFormValid =
    formData.propertyName &&
    formData.propertyType &&
    formData.address &&
    formData.ownerName &&
    formData.ownerEmail &&
    formData.ownerPhone;

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <CardTitle className="text-xl md:text-2xl">
              Informações do Alojamento
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Pacote {packageName} • {totalCommission}% comissão
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados da Propriedade</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Nome da Propriedade *</Label>
                <Input
                  id="propertyName"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  placeholder="Ex: Villa Paradise"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo de Alojamento *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleSelectChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Moradia</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Estúdio</SelectItem>
                    <SelectItem value="room">Quarto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Morada Completa *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, Número, Código Postal, Cidade"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Casas de Banho</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados do Proprietário</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome Completo *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="O seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Telefone *</Label>
                <Input
                  id="ownerPhone"
                  name="ownerPhone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  placeholder="+351 912 345 678"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email *</Label>
              <Input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionais</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informações adicionais sobre a propriedade..."
                rows={3}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isFormValid}
          >
            VER PROPOSTA
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
