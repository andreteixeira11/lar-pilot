import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Save, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DadosAlojamento = () => {
  const { selectedProperty, updateProperty } = useProperty();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(
    selectedProperty || {
      name: "",
      address: "",
      capacity: 0,
      bedrooms: 0,
      bathrooms: 0,
      wifiPassword: "",
      parkingInfo: "",
      region: "continental" as "continental" | "madeira",
      rnal: "",
      insuranceValidity: "",
      insuranceFileUrl: "",
      platformStatus: "nao_submetido" as "nao_submetido" | "submetido" | "aprovado",
    }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProperty) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProperty.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('insurance-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('insurance-documents')
        .getPublicUrl(fileName);

      setFormData({ ...formData, insuranceFileUrl: publicUrl });
      toast.success("Ficheiro carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ficheiro");
    } finally {
      setUploading(false);
    }
  };

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
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Dados do Alojamento"
        description={selectedProperty.name}
        actions={
          isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Editar</Button>
          )
        }
      />

      <div className="grid gap-6 max-w-4xl mt-6">
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
              <Label htmlFor="region">Região</Label>
              <Select
                value={formData.region}
                onValueChange={(value: "continental" | "madeira") =>
                  setFormData({ ...formData, region: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continental">Portugal Continental</SelectItem>
                  <SelectItem value="madeira">Madeira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rnal">RNAL</Label>
              <Input
                id="rnal"
                value={formData.rnal}
                onChange={(e) =>
                  setFormData({ ...formData, rnal: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Número de registo"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguro de Responsabilidade Civil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="insuranceValidity">Validade do Seguro</Label>
              <Input
                id="insuranceValidity"
                type="date"
                value={formData.insuranceValidity}
                onChange={(e) =>
                  setFormData({ ...formData, insuranceValidity: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="insuranceFile">Ficheiro do Seguro</Label>
              {formData.insuranceFileUrl && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <a 
                    href={formData.insuranceFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex-1 truncate"
                  >
                    Ver ficheiro atual
                  </a>
                </div>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    id="insuranceFile"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {uploading && <span className="text-sm text-muted-foreground">A carregar...</span>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="platformStatus">Estado</Label>
              <Select
                value={formData.platformStatus}
                onValueChange={(value: "nao_submetido" | "submetido" | "aprovado") =>
                  setFormData({ ...formData, platformStatus: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="platformStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_submetido">Não Submetido</SelectItem>
                  <SelectItem value="submetido">Submetido na Plataforma</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidade</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
