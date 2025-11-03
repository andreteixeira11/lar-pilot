import { useState } from "react";
import { Plus, Link as LinkIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";

export const AddPropertyDialog = () => {
  const { addProperty } = useProperty();
  const [open, setOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    wifiPassword: "",
    parkingInfo: "",
  });

  const handleImport = async () => {
    if (!importUrl) {
      toast.error("Insira um link válido");
      return;
    }

    setIsImporting(true);
    try {
      // Simulate API call to scrape property data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data
      const extractedData = {
        name: "Luxury Leilamar Apartment Modern Retreat",
        address: "Rua Example, Lisboa, Portugal",
        description: "Apartamento moderno e luxuoso no centro da cidade",
        capacity: 4,
        bedrooms: 2,
        bathrooms: 1,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        wifiPassword: "",
        parkingInfo: "",
      };
      
      setFormData(extractedData);
      setImportUrl("");
      toast.success("Dados importados com sucesso!");
    } catch (error) {
      toast.error("Erro ao importar propriedade");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    addProperty(formData);
    toast.success("Propriedade adicionada com sucesso!");
    setOpen(false);
    setFormData({
      name: "",
      address: "",
      description: "",
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      wifiPassword: "",
      parkingInfo: "",
    });
    setImportUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Adicionar nova propriedade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Propriedade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pb-4 border-b">
          <Label htmlFor="importUrl">Importar de Link (Booking, Airbnb)</Label>
          <div className="flex gap-2">
            <Input
              id="importUrl"
              type="url"
              placeholder="https://www.booking.com/hotel/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={isImporting || !importUrl}
              variant="secondary"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isImporting ? "A importar..." : "Importar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Cole o link da propriedade do Booking ou Airbnb para importar automaticamente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Propriedade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Morada *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Casas de Banho</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bathrooms: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="checkInTime">Hora de Check-in</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) =>
                  setFormData({ ...formData, checkInTime: e.target.value })
                }
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
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="wifiPassword">Senha Wi-Fi</Label>
              <Input
                id="wifiPassword"
                value={formData.wifiPassword}
                onChange={(e) =>
                  setFormData({ ...formData, wifiPassword: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="parkingInfo">Informação de Estacionamento</Label>
              <Input
                id="parkingInfo"
                value={formData.parkingInfo}
                onChange={(e) =>
                  setFormData({ ...formData, parkingInfo: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Propriedade</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
