import { PageHeader } from "@/components/PageHeader";
import { useProperty } from "@/contexts/PropertyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Send, CheckCircle, Clock, Calendar, User, Mail } from "lucide-react";

export default function CheckIns() {
  const { selectedProperty } = useProperty();
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: reservations, refetch } = useQuery({
    queryKey: ["reservations-checkins", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];

      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          reservation_guests (
            id,
            nome_completo
          )
        `)
        .eq("property_id", selectedProperty.id)
        .gte("check_in", new Date().toISOString().split("T")[0])
        .order("check_in", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProperty?.id,
  });

  const handleSendCheckin = async (reservationId: string, guestEmail: string) => {
    setSendingId(reservationId);
    try {
      const { error } = await supabase.functions.invoke("send-checkin-link", {
        body: { reservationId },
      });

      if (error) throw error;

      toast({
        title: "Link enviado!",
        description: `O link de check-in foi enviado para ${guestEmail}`,
      });
      
      refetch();
    } catch (error: any) {
      console.error("Error sending check-in link:", error);
      toast({
        title: "Erro ao enviar link",
        description: error.message || "Não foi possível enviar o link de check-in",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const getCheckinStatus = (reservation: any) => {
    const hasGuests = reservation.reservation_guests?.length > 0;
    const expectedGuests = reservation.num_guests;
    const actualGuests = reservation.reservation_guests?.length || 0;

    if (hasGuests && actualGuests === expectedGuests) {
      return { status: "completo", color: "default", label: "Completo" };
    } else if (hasGuests && actualGuests < expectedGuests) {
      return { status: "parcial", color: "secondary", label: `Parcial (${actualGuests}/${expectedGuests})` };
    } else {
      return { status: "pendente", color: "destructive", label: "Pendente" };
    }
  };

  if (!selectedProperty) {
    return (
      <div className="p-8">
        <PageHeader
          title="Check-ins Online"
          description="Gerir os check-ins dos hóspedes"
        />
        <div className="mt-8 text-center text-muted-foreground">
          Selecione uma propriedade para ver os check-ins
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        title="Check-ins Online"
        description="Acompanhe e gerencie os check-ins dos seus hóspedes"
      />

      <div className="mt-8 space-y-4">
        {reservations?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Não há reservas futuras com check-in pendente</p>
            </CardContent>
          </Card>
        ) : (
          reservations?.map((reservation) => {
            const checkinStatus = getCheckinStatus(reservation);
            const isSending = sendingId === reservation.id;

            return (
              <Card key={reservation.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{reservation.guest_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span>{reservation.guest_email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(reservation.check_in), "dd MMM yyyy", { locale: pt })}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {reservation.num_guests} hóspede{reservation.num_guests !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant={checkinStatus.color as any}>
                          {checkinStatus.status === "completo" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {checkinStatus.label}
                        </Badge>
                      </div>

                      {reservation.reservation_guests?.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Hóspedes registados:</span>{" "}
                          {reservation.reservation_guests.map((g: any) => g.nome_completo).join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleSendCheckin(reservation.id, reservation.guest_email)}
                        disabled={isSending}
                        className="w-full sm:w-auto"
                        variant={checkinStatus.status === "completo" ? "outline" : "default"}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSending ? "A enviar..." : checkinStatus.status === "completo" ? "Reenviar" : "Enviar Link"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
