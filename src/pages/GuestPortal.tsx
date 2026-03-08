import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  Timer,
  Navigation,
  Copy,
  Check,
} from "lucide-react";
import { format, parseISO, differenceInDays, differenceInHours, isBefore, isAfter } from "date-fns";
import { pt, enUS, es, fr, de } from "date-fns/locale";

type Language = "pt" | "en" | "es" | "fr" | "de";

const translations: Record<Language, Record<string, string>> = {
  pt: {
    title: "Portal do Hóspede",
    welcome: "Bem-vindo",
    reservation: "A sua Reserva",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "noites",
    guests: "hóspedes",
    wifiPassword: "Password Wi-Fi",
    checkInTime: "Entrada",
    checkOutTime: "Saída",
    guidebook: "Guia do Alojamento",
    viewGuidebook: "Ver Guia Completo",
    specialRequests: "Pedidos Especiais",
    requestType: "Tipo de pedido",
    earlyCheckin: "Check-in antecipado",
    lateCheckout: "Check-out tardio",
    extraBed: "Cama extra",
    transfer: "Transfer",
    other: "Outro",
    yourMessage: "Descreva o seu pedido...",
    sendRequest: "Enviar Pedido",
    previousRequests: "Histórico de Pedidos",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    loading: "A carregar...",
    error: "Erro ao carregar os dados",
    invalidLink: "Link inválido",
    onlineCheckin: "Check-in Online",
    completeCheckin: "Preencher Check-in",
    checkinCompleted: "Check-in Completo",
    requestSent: "Pedido enviado com sucesso!",
    requestError: "Erro ao enviar pedido",
    daysUntilCheckin: "dias para o check-in",
    hoursUntilCheckin: "horas para o check-in",
    stayInProgress: "A sua estadia está a decorrer!",
    stayCompleted: "Obrigado pela sua estadia!",
    todayIsCheckin: "Hoje é o dia do check-in!",
    viewOnMap: "Ver no Mapa",
    copied: "Copiado!",
    directions: "Direções",
  },
  en: {
    title: "Guest Portal",
    welcome: "Welcome",
    reservation: "Your Reservation",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "nights",
    guests: "guests",
    wifiPassword: "Wi-Fi Password",
    checkInTime: "Check-in",
    checkOutTime: "Check-out",
    guidebook: "Property Guidebook",
    viewGuidebook: "View Full Guide",
    specialRequests: "Special Requests",
    requestType: "Request type",
    earlyCheckin: "Early check-in",
    lateCheckout: "Late check-out",
    extraBed: "Extra bed",
    transfer: "Transfer",
    other: "Other",
    yourMessage: "Describe your request...",
    sendRequest: "Send Request",
    previousRequests: "Request History",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    loading: "Loading...",
    error: "Error loading data",
    invalidLink: "Invalid link",
    onlineCheckin: "Online Check-in",
    completeCheckin: "Complete Check-in",
    checkinCompleted: "Check-in Completed",
    requestSent: "Request sent successfully!",
    requestError: "Error sending request",
    daysUntilCheckin: "days until check-in",
    hoursUntilCheckin: "hours until check-in",
    stayInProgress: "Your stay is in progress!",
    stayCompleted: "Thank you for your stay!",
    todayIsCheckin: "Today is check-in day!",
    viewOnMap: "View on Map",
    copied: "Copied!",
    directions: "Directions",
  },
  es: {
    title: "Portal del Huésped", welcome: "Bienvenido", reservation: "Su Reserva",
    checkIn: "Check-in", checkOut: "Check-out", nights: "noches", guests: "huéspedes",
    wifiPassword: "Contraseña Wi-Fi", checkInTime: "Entrada", checkOutTime: "Salida",
    guidebook: "Guía del Alojamiento", viewGuidebook: "Ver Guía",
    specialRequests: "Solicitudes Especiales", requestType: "Tipo",
    earlyCheckin: "Check-in anticipado", lateCheckout: "Check-out tardío",
    extraBed: "Cama extra", transfer: "Transfer", other: "Otro",
    yourMessage: "Describa su solicitud...", sendRequest: "Enviar",
    previousRequests: "Historial", pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado",
    loading: "Cargando...", error: "Error", invalidLink: "Enlace inválido",
    onlineCheckin: "Check-in Online", completeCheckin: "Completar Check-in",
    checkinCompleted: "Check-in Completado", requestSent: "¡Solicitud enviada!",
    requestError: "Error al enviar", daysUntilCheckin: "días para el check-in",
    hoursUntilCheckin: "horas para el check-in", stayInProgress: "¡Su estancia está en curso!",
    stayCompleted: "¡Gracias por su estancia!", todayIsCheckin: "¡Hoy es el día del check-in!",
    viewOnMap: "Ver en Mapa", copied: "¡Copiado!", directions: "Direcciones",
  },
  fr: {
    title: "Portail Invité", welcome: "Bienvenue", reservation: "Votre Réservation",
    checkIn: "Arrivée", checkOut: "Départ", nights: "nuits", guests: "invités",
    wifiPassword: "Mot de passe Wi-Fi", checkInTime: "Arrivée", checkOutTime: "Départ",
    guidebook: "Guide", viewGuidebook: "Voir le Guide",
    specialRequests: "Demandes Spéciales", requestType: "Type",
    earlyCheckin: "Arrivée anticipée", lateCheckout: "Départ tardif",
    extraBed: "Lit supplémentaire", transfer: "Transfer", other: "Autre",
    yourMessage: "Décrivez votre demande...", sendRequest: "Envoyer",
    previousRequests: "Historique", pending: "En attente", approved: "Approuvé", rejected: "Refusé",
    loading: "Chargement...", error: "Erreur", invalidLink: "Lien invalide",
    onlineCheckin: "Check-in en Ligne", completeCheckin: "Compléter",
    checkinCompleted: "Terminé", requestSent: "Demande envoyée !",
    requestError: "Erreur", daysUntilCheckin: "jours avant l'arrivée",
    hoursUntilCheckin: "heures avant l'arrivée", stayInProgress: "Votre séjour est en cours !",
    stayCompleted: "Merci pour votre séjour !", todayIsCheckin: "C'est le jour de l'arrivée !",
    viewOnMap: "Voir sur la carte", copied: "Copié !", directions: "Itinéraire",
  },
  de: {
    title: "Gästeportal", welcome: "Willkommen", reservation: "Ihre Reservierung",
    checkIn: "Check-in", checkOut: "Check-out", nights: "Nächte", guests: "Gäste",
    wifiPassword: "WLAN-Passwort", checkInTime: "Check-in", checkOutTime: "Check-out",
    guidebook: "Unterkunftsführer", viewGuidebook: "Führer ansehen",
    specialRequests: "Sonderwünsche", requestType: "Art",
    earlyCheckin: "Früher Check-in", lateCheckout: "Später Check-out",
    extraBed: "Zusatzbett", transfer: "Transfer", other: "Sonstiges",
    yourMessage: "Beschreiben Sie Ihre Anfrage...", sendRequest: "Senden",
    previousRequests: "Verlauf", pending: "Ausstehend", approved: "Genehmigt", rejected: "Abgelehnt",
    loading: "Laden...", error: "Fehler", invalidLink: "Ungültiger Link",
    onlineCheckin: "Online Check-in", completeCheckin: "Ausfüllen",
    checkinCompleted: "Abgeschlossen", requestSent: "Anfrage gesendet!",
    requestError: "Fehler", daysUntilCheckin: "Tage bis zum Check-in",
    hoursUntilCheckin: "Stunden bis zum Check-in", stayInProgress: "Ihr Aufenthalt läuft!",
    stayCompleted: "Danke für Ihren Aufenthalt!", todayIsCheckin: "Heute ist Check-in Tag!",
    viewOnMap: "Auf Karte anzeigen", copied: "Kopiert!", directions: "Wegbeschreibung",
  },
};

const dateLocales: Record<Language, any> = { pt, en: enUS, es, fr, de };

function CountdownBanner({ checkIn, checkOut, t }: { checkIn: Date; checkOut: Date; t: Record<string, string> }) {
  const now = new Date();

  if (isAfter(now, checkOut)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted rounded-2xl p-4 text-center"
      >
        <p className="text-muted-foreground font-medium">✨ {t.stayCompleted}</p>
      </motion.div>
    );
  }

  if (isAfter(now, checkIn) && isBefore(now, checkOut)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/10 rounded-2xl p-4 text-center"
      >
        <p className="text-primary font-semibold text-lg">🏡 {t.stayInProgress}</p>
      </motion.div>
    );
  }

  const daysLeft = differenceInDays(checkIn, now);
  const hoursLeft = differenceInHours(checkIn, now);

  if (daysLeft === 0 && hoursLeft > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary rounded-2xl p-6 text-center text-primary-foreground"
      >
        <p className="text-sm uppercase tracking-wider opacity-80">{t.todayIsCheckin}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Timer className="h-6 w-6" />
          <span className="text-3xl font-bold">{hoursLeft}</span>
          <span className="text-lg">{t.hoursUntilCheckin}</span>
        </div>
      </motion.div>
    );
  }

  if (daysLeft > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-center text-primary-foreground"
      >
        <div className="flex items-center justify-center gap-3">
          <Timer className="h-7 w-7" />
          <span className="text-4xl font-bold">{daysLeft}</span>
          <span className="text-lg">{t.daysUntilCheckin}</span>
        </div>
      </motion.div>
    );
  }

  return null;
}

function MapEmbed({ address }: { address: string }) {
  const encodedAddress = encodeURIComponent(address);
  return (
    <div className="rounded-xl overflow-hidden border border-border h-[200px]">
      <iframe
        title="Property Location"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`}
        allowFullScreen
      />
    </div>
  );
}

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
  const [wifiCopied, setWifiCopied] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2) as Language;
    if (translations[browserLang]) setLang(browserLang);
  }, []);

  useEffect(() => {
    if (!token) { setError(t.invalidLink); setLoading(false); return; }
    fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-portal?token=${encodeURIComponent(token!)}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      if (!response.ok || data.error) { setError(data.error || t.error); return; }
      setReservation(data.reservation);
      setGuidebook(data.guidebook);
      setRequests(data.requests || []);
    } catch { setError(t.error); }
    finally { setLoading(false); }
  };

  const sendRequest = async () => {
    if (!requestMessage.trim()) return;
    setSending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-portal`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action: "create_request", request_type: requestType, message: requestMessage }) }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success(t.requestSent);
      setRequestMessage("");
      setRequests([data.request, ...requests]);
    } catch { toast.error(t.requestError); }
    finally { setSending(false); }
  };

  const copyWifi = (password: string) => {
    navigator.clipboard.writeText(password);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  const hasCheckinCompleted = reservation?.reservation_guests?.length > 0 &&
    reservation.reservation_guests.some((g: any) => g.nome_completo?.trim());
  const property = reservation?.properties;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full text-center border-0 shadow-xl">
            <CardContent className="pt-10 pb-10">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-xl font-semibold text-foreground">{error || t.error}</h2>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const checkInDate = parseISO(reservation.check_in);
  const checkOutDate = parseISO(reservation.check_out);
  const numNights = differenceInDays(checkOutDate, checkInDate);
  const mapUrl = property?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`
    : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-10 relative">
          <div className="flex items-center justify-between mb-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-primary-foreground/70 text-sm">{t.welcome}</p>
              <h1 className="text-2xl sm:text-3xl font-bold">{reservation.guest_name}</h1>
            </motion.div>
            <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
              <SelectTrigger className="w-auto gap-1 bg-primary-foreground/15 border-primary-foreground/20 text-primary-foreground h-8 text-xs rounded-full px-3">
                <Globe className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">🇵🇹 PT</SelectItem>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
                <SelectItem value="es">🇪🇸 ES</SelectItem>
                <SelectItem value="fr">🇫🇷 FR</SelectItem>
                <SelectItem value="de">🇩🇪 DE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {property && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3"
            >
              <MapPin className="h-5 w-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{property.name}</p>
                <p className="text-sm text-primary-foreground/70 truncate">{property.address}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 sm:px-6 -mt-4 space-y-4">
        {/* Countdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CountdownBanner checkIn={checkInDate} checkOut={checkOutDate} t={t} />
        </motion.div>

        {/* Dates Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t.checkInTime}</p>
                  <p className="text-lg font-bold text-foreground">
                    {format(checkInDate, "d MMM", { locale: dateLocales[lang] })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(checkInDate, "yyyy", { locale: dateLocales[lang] })}
                  </p>
                  {property?.check_in_time && (
                    <Badge variant="secondary" className="mt-2 text-xs gap-1">
                      <Clock className="h-3 w-3" /> {property.check_in_time}
                    </Badge>
                  )}
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t.checkOutTime}</p>
                  <p className="text-lg font-bold text-foreground">
                    {format(checkOutDate, "d MMM", { locale: dateLocales[lang] })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(checkOutDate, "yyyy", { locale: dateLocales[lang] })}
                  </p>
                  {property?.check_out_time && (
                    <Badge variant="secondary" className="mt-2 text-xs gap-1">
                      <Clock className="h-3 w-3" /> {property.check_out_time}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4 justify-center">
                <Badge variant="outline" className="gap-1.5 py-1 px-3">
                  <Moon className="h-3.5 w-3.5" /> {numNights} {t.nights}
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1 px-3">
                  <Users className="h-3.5 w-3.5" /> {reservation.num_guests} {t.guests}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Check-in Button */}
          <Card className={`border-0 shadow-md cursor-pointer transition-all hover:shadow-lg ${hasCheckinCompleted ? 'bg-green-50 dark:bg-green-950/30' : ''}`}>
            <Link to={hasCheckinCompleted ? '#' : `/checkin/${token}`} className="block">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                {hasCheckinCompleted ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <CalendarDays className="h-8 w-8 text-primary" />
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.onlineCheckin}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {hasCheckinCompleted ? t.checkinCompleted : t.completeCheckin}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Guidebook Button */}
          {guidebook ? (
            <Card className="border-0 shadow-md cursor-pointer transition-all hover:shadow-lg">
              <Link to={`/guidebook/${guidebook.id}`} className="block">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.guidebook}</p>
                    <p className="text-[11px] text-muted-foreground">{t.viewGuidebook}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ) : (
            <Card className="border-0 shadow-md opacity-50">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">{t.guidebook}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Wi-Fi Card */}
        {property?.wifi_password && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Wifi className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.wifiPassword}</p>
                  <p className="font-mono font-bold text-lg text-foreground truncate">{property.wifi_password}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyWifi(property.wifi_password)}
                  className="shrink-0"
                >
                  {wifiCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Map */}
        {property?.address && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <MapEmbed address={property.address} />
                {mapUrl && (
                  <div className="p-3 flex justify-center">
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-4 w-4" /> {t.directions}
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Special Requests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t.specialRequests}</h3>
              </div>

              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger className="rounded-xl">
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
                className="rounded-xl resize-none"
              />

              <Button onClick={sendRequest} disabled={!requestMessage.trim() || sending} className="w-full">
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {t.sendRequest}
              </Button>

              {requests.length > 0 && (
                <div className="pt-3 border-t border-border space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.previousRequests}</p>
                  {requests.map((req) => (
                    <div key={req.id} className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {t[req.status as keyof typeof t] || req.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(parseISO(req.created_at), "d MMM", { locale: dateLocales[lang] })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{req.message}</p>
                      {req.manager_response && (
                        <p className="text-sm text-primary italic">↪ {req.manager_response}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
