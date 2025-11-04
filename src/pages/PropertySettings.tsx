import { useState } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export default function PropertySettings() {
  const { selectedProperty, updateProperty, deleteProperty } = useProperty();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState(selectedProperty?.name || "");
  const [address, setAddress] = useState(selectedProperty?.address || "");
  const [description, setDescription] = useState(selectedProperty?.description || "");
  const [capacity, setCapacity] = useState(selectedProperty?.capacity || 0);
  const [bedrooms, setBedrooms] = useState(selectedProperty?.bedrooms || 0);
  const [bathrooms, setBathrooms] = useState(selectedProperty?.bathrooms || 0);
  const [checkInTime, setCheckInTime] = useState(selectedProperty?.checkInTime || "");
  const [checkOutTime, setCheckOutTime] = useState(selectedProperty?.checkOutTime || "");
  const [wifiPassword, setWifiPassword] = useState(selectedProperty?.wifiPassword || "");
  const [parkingInfo, setParkingInfo] = useState(selectedProperty?.parkingInfo || "");
  const [alNumber, setAlNumber] = useState(selectedProperty?.alNumber || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty) return;

    updateProperty(selectedProperty.id, {
      name,
      address,
      description,
      capacity,
      bedrooms,
      bathrooms,
      checkInTime,
      checkOutTime,
      wifiPassword,
      parkingInfo,
      alNumber,
    });

    toast({
      title: "Propriedade atualizada",
      description: "As informações da propriedade foram atualizadas com sucesso.",
    });
  };

  const handleDelete = () => {
    if (!selectedProperty) return;
    
    deleteProperty(selectedProperty.id);
    toast({
      title: "Propriedade removida",
      description: "A propriedade foi removida com sucesso.",
    });
    navigate("/reservas");
  };

  if (!selectedProperty) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Definições da Propriedade"
          description="Nenhuma propriedade selecionada"
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Definições da Propriedade"
        description="Gerir informações da propriedade selecionada"
      />

      <div className="mt-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Propriedade *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alNumber">Número AL</Label>
                  <Input
                    id="alNumber"
                    value={alNumber}
                    onChange={(e) => setAlNumber(e.target.value)}
                    placeholder="AL/123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Morada *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Casas de Banho</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Check-out</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wifiPassword">Password WiFi</Label>
                <Input
                  id="wifiPassword"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingInfo">Informações de Estacionamento</Label>
                <Textarea
                  id="parkingInfo"
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Guardar Alterações
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remover Propriedade
                    </Button>
                  </AlertDialogTrigger>
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
