import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  Check, 
  Clock,
  ExternalLink,
  CalendarDays,
  Download,
  Copy
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ICalSyncCardProps {
  pageId: string;
  slug?: string;
}

export function ICalSyncCard({ pageId, slug }: ICalSyncCardProps) {
  const queryClient = useQueryClient();
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  // Fetch current page data with iCal URLs
  const { data: pageData } = useQuery({
    queryKey: ["direct-booking-page-ical", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("direct_booking_pages")
        .select("ical_airbnb_url, ical_booking_url, ical_last_sync, slug")
        .eq("id", pageId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!pageId,
  });

  // Fetch external events count
  const { data: externalEvents } = useQuery({
    queryKey: ["external-calendar-events", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_calendar_events")
        .select("*")
        .eq("page_id", pageId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!pageId,
  });

  // Update URLs when data loads
  useEffect(() => {
    if (pageData) {
      setAirbnbUrl(pageData.ical_airbnb_url || "");
      setBookingUrl(pageData.ical_booking_url || "");
    }
  }, [pageData]);

  // Save URLs mutation
  const saveUrlsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("direct_booking_pages")
        .update({
          ical_airbnb_url: airbnbUrl || null,
          ical_booking_url: bookingUrl || null,
        })
        .eq("id", pageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-booking-page-ical"] });
      toast.success("URLs guardadas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao guardar URLs");
    },
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // First save the URLs
      if (airbnbUrl || bookingUrl) {
        await supabase
          .from("direct_booking_pages")
          .update({
            ical_airbnb_url: airbnbUrl || null,
            ical_booking_url: bookingUrl || null,
          })
          .eq("id", pageId);
      }

      // Then sync
      const response = await supabase.functions.invoke("sync-ical", {
        body: {
          pageId,
          airbnbUrl: airbnbUrl || null,
          bookingUrl: bookingUrl || null,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["external-calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["direct-booking-page-ical"] });
      
      const airbnbCount = data?.results?.airbnb?.count || 0;
      const bookingCount = data?.results?.booking?.count || 0;
      
      toast.success(`Sincronização concluída! ${airbnbCount + bookingCount} eventos importados.`);
    },
    onError: (error) => {
      console.error("Sync error:", error);
      toast.error("Erro ao sincronizar calendários");
    },
  });

  const currentSlug = slug || pageData?.slug;
  const exportUrl = currentSlug 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-ical?slug=${currentSlug}`
    : null;

  const handleCopyExportUrl = () => {
    if (exportUrl) {
      navigator.clipboard.writeText(exportUrl);
      toast.success("URL copiado para a área de transferência!");
    }
  };

  const handleDownloadIcal = () => {
    if (exportUrl) {
      window.open(exportUrl, "_blank");
    }
  };

  const airbnbEventsCount = externalEvents?.filter(e => e.source === "airbnb").length || 0;
  const bookingEventsCount = externalEvents?.filter(e => e.source === "booking").length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Sincronização iCal
        </CardTitle>
        <CardDescription>
          Sincronize com Booking.com e Airbnb para bloquear datas automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        {currentSlug && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Download className="h-3 w-3" />
              Exportar Calendário (para Airbnb/Booking)
            </Label>
            <div className="flex gap-2">
              <Input
                value={exportUrl || ""}
                readOnly
                className="font-mono text-xs flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyExportUrl}
                title="Copiar URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadIcal}
                title="Download .ics"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use esta URL para importar o seu calendário no Airbnb ou Booking.com
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="airbnb-ical" className="flex items-center gap-2">
              <img 
                src="/logos/airbnb.svg" 
                alt="Airbnb" 
                className="h-4 w-4 object-contain"
              />
              URL iCal Airbnb
            </Label>
            <Input
              id="airbnb-ical"
              value={airbnbUrl}
              onChange={(e) => setAirbnbUrl(e.target.value)}
              placeholder="https://www.airbnb.com/calendar/ical/..."
              className="font-mono text-xs"
            />
            {airbnbEventsCount > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                {airbnbEventsCount} evento(s) importado(s)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-ical" className="flex items-center gap-2">
              <img 
                src="/logos/booking.svg" 
                alt="Booking.com" 
                className="h-4 w-4 object-contain"
              />
              URL iCal Booking.com
            </Label>
            <Input
              id="booking-ical"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              placeholder="https://admin.booking.com/..."
              className="font-mono text-xs"
            />
            {bookingEventsCount > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                {bookingEventsCount} evento(s) importado(s)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <a 
            href="https://www.airbnb.com/help/article/99" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            Como obter URL Airbnb <ExternalLink className="h-3 w-3" />
          </a>
          <span>•</span>
          <a 
            href="https://partner.booking.com/en-gb/help/rates-availability/how-do-i-set-ical-link"
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            Como obter URL Booking <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {pageData?.ical_last_sync && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Última sincronização: {format(new Date(pageData.ical_last_sync), "dd MMM yyyy, HH:mm", { locale: pt })}
          </div>
        )}

        <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
          ⚡ Sincronização automática ativa a cada 6 horas
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || (!airbnbUrl && !bookingUrl)}
            className="flex-1 rounded-full"
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar Agora
          </Button>
        </div>

        {externalEvents && externalEvents.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">Datas bloqueadas:</p>
            <div className="flex flex-wrap gap-1">
              {externalEvents.slice(0, 5).map((event) => (
                <Badge key={event.id} variant="secondary" className="text-xs">
                  {format(new Date(event.start_date), "dd/MM")} - {format(new Date(event.end_date), "dd/MM")}
                  <span className="ml-1 opacity-60">
                    ({event.source === "airbnb" ? "Airbnb" : "Booking"})
                  </span>
                </Badge>
              ))}
              {externalEvents.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{externalEvents.length - 5} mais
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
