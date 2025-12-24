import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Euro, Image } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface UpsellManagerProps {
  guidebookId: string;
  selectedLanguage: string;
}

interface Upsell {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

const CATEGORIES = [
  { value: "experience", label: "Experiências" },
  { value: "transport", label: "Transporte" },
  { value: "food", label: "Alimentação" },
  { value: "service", label: "Serviços" },
  { value: "other", label: "Outros" },
];

export const UpsellManager = ({ guidebookId, selectedLanguage }: UpsellManagerProps) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpsell, setEditingUpsell] = useState<Upsell | null>(null);
  const [formData, setFormData] = useState({
    name: { pt: "", en: "" },
    description: { pt: "", en: "" },
    price: 0,
    category: "other",
    image_url: "",
    is_available: true,
  });

  // Fetch upsells
  const { data: upsells = [], isLoading } = useQuery({
    queryKey: ["guidebook-upsells", guidebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebook_upsells")
        .select("*")
        .eq("guidebook_id", guidebookId)
        .order("created_at");
      if (error) throw error;
      return data as Upsell[];
    },
  });

  // Create upsell mutation
  const createUpsell = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("guidebook_upsells").insert({
        guidebook_id: guidebookId,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image_url: data.image_url || null,
        is_available: data.is_available,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-upsells", guidebookId] });
      toast.success("Upsell criado com sucesso!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar upsell");
    },
  });

  // Update upsell mutation
  const updateUpsell = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("guidebook_upsells")
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image_url: data.image_url || null,
          is_available: data.is_available,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-upsells", guidebookId] });
      toast.success("Upsell atualizado!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar upsell");
    },
  });

  // Delete upsell mutation
  const deleteUpsell = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("guidebook_upsells")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-upsells", guidebookId] });
      toast.success("Upsell removido!");
    },
    onError: () => {
      toast.error("Erro ao remover upsell");
    },
  });

  // Toggle availability mutation
  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from("guidebook_upsells")
        .update({ is_available })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-upsells", guidebookId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: { pt: "", en: "" },
      description: { pt: "", en: "" },
      price: 0,
      category: "other",
      image_url: "",
      is_available: true,
    });
    setEditingUpsell(null);
    setDialogOpen(false);
  };

  const openEditDialog = (upsell: Upsell) => {
    setEditingUpsell(upsell);
    const nameData = upsell.name as Record<string, string>;
    const descData = upsell.description as Record<string, string>;
    setFormData({
      name: { pt: nameData?.pt || "", en: nameData?.en || "" },
      description: { pt: descData?.pt || "", en: descData?.en || "" },
      price: upsell.price,
      category: upsell.category || "other",
      image_url: upsell.image_url || "",
      is_available: upsell.is_available,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.pt && !formData.name.en) {
      toast.error("Por favor, preencha o nome do upsell");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Por favor, defina um preço válido");
      return;
    }

    if (editingUpsell) {
      updateUpsell.mutate({ id: editingUpsell.id, data: formData });
    } else {
      createUpsell.mutate(formData);
    }
  };

  const getCategoryLabel = (category: string | null) => {
    return CATEGORIES.find(c => c.value === category)?.label || "Outros";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Upsells & Serviços</h3>
          <p className="text-sm text-muted-foreground">
            Adicione serviços adicionais para vender aos hóspedes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">A carregar...</div>
      ) : upsells.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum upsell configurado</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro upsell
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {upsells.map((upsell) => (
            <Card key={upsell.id} className={!upsell.is_available ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {upsell.image_url ? (
                    <img
                      src={upsell.image_url}
                      alt={(upsell.name as Record<string, string>)[selectedLanguage] || ""}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium truncate">
                          {(upsell.name as Record<string, string>)[selectedLanguage] || 
                           (upsell.name as Record<string, string>).pt || 
                           "Sem nome"}
                        </h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {getCategoryLabel(upsell.category)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          €{upsell.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {(upsell.description as Record<string, string>)[selectedLanguage] || 
                       (upsell.description as Record<string, string>).pt || 
                       ""}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={upsell.is_available}
                          onCheckedChange={(checked) =>
                            toggleAvailability.mutate({ id: upsell.id, is_available: checked })
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {upsell.is_available ? "Disponível" : "Indisponível"}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(upsell)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Tem a certeza que pretende remover este upsell?")) {
                              deleteUpsell.mutate(upsell.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUpsell ? "Editar Upsell" : "Novo Upsell"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome (PT)</Label>
                <Input
                  value={formData.name.pt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: { ...formData.name, pt: e.target.value },
                    })
                  }
                  placeholder="Ex: Transfer Aeroporto"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome (EN)</Label>
                <Input
                  value={formData.name.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: { ...formData.name, en: e.target.value },
                    })
                  }
                  placeholder="Ex: Airport Transfer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Descrição (PT)</Label>
                <Textarea
                  value={formData.description.pt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: { ...formData.description, pt: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (EN)</Label>
                <Textarea
                  value={formData.description.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: { ...formData.description, en: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              currentUrl={formData.image_url || null}
              onUpload={(url) => setFormData({ ...formData, image_url: url })}
              onRemove={() => setFormData({ ...formData, image_url: "" })}
              label="Imagem do Upsell"
              aspectRatio="wide"
              guidebookId={guidebookId}
            />

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_available: checked })
                }
              />
              <Label>Disponível para venda</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createUpsell.isPending || updateUpsell.isPending}
            >
              {editingUpsell ? "Guardar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
