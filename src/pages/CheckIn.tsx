import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckInForm } from "@/components/CheckInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function CheckIn() {
  const { token } = useParams<{ token: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!token) {
        setError("Link de check-in inválido");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-checkin?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          setError(data.error || "Reserva não encontrada. Verifique se o link está correto.");
          setLoading(false);
          return;
        }

        setReservation(data.reservation);
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("Erro ao carregar os dados da reserva");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error || "Erro ao carregar reserva"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Check-in Online</h1>
          <p className="text-muted-foreground">
            Preencha os dados de todos os hóspedes para completar o seu check-in
          </p>
        </div>

        {/* Reservation Details Card */}
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Detalhes da Reserva
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Propriedade</p>
              <p className="font-medium">{reservation.properties.name}</p>
              <p className="text-sm text-muted-foreground">{reservation.properties.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-in
                </p>
                <p className="font-medium">
                  {format(new Date(reservation.check_in), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                </p>
                <p className="text-sm text-muted-foreground">
                  às {reservation.properties.check_in_time}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-out
                </p>
                <p className="font-medium">
                  {format(new Date(reservation.check_out), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                </p>
                <p className="text-sm text-muted-foreground">
                  até {reservation.properties.check_out_time}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Número de Hóspedes
              </p>
              <p className="font-medium">{reservation.num_guests} hóspede{reservation.num_guests !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Check-in Form */}
        <CheckInForm reservation={reservation} />
      </div>
    </div>
  );
}
