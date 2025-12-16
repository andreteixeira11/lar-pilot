import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Clock, 
  Send,
  AlertTriangle,
  Home,
  Check,
  Wifi,
  Tv,
  Car,
  ChefHat,
  Waves,
  Snowflake,
  Flame,
  PawPrint,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, differenceInDays, addDays, isWithinInterval, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BookingPageData {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string | null;
  price_per_night: number;
  min_nights: number;
  max_nights: number;
  cleaning_fee: number;
  check_in_time: string;
  check_out_time: string;
  house_rules: string;
  cancellation_policy: string;
  contact_form_enabled: boolean;
  hero_image_url: string;
  logo_url: string | null;
  gallery_images: string[] | string | null;
  amenities: string[] | string | null;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  button_hover_color: string;
  font_family: string;
  show_gallery: boolean;
  show_amenities: boolean;
  show_rules: boolean;
  show_cancellation_policy: boolean;
  book_button_text: string;
  contact_button_text: string;
  property: {
    name: string;
    address: string;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
  };
}

interface BookedDate {
  check_in: string;
  check_out: string;
}

// Map amenities to icons
const amenityIcons: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="h-4 w-4" />,
  "TV": <Tv className="h-4 w-4" />,
  "Estacionamento": <Car className="h-4 w-4" />,
  "Cozinha": <ChefHat className="h-4 w-4" />,
  "Piscina": <Waves className="h-4 w-4" />,
  "Ar Condicionado": <Snowflake className="h-4 w-4" />,
  "Aquecimento": <Flame className="h-4 w-4" />,
  "Pet Friendly": <PawPrint className="h-4 w-4" />,
};

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    num_guests: 1,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [buttonHovered, setButtonHovered] = useState(false);

  // Fetch page data
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-booking-page", slug],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-page?slug=${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw result;
      }
      
      return result as { page: BookingPageData; bookedDates: BookedDate[] };
    },
    enabled: !!slug,
    retry: false,
  });

  // Load custom font
  useEffect(() => {
    if (data?.page?.font_family && data.page.font_family !== "Lato") {
      const fontName = data.page.font_family.replace(/ /g, "+");
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [data?.page?.font_family]);

  // Check if date is booked
  const isDateBooked = (date: Date) => {
    if (!data?.bookedDates) return false;
    
    return data.bookedDates.some((booking) => {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      return isWithinInterval(date, { start: checkIn, end: addDays(checkOut, -1) });
    });
  };

  // Calculate price
  const priceDetails = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !data?.page) return null;
    
    const nights = differenceInDays(dateRange.to, dateRange.from);
    if (nights < 1) return null;

    const nightsPrice = nights * (data.page.price_per_night || 0);
    const cleaningFee = data.page.cleaning_fee || 0;
    const total = nightsPrice + cleaningFee;

    return { nights, nightsPrice, cleaningFee, total };
  }, [dateRange, data?.page]);

  // Submit booking request
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to || !data?.page) {
        throw new Error("Dados incompletos");
      }

      const { error } = await supabase
        .from("direct_booking_requests")
        .insert({
          page_id: data.page.id,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email,
          guest_phone: formData.guest_phone || null,
          check_in: format(dateRange.from, "yyyy-MM-dd"),
          check_out: format(dateRange.to, "yyyy-MM-dd"),
          num_guests: formData.num_guests,
          message: formData.message || null,
          total_price: priceDetails?.total || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Pedido enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guest_name || !formData.guest_email) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Selecione as datas da estadia.");
      return;
    }

    const nights = differenceInDays(dateRange.to, dateRange.from);
    if (nights < (data?.page?.min_nights || 1)) {
      toast.error(`Mínimo de ${data?.page?.min_nights} noites.`);
      return;
    }

    if (nights > (data?.page?.max_nights || 30)) {
      toast.error(`Máximo de ${data?.page?.max_nights} noites.`);
      return;
    }

    submitMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error states
  if (error) {
    const err = error as any;
    
    if (err.notFound) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Página não encontrada</CardTitle>
              <CardDescription>
                O alojamento que procura não existe ou foi removido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (err.subscriptionExpired) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle>Página Temporariamente Indisponível</CardTitle>
              <CardDescription>
                Esta página de reservas não está disponível de momento. Por favor, contacte o proprietário diretamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>Ocorreu um erro ao carregar a página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const page = data?.page;
  if (!page) return null;

  // Custom styles based on page customization
  const customStyles = {
    fontFamily: page.font_family || "Lato",
    "--page-primary": page.primary_color || "#247d7f",
    "--page-secondary": page.secondary_color || "#1e293b",
    "--page-button": page.button_color || "#247d7f",
    "--page-button-hover": page.button_hover_color || "#1d6466",
  } as React.CSSProperties;

  // Parse gallery_images and amenities (they come as JSON from the database)
  const galleryImages: string[] = Array.isArray(page.gallery_images) 
    ? page.gallery_images 
    : (typeof page.gallery_images === 'string' ? JSON.parse(page.gallery_images) : []);
  
  const amenitiesList: string[] = Array.isArray(page.amenities) 
    ? page.amenities 
    : (typeof page.amenities === 'string' ? JSON.parse(page.amenities) : []);

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" style={customStyles}>
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${page.primary_color}20` }}>
              <Check className="h-8 w-8" style={{ color: page.primary_color }} />
            </div>
            <CardTitle style={{ fontFamily: customStyles.fontFamily }}>Pedido Enviado!</CardTitle>
            <CardDescription>
              O seu pedido de reserva foi enviado com sucesso. O proprietário irá contactá-lo em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-left">
              <p className="text-sm"><strong>Alojamento:</strong> {page.title || page.property.name}</p>
              <p className="text-sm"><strong>Datas:</strong> {dateRange?.from && format(dateRange.from, "dd MMM", { locale: pt })} - {dateRange?.to && format(dateRange.to, "dd MMM yyyy", { locale: pt })}</p>
              <p className="text-sm"><strong>Total:</strong> €{priceDetails?.total.toFixed(2)}</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={customStyles}>
      {/* Header with Logo */}
      {page.logo_url && (
        <header className="absolute top-4 left-4 z-20">
          <img 
            src={page.logo_url} 
            alt="Logo" 
            className="h-12 w-auto object-contain"
          />
        </header>
      )}

      {/* Hero Section */}
      <div 
        className="relative h-64 sm:h-80 lg:h-[450px]"
        style={{ 
          background: page.hero_image_url 
            ? undefined 
            : `linear-gradient(135deg, ${page.primary_color || "#247d7f"}30, ${page.secondary_color || "#1e293b"}20)` 
        }}
      >
        {page.hero_image_url ? (
          <img 
            src={page.hero_image_url} 
            alt={page.title || page.property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="h-20 w-20" style={{ color: `${page.primary_color}50` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10 pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle 
                  className="text-2xl sm:text-3xl"
                  style={{ fontFamily: customStyles.fontFamily }}
                >
                  {page.title || page.property.name}
                </CardTitle>
                {page.short_description && (
                  <p className="text-muted-foreground mt-1">{page.short_description}</p>
                )}
                <CardDescription className="flex items-center gap-2 text-base mt-2">
                  <MapPin className="h-4 w-4" style={{ color: page.primary_color }} />
                  {page.property.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge 
                    variant="secondary" 
                    className="text-sm py-1.5 px-4"
                    style={{ backgroundColor: `${page.primary_color}15`, color: page.primary_color }}
                  >
                    <Users className="h-4 w-4 mr-1.5" />
                    {page.property.capacity} hóspedes
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-sm py-1.5 px-4"
                    style={{ backgroundColor: `${page.primary_color}15`, color: page.primary_color }}
                  >
                    <Bed className="h-4 w-4 mr-1.5" />
                    {page.property.bedrooms} quartos
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-sm py-1.5 px-4"
                    style={{ backgroundColor: `${page.primary_color}15`, color: page.primary_color }}
                  >
                    <Bath className="h-4 w-4 mr-1.5" />
                    {page.property.bathrooms} WC
                  </Badge>
                </div>

                {page.description && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {page.description}
                    </p>
                  </>
                )}

                {/* Gallery Section */}
                {page.show_gallery !== false && galleryImages.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-4" style={{ fontFamily: customStyles.fontFamily }}>Galeria</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {galleryImages.slice(0, 6).map((url, index) => (
                          <div 
                            key={index} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setGalleryOpen(true);
                            }}
                          >
                            <img 
                              src={url} 
                              alt={`Galeria ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 5 && galleryImages.length > 6 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                                +{galleryImages.length - 6}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Amenities Section */}
                {page.show_amenities !== false && amenitiesList.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-4" style={{ fontFamily: customStyles.fontFamily }}>Comodidades</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {amenitiesList.map((amenity, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-3 rounded-lg border"
                          >
                            <span style={{ color: page.primary_color }}>
                              {amenityIcons[amenity] || <Check className="h-4 w-4" />}
                            </span>
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-6" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${page.primary_color}15` }}
                    >
                      <Clock className="h-5 w-5" style={{ color: page.primary_color }} />
                    </div>
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">A partir das {page.check_in_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${page.primary_color}15` }}
                    >
                      <Clock className="h-5 w-5" style={{ color: page.primary_color }} />
                    </div>
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">Até às {page.check_out_time}</p>
                    </div>
                  </div>
                </div>

                {page.show_rules !== false && page.house_rules && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-2" style={{ fontFamily: customStyles.fontFamily }}>Regras da Casa</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {page.house_rules}
                      </p>
                    </div>
                  </>
                )}

                {page.show_cancellation_policy !== false && page.cancellation_policy && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-2" style={{ fontFamily: customStyles.fontFamily }}>Política de Cancelamento</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {page.cancellation_policy}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: page.primary_color }}>
                    €{page.price_per_night}
                  </span>
                  <span className="text-muted-foreground">/ noite</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Selecione as datas</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) => date < new Date() || isDateBooked(date)}
                    locale={pt}
                    className="rounded-md border"
                  />
                </div>

                {priceDetails && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>€{page.price_per_night} × {priceDetails.nights} noites</span>
                      <span>€{priceDetails.nightsPrice.toFixed(2)}</span>
                    </div>
                    {priceDetails.cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Taxa de limpeza</span>
                        <span>€{priceDetails.cleaningFee.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span style={{ color: page.primary_color }}>€{priceDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {page.contact_form_enabled && (
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.guest_name}
                        onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.guest_email}
                        onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.guest_phone}
                        onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guests">Nº de Hóspedes</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={page.property.capacity}
                        value={formData.num_guests}
                        onChange={(e) => setFormData({ ...formData, num_guests: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem (opcional)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full rounded-full transition-colors"
                      style={{ 
                        backgroundColor: buttonHovered ? page.button_hover_color : page.button_color,
                        color: "white"
                      }}
                      onMouseEnter={() => setButtonHovered(true)}
                      onMouseLeave={() => setButtonHovered(false)}
                      disabled={submitMutation.isPending || !dateRange?.from || !dateRange?.to}
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {page.book_button_text || "Enviar Pedido de Reserva"}
                    </Button>
                  </form>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Mínimo {page.min_nights} noites · Máximo {page.max_nights} noites
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Gallery Dialog */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative aspect-video bg-black">
            <img 
              src={galleryImages[currentImageIndex]} 
              alt={`Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {galleryImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Powered by <Link to="/" className="hover:underline" style={{ color: page.primary_color }}>Monumenta</Link></p>
      </footer>
    </div>
  );
}
