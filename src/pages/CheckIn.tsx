import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckInForm } from "@/components/CheckInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Language } from "@/lib/checkin-translations";

export default function CheckIn() {
  const { token } = useParams<{ token: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const fetchReservation = async () => {
      if (!token) {
        setError(language === "en" ? "Invalid check-in link" : "Link de check-in inválido");
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
          setError(data.error || (language === "en" 
            ? "Reservation not found. Please check if the link is correct." 
            : "Reserva não encontrada. Verifique se o link está correto."));
          setLoading(false);
          return;
        }

        setReservation(data.reservation);
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError(language === "en" 
          ? "Error loading reservation data" 
          : "Erro ao carregar os dados da reserva");
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
          <p className="text-muted-foreground">
            {language === "en" ? "Loading..." : "A carregar..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error || (language === "en" ? "Error loading reservation" : "Erro ao carregar reserva")}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <CheckInForm 
          reservation={reservation} 
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </div>
  );
}
