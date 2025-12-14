import { useState, useEffect } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Globe, 
  Link2, 
  Copy, 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  Crown,
  AlertCircle,
  Eye,
  Save
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DirectBookingPage {
  id: string;
  property_id: string;
  slug: string;
  is_published: boolean;
  title: string | null;
  description: string | null;
  price_per_night: number | null;
  min_nights: number | null;
  max_nights: number | null;
  cleaning_fee: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  house_rules: string | null;
  cancellation_policy: string | null;
  contact_form_enabled: boolean;
  payment_enabled: boolean;
  hero_image_url: string | null;
  amenities: string[];
}

export default function ReservasDiretas() {
  const { selectedPropertyId, properties } = useProperty();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [slugError, setSlugError] = useState("");
  const [formData, setFormData] = useState<Partial<DirectBookingPage>>({
    title: "",
    description: "",
    price_per_night: 0,
    min_nights: 1,
    max_nights: 30,
    cleaning_fee: 0,
    check_in_time: "15:00",
    check_out_time: "11:00",
    house_rules: "",
    cancellation_policy: "",
    contact_form_enabled: true,
    payment_enabled: false,
  });
  const [copied, setCopied] = useState(false);
  
  const isPremium = profile?.subscription_plan === "premium";
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  
  const baseUrl = window.location.origin;

  // Fetch existing page
  const { data: existingPage, isLoading } = useQuery({
    queryKey: ["direct-booking-page", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return null;
      
      const { data, error } = await supabase
        .from("direct_booking_pages")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DirectBookingPage | null;
    },
    enabled: !!selectedPropertyId,
  });

  // Fetch booking requests
  const { data: bookingRequests } = useQuery({
    queryKey: ["booking-requests", existingPage?.id],
    queryFn: async () => {
      if (!existingPage?.id) return [];
      
      const { data, error } = await supabase
        .from("direct_booking_requests")
        .select("*")
        .eq("page_id", existingPage.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!existingPage?.id,
  });

  // Update form when existing page loads
  useEffect(() => {
    if (existingPage) {
      setSlug(existingPage.slug);
      setFormData({
        title: existingPage.title || "",
        description: existingPage.description || "",
        price_per_night: existingPage.price_per_night || 0,
        min_nights: existingPage.min_nights || 1,
        max_nights: existingPage.max_nights || 30,
        cleaning_fee: existingPage.cleaning_fee || 0,
        check_in_time: existingPage.check_in_time || "15:00",
        check_out_time: existingPage.check_out_time || "11:00",
        house_rules: existingPage.house_rules || "",
        cancellation_policy: existingPage.cancellation_policy || "",
        contact_form_enabled: existingPage.contact_form_enabled,
        payment_enabled: existingPage.payment_enabled,
      });
      setSlugStatus("valid");
    } else if (selectedProperty) {
      // Pre-fill with property name as slug suggestion
      const suggestedSlug = selectedProperty.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);
      setSlug(suggestedSlug);
      setFormData(prev => ({
        ...prev,
        title: selectedProperty.name,
        check_in_time: "15:00",
        check_out_time: "11:00",
      }));
    }
  }, [existingPage, selectedProperty]);

  // Validate slug
  const validateSlug = async (value: string) => {
    if (!value || value.length < 3) {
      setSlugStatus("invalid");
      setSlugError("O slug deve ter pelo menos 3 caracteres.");
      return;
    }

    setSlugStatus("checking");
    
    try {
      const { data, error } = await supabase.functions.invoke("validate-slug", {
        body: { slug: value, propertyId: selectedPropertyId },
      });

      if (error) throw error;

      if (data.valid) {
        setSlugStatus("valid");
        setSlugError("");
      } else {
        setSlugStatus("invalid");
        setSlugError(data.error);
      }
    } catch (err) {
      setSlugStatus("invalid");
      setSlugError("Erro ao validar slug.");
    }
  };

  // Debounced slug validation
  useEffect(() => {
    if (!slug || slug === existingPage?.slug) {
      if (slug === existingPage?.slug) setSlugStatus("valid");
      return;
    }
    
    const timer = setTimeout(() => validateSlug(slug), 500);
    return () => clearTimeout(timer);
  }, [slug, existingPage?.slug]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!selectedPropertyId || !isPremium) {
        throw new Error("Sem permissão para guardar.");
      }

      if (slugStatus !== "valid") {
        throw new Error("O slug não é válido.");
      }

      const pageData = {
        property_id: selectedPropertyId,
        slug: slug.toLowerCase(),
        is_published: publish,
        ...formData,
      };

      if (existingPage) {
        const { error } = await supabase
          .from("direct_booking_pages")
          .update(pageData)
          .eq("id", existingPage.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("direct_booking_pages")
          .insert(pageData);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, publish) => {
      queryClient.invalidateQueries({ queryKey: ["direct-booking-page"] });
      toast.success(publish ? "Página publicada com sucesso!" : "Alterações guardadas!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao guardar.");
    },
  });

  const handleSlugChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");
    setSlug(cleaned);
    setSlugStatus("idle");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${baseUrl}/p/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  if (!selectedPropertyId) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Reservas Diretas" />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma propriedade selecionada</AlertTitle>
          <AlertDescription>
            Selecione uma propriedade para configurar a página de reservas diretas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Reservas Diretas" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Non-premium user view
  if (!isPremium) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Reservas Diretas" />
        
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Funcionalidade Premium</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              A Página de Reservas Diretas com URL personalizada está disponível apenas para planos Premium.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-card rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h4 className="font-medium mb-3">Com esta funcionalidade pode:</h4>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Criar uma página pública personalizada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Aceitar reservas diretas sem comissões
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Definir preços e disponibilidade
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  URL personalizada: {baseUrl}/p/seu-alojamento
                </li>
              </ul>
            </div>
            <Button asChild size="lg" className="rounded-full">
              <a href="/subscriptions">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade para Premium
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader 
        title="Reservas Diretas" 
        description="Configure a sua página pública para receber reservas sem comissões"
      />

      {/* Status Banner */}
      {existingPage && (
        <Alert variant={existingPage.is_published ? "default" : "destructive"}>
          {existingPage.is_published ? (
            <>
              <Globe className="h-4 w-4" />
              <AlertTitle>Página Publicada</AlertTitle>
              <AlertDescription className="flex items-center gap-2 flex-wrap">
                <span>A sua página está acessível em:</span>
                <a 
                  href={`${baseUrl}/p/${existingPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {baseUrl}/p/{existingPage.slug}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Página não publicada</AlertTitle>
              <AlertDescription>
                A sua página ainda não está visível publicamente. Publique-a quando estiver pronta.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slug Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                URL Personalizada
              </CardTitle>
              <CardDescription>
                Escolha um slug único para a sua página de reservas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {baseUrl}/p/
                </span>
                <div className="flex-1 relative">
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="seu-alojamento"
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {slugStatus === "valid" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {slugStatus === "invalid" && (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  disabled={slugStatus !== "valid"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {slugError && (
                <p className="text-sm text-destructive">{slugError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas, números e hífens. Mínimo 3 caracteres.
              </p>
            </CardContent>
          </Card>

          {/* Page Content */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do alojamento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o seu alojamento..."
                  rows={4}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço por Noite (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price_per_night || ""}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleaning">Taxa de Limpeza (€)</Label>
                  <Input
                    id="cleaning"
                    type="number"
                    min="0"
                    value={formData.cleaning_fee || ""}
                    onChange={(e) => setFormData({ ...formData, cleaning_fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minNights">Noites Mínimas</Label>
                  <Input
                    id="minNights"
                    type="number"
                    min="1"
                    value={formData.min_nights || 1}
                    onChange={(e) => setFormData({ ...formData, min_nights: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxNights">Noites Máximas</Label>
                  <Input
                    id="maxNights"
                    type="number"
                    min="1"
                    value={formData.max_nights || 30}
                    onChange={(e) => setFormData({ ...formData, max_nights: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkin">Hora de Check-in</Label>
                  <Input
                    id="checkin"
                    type="time"
                    value={formData.check_in_time || "15:00"}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout">Hora de Check-out</Label>
                  <Input
                    id="checkout"
                    type="time"
                    value={formData.check_out_time || "11:00"}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rules">Regras da Casa</Label>
                <Textarea
                  id="rules"
                  value={formData.house_rules || ""}
                  onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                  placeholder="Regras e políticas do alojamento..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation">Política de Cancelamento</Label>
                <Textarea
                  id="cancellation"
                  value={formData.cancellation_policy || ""}
                  onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                  placeholder="Descreva a política de cancelamento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Opções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Formulário de Contacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que os hóspedes enviem pedidos de reserva
                  </p>
                </div>
                <Switch
                  checked={formData.contact_form_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, contact_form_enabled: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between opacity-50">
                <div>
                  <Label>Pagamento Online</Label>
                  <p className="text-sm text-muted-foreground">
                    Aceitar pagamentos diretamente na página (em breve)
                  </p>
                </div>
                <Switch
                  checked={false}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full rounded-full"
                onClick={() => saveMutation.mutate(false)}
                disabled={saveMutation.isPending || slugStatus !== "valid"}
                variant="outline"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Rascunho
              </Button>

              <Button
                className="w-full rounded-full"
                onClick={() => saveMutation.mutate(true)}
                disabled={saveMutation.isPending || slugStatus !== "valid"}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                {existingPage?.is_published ? "Atualizar Página" : "Publicar Página"}
              </Button>

              {existingPage?.is_published && (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  asChild
                >
                  <a href={`${baseUrl}/p/${existingPage.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Página
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          {bookingRequests && bookingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingRequests.map((request: any) => (
                  <div key={request.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{request.guest_name}</span>
                      <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                        {request.status === "pending" ? "Pendente" : request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.check_in).toLocaleDateString("pt-PT")} - {new Date(request.check_out).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
