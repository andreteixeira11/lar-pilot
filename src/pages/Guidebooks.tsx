import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { GuidebookEditor } from "@/components/guidebook/GuidebookEditor";
import { 
  Plus, 
  BookOpen, 
  Globe, 
  Smartphone, 
  Palette, 
  ShoppingCart,
  MapPin,
  Key,
  Coffee,
  Wifi,
  Car,
  Info,
  Languages,
  Eye,
  Settings,
  Edit,
  Crown,
  ExternalLink,
  QrCode,
} from "lucide-react";

const LANGUAGES = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const SECTION_TYPES = [
  { type: "welcome", icon: Info, label: "Boas-vindas" },
  { type: "wifi", icon: Wifi, label: "WiFi" },
  { type: "checkin", icon: Key, label: "Check-in" },
  { type: "checkout", icon: Key, label: "Check-out" },
  { type: "parking", icon: Car, label: "Estacionamento" },
  { type: "amenities", icon: Coffee, label: "Comodidades" },
  { type: "location", icon: MapPin, label: "Localização" },
  { type: "rules", icon: Info, label: "Regras da Casa" },
  { type: "emergency", icon: Info, label: "Emergência" },
  { type: "tours", icon: Globe, label: "Tours & Experiências" },
];

const Guidebooks = () => {
  const { user, profile } = useAuth();
  const { selectedProperty, properties } = useProperty();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGuidebookId, setEditingGuidebookId] = useState<string | null>(null);
  const [newGuidebook, setNewGuidebook] = useState({
    title: "",
    welcome_message: "",
    primary_color: "#1a7a6e",
  });

  const isPremium = profile?.subscription_plan === "premium";

  // Fetch guidebooks
  const { data: guidebooks, isLoading } = useQuery({
    queryKey: ["guidebooks", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      const { data, error } = await supabase
        .from("guidebooks")
        .select("*")
        .eq("property_id", selectedProperty.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProperty?.id,
  });

  // Create guidebook mutation
  const createGuidebook = useMutation({
    mutationFn: async () => {
      if (!selectedProperty?.id) throw new Error("Selecione uma propriedade");
      
      const { data, error } = await supabase
        .from("guidebooks")
        .insert({
          property_id: selectedProperty.id,
          title: newGuidebook.title || selectedProperty.name,
          welcome_message: newGuidebook.welcome_message,
          primary_color: newGuidebook.primary_color,
          languages: ["pt", "en"],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Guidebook criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["guidebooks"] });
      setIsCreateOpen(false);
      setNewGuidebook({ title: "", welcome_message: "", primary_color: "#1a7a6e" });
      setEditingGuidebookId(data.id);
    },
    onError: (error) => {
      toast.error("Erro ao criar guidebook: " + error.message);
    },
  });

  // Toggle publish mutation
  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("guidebooks")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebooks"] });
      toast.success("Estado atualizado!");
    },
  });

  // Delete guidebook mutation
  const deleteGuidebook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guidebooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebooks"] });
      toast.success("Guidebook eliminado!");
    },
  });

  // If editing a guidebook, show the editor
  if (editingGuidebookId) {
    return (
      <div className="p-0 md:p-0 lg:p-0">
        <GuidebookEditor
          guidebookId={editingGuidebookId}
          onBack={() => setEditingGuidebookId(null)}
        />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Guidebooks Digitais"
          description="Crie guias personalizados para os seus hóspedes"
        />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Funcionalidade Premium</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Os Guidebooks Digitais estão disponíveis exclusivamente para utilizadores Premium.
                Atualize o seu plano para desbloquear esta funcionalidade.
              </p>
              <Button onClick={() => window.location.href = "/subscriptions"}>
                Atualizar para Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Guidebooks Digitais"
        description="Crie guias personalizados para os seus hóspedes em 5 idiomas"
      />

      {/* Features Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Mobile-First</p>
                <p className="text-xs text-muted-foreground">100% otimizado para telemóveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">5 Idiomas</p>
                <p className="text-xs text-muted-foreground">PT, EN, DE, ES, FR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Upselling</p>
                <p className="text-xs text-muted-foreground">Venda serviços adicionais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Personalizável</p>
                <p className="text-xs text-muted-foreground">Cores e design adaptável</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidebooks List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Os Seus Guidebooks</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Guidebook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Guidebook</DialogTitle>
                <DialogDescription>
                  Configure o guidebook para {selectedProperty?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newGuidebook.title}
                    onChange={(e) => setNewGuidebook({ ...newGuidebook, title: e.target.value })}
                    placeholder={selectedProperty?.name || "Nome do guidebook"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem de Boas-Vindas</Label>
                  <Textarea
                    value={newGuidebook.welcome_message}
                    onChange={(e) => setNewGuidebook({ ...newGuidebook, welcome_message: e.target.value })}
                    placeholder="Bem-vindo ao nosso alojamento..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newGuidebook.primary_color}
                      onChange={(e) => setNewGuidebook({ ...newGuidebook, primary_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={newGuidebook.primary_color}
                      onChange={(e) => setNewGuidebook({ ...newGuidebook, primary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => createGuidebook.mutate()} disabled={createGuidebook.isPending}>
                    Criar Guidebook
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              A carregar guidebooks...
            </CardContent>
          </Card>
        ) : guidebooks?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum guidebook criado</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Crie o primeiro guidebook para {selectedProperty?.name}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Guidebook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guidebooks?.map((guidebook) => (
              <Card key={guidebook.id} className="overflow-hidden">
                <div 
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: guidebook.primary_color || "#1a7a6e" }}
                >
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{guidebook.title}</h3>
                      <div className="flex gap-1 mt-1">
                        {(guidebook.languages as string[] || ["pt", "en"]).map((lang) => (
                          <span key={lang} className="text-xs">
                            {LANGUAGES.find(l => l.code === lang)?.flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Badge variant={guidebook.is_published ? "default" : "secondary"}>
                      {guidebook.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={guidebook.is_published}
                        onCheckedChange={(checked) => 
                          togglePublish.mutate({ id: guidebook.id, is_published: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">Publicar</span>
                    </div>
                    <div className="flex gap-1">
                      {guidebook.is_published && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/guidebook/${guidebook.id}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGuidebookId(guidebook.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section Types Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Secções Disponíveis</CardTitle>
          <CardDescription>
            Personalize o conteúdo de cada secção do seu guidebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SECTION_TYPES.map((section) => (
              <div key={section.type} className="flex items-center gap-3 p-3 rounded-lg border">
                <section.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{section.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upsell Info */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Upselling de Serviços
          </CardTitle>
          <CardDescription>
            Aumente a sua receita vendendo serviços adicionais diretamente no guidebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <Coffee className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Pequeno-almoço</h4>
              <p className="text-sm text-muted-foreground">Ofereça cestas de pequeno-almoço</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Globe className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Tours & Experiências</h4>
              <p className="text-sm text-muted-foreground">Venda passeios e atividades locais</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Car className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Transfers</h4>
              <p className="text-sm text-muted-foreground">Ofereça transporte de/para aeroporto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guidebooks;
