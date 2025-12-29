import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentBlockOverlayProps {
  onPaymentSuccess?: () => void;
}

export function PaymentBlockOverlay({ onPaymentSuccess }: PaymentBlockOverlayProps) {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const planPrices: Record<string, number> = {
    starter: 19.99,
    professional: 39.99,
    premium: 79.99,
  };

  const planPrice = planPrices[profile?.subscription_plan || "starter"] || 19.99;

  const handleRegularizePayment = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // Create a pending payment record
      const { error } = await supabase.from("payments").insert({
        user_id: user.id,
        amount: planPrice,
        subscription_plan: profile?.subscription_plan || "starter",
        payment_method: "pending",
        payment_status: "pending",
      });

      if (error) throw error;

      // Update subscription status to active (simulating successful payment)
      await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", user.id);

      toast({
        title: "Pagamento regularizado",
        description: "O seu acesso foi restaurado.",
      });

      onPaymentSuccess?.();
      window.location.reload();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-destructive/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
          <CardDescription className="text-base">
            O seu acesso está temporariamente suspenso devido a um pagamento em atraso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plano</span>
              <Badge variant="outline" className="capitalize">
                {profile?.subscription_plan || "Starter"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor em dívida</span>
              <span className="font-bold text-lg">€{planPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-12"
              onClick={handleRegularizePayment}
              disabled={isProcessing}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? "A processar..." : "Regularizar Pagamento"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Após o pagamento, o seu acesso será imediatamente restaurado.
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@monumenta.pt" className="text-primary hover:underline">
                Contacte o suporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
