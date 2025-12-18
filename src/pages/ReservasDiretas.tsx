import { useState, useEffect } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Save,
  Settings,
  Palette,
  Inbox,
  Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DirectBookingCustomization } from "@/components/DirectBookingCustomization";
import { BookingRequestDialog } from "@/components/BookingRequestDialog";
import { DynamicPricingManager } from "@/components/DynamicPricingManager";
import { ICalSyncCard } from "@/components/ICalSyncCard";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface DirectBookingPage {
  id: string;
  property_id: string;
  slug: string;
  is_published: boolean;
  title: string | null;
  description: string | null;
  short_description: string | null;
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
  logo_url: string | null;
  gallery_images: string[];
  amenities: string[];
  primary_color: string | null;
  secondary_color: string | null;
  button_color: string | null;
  button_hover_color: string | null;
  font_family: string | null;
  show_gallery: boolean;
  show_amenities: boolean;
  show_rules: boolean;
  show_cancellation_policy: boolean;
  book_button_text: string | null;
  contact_button_text: string | null;
}

interface BookingRequest {
  id: string;
  page_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  message: string | null;
  total_price: number | null;
  status: string;
  created_at: string;
}

export default function ReservasDiretas() {
  const { selectedPropertyId, properties } = useProperty();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("config");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [slugError, setSlugError] = useState("");
  const [formData, setFormData] = useState<Partial<DirectBookingPage>>({
    title: "",
    description: "",
    short_description: "",
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
    primary_color: "#247d7f",
    secondary_color: "#1e293b",
    button_color: "#247d7f",
    button_hover_color: "#1d6466",
    font_family: "Lato",
    show_gallery: true,
    show_amenities: true,
    show_rules: true,
    show_cancellation_policy: true,
    book_button_text: "Reservar Agora",
    contact_button_text: "Pedir Informações",
    gallery_images: [],
    amenities: [],
  });
  const [copied, setCopied] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  
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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BookingRequest[];
    },
    enabled: !!existingPage?.id,
  });

  const pendingRequests = bookingRequests?.filter(r => r.status === "pending") || [];

  // Handle requestId from URL to open booking request dialog
  useEffect(() => {
    const requestId = searchParams.get("requestId");
    if (requestId && bookingRequests) {
      const request = bookingRequests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setRequestDialogOpen(true);
        setActiveTab("requests");
        // Clear the URL param after opening
        searchParams.delete("requestId");
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, bookingRequests]);

  // Update form when existing page loads
  useEffect(() => {
    if (existingPage) {
      setSlug(existingPage.slug);
      setFormData({
        title: existingPage.title || "",
        description: existingPage.description || "",
        short_description: existingPage.short_description || "",
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
        hero_image_url: existingPage.hero_image_url,
        logo_url: existingPage.logo_url,
        gallery_images: existingPage.gallery_images || [],
        amenities: existingPage.amenities || [],
        primary_color: existingPage.primary_color || "#247d7f",
        secondary_color: existingPage.secondary_color || "#1e293b",
        button_color: existingPage.button_color || "#247d7f",
        button_hover_color: existingPage.button_hover_color || "#1d6466",
        font_family: existingPage.font_family || "Lato",
        show_gallery: existingPage.show_gallery !== false,
        show_amenities: existingPage.show_amenities !== false,
        show_rules: existingPage.show_rules !== false,
        show_cancellation_policy: existingPage.show_cancellation_policy !== false,
        book_button_text: existingPage.book_button_text || "Reservar Agora",
        contact_button_text: existingPage.contact_button_text || "Pedir Informações",
      });
      setSlugStatus("valid");
    } else if (selectedProperty) {
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

  const openRequest = (request: BookingRequest) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="customize" className="gap-2">
            <Palette className="h-4 w-4" />
            Personalização
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Inbox className="h-4 w-4" />
            Pedidos
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
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

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Preços e Regras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <Separator />

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

              {/* Dynamic Pricing */}
              <DynamicPricingManager 
                pageId={existingPage?.id} 
                defaultPrice={formData.price_per_night || 0}
              />

              {/* iCal Sync */}
              {existingPage?.id && (
                <ICalSyncCard pageId={existingPage.id} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Page Link */}
                  {existingPage?.is_published && existingPage.slug && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-xs text-muted-foreground">Link da página:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background rounded px-2 py-1 truncate">
                          {baseUrl}/p/{existingPage.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={copyLink}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={`${baseUrl}/p/${existingPage.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full rounded-full"
                    onClick={() => saveMutation.mutate(existingPage?.is_published || true)}
                    disabled={saveMutation.isPending || slugStatus !== "valid"}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {existingPage?.is_published ? "Guardar e Atualizar" : "Publicar Página"}
                  </Button>

                  {!existingPage && (
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
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              {bookingRequests && bookingRequests.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{pendingRequests.length}</p>
                        <p className="text-xs text-muted-foreground">Pendentes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {bookingRequests.filter(r => r.status === "accepted").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Aceites</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customize" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DirectBookingCustomization
                data={formData}
                onChange={(newData) => setFormData({ ...formData, ...newData })}
                userId={user?.id || ""}
                propertyId={selectedPropertyId}
              />
            </div>

            <div className="space-y-6">
              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Pré-visualização
                  </CardTitle>
                  <CardDescription>
                    Veja como a sua página ficará
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className="aspect-video rounded-lg border overflow-hidden relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.primary_color || "#247d7f"}20, ${formData.secondary_color || "#1e293b"}20)` 
                    }}
                  >
                    {formData.logo_url && (
                      <img 
                        src={formData.logo_url}
                        alt="Logo"
                        className="absolute top-2 left-2 h-6 w-auto object-contain z-10"
                      />
                    )}
                    {formData.hero_image_url ? (
                      <img 
                        src={formData.hero_image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Imagem de capa
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-lg border space-y-2">
                    <h4 
                      className="font-semibold"
                      style={{ fontFamily: formData.font_family || "Lato" }}
                    >
                      {formData.title || "Nome do Alojamento"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formData.short_description || "Descrição curta..."}
                    </p>
                    {(formData.amenities || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(formData.amenities || []).slice(0, 3).map((amenity, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0"
                            style={{ backgroundColor: `${formData.primary_color || "#247d7f"}15`, color: formData.primary_color || "#247d7f" }}
                          >
                            {amenity}
                          </Badge>
                        ))}
                        {(formData.amenities || []).length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{(formData.amenities || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full rounded-full text-xs text-white"
                      style={{ 
                        backgroundColor: formData.button_color || "#247d7f",
                      }}
                    >
                      {formData.book_button_text || "Reservar Agora"}
                    </Button>
                  </div>

                  {/* Preview in New Tab Button */}
                  {slug && slugStatus === "valid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => {
                        // Save first, then open preview
                        saveMutation.mutate(false, {
                          onSuccess: () => {
                            window.open(`${baseUrl}/p/${slug}`, "_blank");
                          }
                        });
                      }}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Pré-visualizar em Nova Aba
                    </Button>
                  )}
                </CardContent>
              </Card>

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
                    Guardar Alterações
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Pedidos de Reserva
              </CardTitle>
              <CardDescription>
                Gerencie os pedidos de reserva recebidos na sua página
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!bookingRequests || bookingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium mb-1">Sem pedidos de reserva</h3>
                  <p className="text-sm text-muted-foreground">
                    Os pedidos de reserva enviados pelos hóspedes aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Pendentes ({pendingRequests.length})
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pendingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => openRequest(request)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium">{request.guest_name}</span>
                              <Badge variant="secondary">Pendente</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(request.check_in), "d MMM", { locale: pt })} - {format(new Date(request.check_out), "d MMM yyyy", { locale: pt })}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{request.num_guests} hóspedes</span>
                              {request.total_price && (
                                <span className="font-semibold text-primary">
                                  €{request.total_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Requests */}
                  {bookingRequests.filter(r => r.status !== "pending").length > 0 && (
                    <>
                      {pendingRequests.length > 0 && <Separator />}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Histórico</h4>
                        <div className="space-y-2">
                          {bookingRequests
                            .filter(r => r.status !== "pending")
                            .map((request) => (
                              <div
                                key={request.id}
                                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => openRequest(request)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium text-sm">{request.guest_name}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(request.check_in), "d MMM", { locale: pt })} - {format(new Date(request.check_out), "d MMM yyyy", { locale: pt })}
                                    </p>
                                  </div>
                                  <Badge variant={request.status === "accepted" ? "default" : "destructive"}>
                                    {request.status === "accepted" ? "Aceite" : "Rejeitado"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BookingRequestDialog
        request={selectedRequest}
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        propertyId={selectedPropertyId}
      />
    </div>
  );
}
