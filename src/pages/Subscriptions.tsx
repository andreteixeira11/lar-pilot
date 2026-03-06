import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Home, Building2, Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaymentDialog } from "@/components/PaymentDialog";
import { EmailService } from "@/lib/emailService";
import { PricingSection, PricingTier } from "@/components/blocks/pricing-section";

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: {
      monthly: 7,
      yearly: 70,
    },
    description: "Ideal para começar",
    features: [
      { name: "1 propriedade", description: "Gerir uma única propriedade", included: true },
      { name: "Gestão básica de reservas", description: "Controlo de reservas", included: true },
      { name: "Resumo mensal básico", description: "Resumos financeiros simples", included: true },
      { name: "Suporte por email", description: "Resposta em até 48h", included: true },
    ],
    icon: <Home className="w-6 h-6" />,
    highlight: false,
  },
  {
    name: "Pro",
    price: {
      monthly: 19,
      yearly: 190,
    },
    description: "Para quem está a crescer",
    features: [
      { name: "Até 5 propriedades", description: "Gerir múltiplas propriedades", included: true },
      { name: "Formulários de check-in", description: "Envio automático aos hóspedes", included: true },
      { name: "Taxa turística automática", description: "Cálculo automático", included: true },
      { name: "Calendário Fiscal", description: "Notificações automáticas", included: true },
      { name: "Suporte prioritário", description: "Resposta em até 24h", included: true },
    ],
    icon: <Building2 className="w-6 h-6" />,
    highlight: true,
    badge: "Mais Popular",
  },
  {
    name: "Premium",
    price: {
      monthly: 49,
      yearly: 490,
    },
    description: "Para gestores profissionais",
    features: [
      { name: "Propriedades ilimitadas", description: "Sem limite de propriedades", included: true },
      { name: "Check-in automatizado completo", description: "Sistema completo", included: true },
      { name: "Taxa turística + SIBA (INE)", description: "Envio automático", included: true },
      { name: "Calendário Fiscal completo", description: "Alertas personalizados", included: true },
      { name: "Relatórios personalizados", description: "Análises detalhadas", included: true },
      { name: "Gestor de conta dedicado", description: "Suporte VIP", included: true },
      { name: "API de acesso", description: "Integração avançada", included: true },
    ],
    icon: <Crown className="w-6 h-6" />,
    highlight: false,
  },
];

export default function Subscriptions() {
  const { user, profile, updateSubscription } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleSelectPlan = (tier: PricingTier, isYearly: boolean) => {
    setSelectedPlan({
      name: tier.name,
      price: isYearly ? tier.price.yearly : tier.price.monthly,
    });
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;
    
    const planId = selectedPlan.name.toLowerCase();
    await updateSubscription(planId);
    
    // Send welcome/confirmation email
    if (user?.email) {
      await EmailService.sendPaymentConfirmation(user.email, {
        plan: selectedPlan.name,
        amount: selectedPlan.price,
      });
    }
    
    toast({
      title: "Subscrição ativada!",
      description: `Plano ${selectedPlan.name} ativado com sucesso.`,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Subscrições"
        description="Escolha o plano ideal para o seu negócio"
      />

      {profile?.subscription_plan && (
        <Card className="border-primary max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Subscrição {profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)} -
              </span>
              <Badge variant={profile.subscription_status === "active" ? "default" : "secondary"}>
                {profile.subscription_status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <PricingSection 
        tiers={pricingTiers} 
        onSelectPlan={handleSelectPlan}
      />

      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Notas importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Todos os preços são apresentados sem IVA</p>
          <p>• Pode cancelar a sua subscrição a qualquer momento</p>
          <p>• Pagamentos processados de forma segura via Ifthenpay</p>
          <p>• Suporte disponível para todos os planos</p>
          <p>• Aceitamos Multibanco, MB Way, Cartão de Crédito, Apple Pay e Google Pay</p>
          <p>• Planos anuais incluem 2 meses grátis (economia de 17%)</p>
        </CardContent>
      </Card>

      {selectedPlan && user && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={{ 
            id: selectedPlan.name.toLowerCase(), 
            name: selectedPlan.name, 
            price: selectedPlan.price.toString() 
          }}
          userEmail={user.email || ""}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
