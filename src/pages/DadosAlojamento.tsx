import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Save } from "lucide-react";

const DadosAlojamento = () => {
  const { selectedProperty, updateProperty } = useProperty();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(
    selectedProperty || {
      name: "",
      address: "",
      description: "",
      capacity: 0,
      bedrooms: 0,
      bathrooms: 0,
      checkInTime: "",
      checkOutTime: "",
      wifiPassword: "",
      parkingInfo: "",
    }
  );

  const handleSave = () => {
    if (!selectedProperty) return;
    updateProperty(selectedProperty.id, formData);
    setIsEditing(false);
    toast.success("Dados atualizados com sucesso!");
  };

  if (!selectedProperty) {
    return (
      <div className="p-8">
        <PageHeader title="Dados do Alojamento" />
        <p className="text-muted-foreground">Nenhuma propriedade selecionada.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Dados do Alojamento"
        description={selectedProperty.name}
        actions={
          isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )
        }
      />

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Propriedade</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidade</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Casas de Banho</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: parseInt(e.target.value) })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-in / Check-out</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInTime">Hora de Check-in</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) =>
                  setFormData({ ...formData, checkInTime: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Hora de Check-out</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) =>
                  setFormData({ ...formData, checkOutTime: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações para Hóspedes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wifiPassword">Senha Wi-Fi</Label>
              <Input
                id="wifiPassword"
                value={formData.wifiPassword}
                onChange={(e) =>
                  setFormData({ ...formData, wifiPassword: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="parkingInfo">Informação de Estacionamento</Label>
              <Input
                id="parkingInfo"
                value={formData.parkingInfo}
                onChange={(e) =>
                  setFormData({ ...formData, parkingInfo: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DadosAlojamento;
