import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Users,
  Wifi,
  Clock,
  BookOpen,
  Send,
  MessageSquare,
  Moon,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Globe,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { pt, enUS, es, fr, de } from "date-fns/locale";

type Language = "pt" | "en" | "es" | "fr" | "de";

const translations: Record<Language, Record<string, string>> = {
  pt: {
    title: "Portal do Hóspede",
    reservation: "A sua Reserva",
    property: "Alojamento",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "Noites",
    guests: "Hóspedes",
    wifiPassword: "Password Wi-Fi",
    checkInTime: "Hora de entrada",
    checkOutTime: "Hora de saída",
    guidebook: "Guia do Alojamento",
    viewGuidebook: "Ver Guia Completo",
    specialRequests: "Pedidos Especiais",
    requestType: "Tipo de pedido",
    earlyCheckin: "Check-in antecipado",
    lateCheckout: "Check-out tardio",
    extraBed: "Cama extra",
    transfer: "Transfer",
    other: "Outro",
    yourMessage: "A sua mensagem...",
    sendRequest: "Enviar Pedido",
    previousRequests: "Pedidos Anteriores",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    noRequests: "Nenhum pedido ainda",
    loading: "A carregar...",
    error: "Erro ao carregar os dados",
    invalidLink: "Link inválido",
    onlineCheckin: "Check-in Online",
    completeCheckin: "Preencher Check-in",
    checkinCompleted: "Check-in Completo",
    requestSent: "Pedido enviado com sucesso!",
    requestError: "Erro ao enviar pedido",
    status: "Estado",
    address: "Morada",
  },
  en: {
    title: "Guest Portal",
    reservation: "Your Reservation",
    property: "Property",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "Nights",
    guests: "Guests",
    wifiPassword: "Wi-Fi Password",
    checkInTime: "Check-in time",
    checkOutTime: "Check-out time",
    guidebook: "Property Guidebook",
    viewGuidebook: "View Full Guide",
    specialRequests: "Special Requests",
    requestType: "Request type",
    earlyCheckin: "Early check-in",
    lateCheckout: "Late check-out",
    extraBed: "Extra bed",
    transfer: "Transfer",
    other: "Other",
    yourMessage: "Your message...",
    sendRequest: "Send Request",
    previousRequests: "Previous Requests",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    noRequests: "No requests yet",
    loading: "Loading...",
    error: "Error loading data",
    invalidLink: "Invalid link",
    onlineCheckin: "Online Check-in",
    completeCheckin: "Complete Check-in",
    checkinCompleted: "Check-in Completed",
    requestSent: "Request sent successfully!",
    requestError: "Error sending request",
    status: "Status",
    address: "Address",
  },
  es: {
    title: "Portal del Huésped",
    reservation: "Su Reserva",
    property: "Alojamiento",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "Noches",
    guests: "Huéspedes",
    wifiPassword: "Contraseña Wi-Fi",
    checkInTime: "Hora de entrada",
    checkOutTime: "Hora de salida",
    guidebook: "Guía del Alojamiento",
    viewGuidebook: "Ver Guía Completa",
    specialRequests: "Solicitudes Especiales",
    requestType: "Tipo de solicitud",
    earlyCheckin: "Check-in anticipado",
    lateCheckout: "Check-out tardío",
    extraBed: "Cama extra",
    transfer: "Transfer",
    other: "Otro",
    yourMessage: "Su mensaje...",
    sendRequest: "Enviar Solicitud",
    previousRequests: "Solicitudes Anteriores",
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    noRequests: "Sin solicitudes aún",
    loading: "Cargando...",
    error: "Error al cargar datos",
    invalidLink: "Enlace inválido",
    onlineCheckin: "Check-in Online",
    completeCheckin: "Completar Check-in",
    checkinCompleted: "Check-in Completado",
    requestSent: "¡Solicitud enviada!",
    requestError: "Error al enviar solicitud",
    status: "Estado",
    address: "Dirección",
  },
  fr: {
    title: "Portail Invité",
    reservation: "Votre Réservation",
    property: "Hébergement",
    checkIn: "Arrivée",
    checkOut: "Départ",
    nights: "Nuits",
    guests: "Invités",
    wifiPassword: "Mot de passe Wi-Fi",
    checkInTime: "Heure d'arrivée",
    checkOutTime: "Heure de départ",
    guidebook: "Guide de l'hébergement",
    viewGuidebook: "Voir le Guide",
    specialRequests: "Demandes Spéciales",
    requestType: "Type de demande",
    earlyCheckin: "Arrivée anticipée",
    lateCheckout: "Départ tardif",
    extraBed: "Lit supplémentaire",
    transfer: "Transfer",
    other: "Autre",
    yourMessage: "Votre message...",
    sendRequest: "Envoyer",
    previousRequests: "Demandes Précédentes",
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Refusé",
    noRequests: "Aucune demande",
    loading: "Chargement...",
    error: "Erreur de chargement",
    invalidLink: "Lien invalide",
    onlineCheckin: "Check-in en Ligne",
    completeCheckin: "Compléter le Check-in",
    checkinCompleted: "Check-in Terminé",
    requestSent: "Demande envoyée !",
    requestError: "Erreur d'envoi",
    status: "Statut",
    address: "Adresse",
  },
  de: {
    title: "Gästeportal",
    reservation: "Ihre Reservierung",
    property: "Unterkunft",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "Nächte",
    guests: "Gäste",
    wifiPassword: "WLAN-Passwort",
    checkInTime: "Check-in Zeit",
    checkOutTime: "Check-out Zeit",
    guidebook: "Unterkunftsführer",
    viewGuidebook: "Vollständigen Führer ansehen",
    specialRequests: "Sonderwünsche",
    requestType: "Art der Anfrage",
    earlyCheckin: "Früher Check-in",
    lateCheckout: "Später Check-out",
    extraBed: "Zusatzbett",
    transfer: "Transfer",
    other: "Sonstiges",
    yourMessage: "Ihre Nachricht...",
    sendRequest: "Anfrage senden",
    previousRequests: "Vorherige Anfragen",
    pending: "Ausstehend",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    noRequests: "Noch keine Anfragen",
    loading: "Laden...",
    error: "Fehler beim Laden",
    invalidLink: "Ungültiger Link",
    onlineCheckin: "Online Check-in",
    completeCheckin: "Check-in ausfüllen",
    checkinCompleted: "Check-in abgeschlossen",
    requestSent: "Anfrage gesendet!",
    requestError: "Fehler beim Senden",
    status: "Status",
    address: "Adresse",
  },
};

const dateLocales: Record<Language, any> = { pt, en: enUS, es, fr, de };

export default function GuestPortal() {
  const { token } = useParams<{ token: string }>();
  const [lang, setLang] = useState<Language>("en");
  const [reservation, setReservation] = useState<any>(null);
  const [guidebook, setGuidebook] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState("other");
  const [requestMessage, setRequestMessage] = useState("");
  const [sending, setSending] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2) as Language;
    if (translations[browserLang]) setLang(browserLang);
  }, []);

  useEffect(() => {
    if (!token) {
      setError(t.invalidLink);
      setLoading(false);
      return;
    }
    fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-portal?token=${encodeURIComponent(token!)}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || t.error);
        return;
      }
      setReservation(data.reservation);
      setGuidebook(data.guidebook);
      setRequests(data.requests || []);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!requestMessage.trim()) return;
    setSending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-portal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action: "create_request",
            request_type: requestType,
            message: requestMessage,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success(t.requestSent);
      setRequestMessage("");
      setRequests([data.request, ...requests]);
    } catch {
      toast.error(t.requestError);
    } finally {
      setSending(false);
    }
  };

  const hasCheckinCompleted = reservation?.reservation_guests?.length > 0;
  const property = reservation?.properties;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{error || t.error}</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkInDate = parseISO(reservation.check_in);
  const checkOutDate = parseISO(reservation.check_out);
  const numNights = differenceInDays(checkOutDate, checkInDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              {reservation.guest_name}
            </p>
          </div>
          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger className="w-auto gap-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground h-9">
              <Globe className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">PT</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="es">ES</SelectItem>
              <SelectItem value="fr">FR</SelectItem>
              <SelectItem value="de">DE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Reservation Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {t.reservation}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property && (
              <div className="flex items-start gap-3 pb-3 border-b border-border">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{property.name}</p>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.checkIn}</p>
                <p className="font-semibold text-foreground">
                  {format(checkInDate, "d MMM yyyy", { locale: dateLocales[lang] })}
                </p>
                {property?.check_in_time && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {property.check_in_time}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.checkOut}</p>
                <p className="font-semibold text-foreground">
                  {format(checkOutDate, "d MMM yyyy", { locale: dateLocales[lang] })}
                </p>
                {property?.check_out_time && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {property.check_out_time}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Badge variant="secondary" className="gap-1">
                <Moon className="h-3 w-3" /> {numNights} {t.nights}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" /> {reservation.num_guests} {t.guests}
              </Badge>
            </div>

            {property?.wifi_password && (
              <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                <Wifi className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.wifiPassword}</p>
                  <p className="font-mono font-medium text-foreground">{property.wifi_password}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Online Check-in */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasCheckinCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-primary" />
                )}
                <div>
                  <p className="font-medium text-foreground">{t.onlineCheckin}</p>
                  <p className="text-sm text-muted-foreground">
                    {hasCheckinCompleted ? t.checkinCompleted : t.completeCheckin}
                  </p>
                </div>
              </div>
              {!hasCheckinCompleted && (
                <Button asChild size="sm">
                  <Link to={`/checkin/${token}`}>
                    {t.completeCheckin} <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guidebook Link */}
        {guidebook && (
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{t.guidebook}</p>
                    <p className="text-sm text-muted-foreground">{guidebook.title}</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/guidebook/${guidebook.id}`}>
                    {t.viewGuidebook} <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t.specialRequests}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder={t.requestType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early_checkin">{t.earlyCheckin}</SelectItem>
                <SelectItem value="late_checkout">{t.lateCheckout}</SelectItem>
                <SelectItem value="extra_bed">{t.extraBed}</SelectItem>
                <SelectItem value="transfer">{t.transfer}</SelectItem>
                <SelectItem value="other">{t.other}</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder={t.yourMessage}
              rows={3}
            />

            <Button
              onClick={sendRequest}
              disabled={!requestMessage.trim() || sending}
              className="w-full"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t.sendRequest}
            </Button>

            {/* Previous requests */}
            {requests.length > 0 && (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t.previousRequests}</p>
                {requests.map((req) => (
                  <div key={req.id} className="bg-muted rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          req.status === "approved"
                            ? "default"
                            : req.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {t[req.status as keyof typeof t] || req.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(req.created_at), "d MMM", { locale: dateLocales[lang] })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{req.message}</p>
                    {req.manager_response && (
                      <p className="text-sm text-primary italic mt-1">↪ {req.manager_response}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
