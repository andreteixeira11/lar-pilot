import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/contexts/PropertyContext";

interface AddCheckinTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  template?: any;
}

export function AddCheckinTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  template,
}: AddCheckinTemplateDialogProps) {
  const { selectedProperty } = useProperty();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || "",
    isDefault: template?.is_default || false,
    includeEstimatedArrival: template?.include_estimated_arrival ?? true,
    includeSpecialRequests: template?.include_special_requests ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty?.id) return;

    setLoading(true);
    try {
      const templateData = {
        property_id: selectedProperty.id,
        name: formData.name,
        is_default: formData.isDefault,
        include_estimated_arrival: formData.includeEstimatedArrival,
        include_special_requests: formData.includeSpecialRequests,
      };

      if (template) {
        const { error } = await supabase
          .from("checkin_form_templates")
          .update(templateData)
          .eq("id", template.id);

        if (error) throw error;
        toast({
          title: "Template atualizado!",
          description: "O template foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("checkin_form_templates")
          .insert(templateData);

        if (error) throw error;
        toast({
          title: "Template criado!",
          description: "O template foi criado com sucesso.",
        });
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        name: "",
        isDefault: false,
        includeEstimatedArrival: true,
        includeSpecialRequests: true,
      });
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível guardar o template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Criar Template de Check-in"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Template Padrão"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Template Padrão</Label>
                <p className="text-sm text-muted-foreground">
                  Usar este template por defeito para novas reservas
                </p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Campos Personalizados</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5">
                  <Label>Hora Estimada de Chegada</Label>
                  <p className="text-sm text-muted-foreground">
                    Solicitar hora prevista de chegada
                  </p>
                </div>
                <Switch
                  checked={formData.includeEstimatedArrival}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeEstimatedArrival: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pedidos Especiais</Label>
                  <p className="text-sm text-muted-foreground">
                    Campo para preferências e pedidos especiais
                  </p>
                </div>
                <Switch
                  checked={formData.includeSpecialRequests}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeSpecialRequests: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "A guardar..." : template ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
