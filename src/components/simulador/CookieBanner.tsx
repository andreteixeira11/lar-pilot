import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies para melhorar a sua experiência no nosso site.
              Ao continuar a navegar, concorda com a nossa política de cookies.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              Recusar
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
