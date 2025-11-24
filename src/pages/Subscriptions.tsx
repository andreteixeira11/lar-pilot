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
    name: "Grátis",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Ideal para experimentar a plataforma",
    features: [
      { name: "1 propriedade", description: "Gerir uma única propriedade", included: true },
      { name: "Gestão de reservas", description: "Controlo básico de reservas", included: true },
      { name: "Relatórios mensais", description: "Resumos financeiros simples", included: true },
      { name: "Suporte por email", description: "Resposta em até 48h", included: true },
      { name: "Exportação de dados", description: "Download de relatórios em PDF", included: false },
      { name: "Integração calendários", description: "Sincronização automática", included: false },
    ],
    icon: <Home className="w-6 h-6" />,
    highlight: false,
  },
  {
    name: "Básico",
    price: {
      monthly: 29,
      yearly: 290,
    },
    description: "Ideal para quem está a começar",
    features: [
      { name: "Até 3 propriedades", description: "Gerir múltiplas propriedades", included: true },
      { name: "Gestão de reservas", description: "Controlo completo de reservas", included: true },
      { name: "Relatórios mensais", description: "Resumos financeiros detalhados", included: true },
      { name: "Suporte por email", description: "Resposta em até 24h", included: true },
      { name: "Exportação de dados", description: "Download de relatórios em PDF", included: true },
      { name: "Integração calendários", description: "Sincronização automática", included: false },
    ],
    icon: <Building2 className="w-6 h-6" />,
    highlight: false,
  },
  {
    name: "Premium",
    price: {
      monthly: 59,
      yearly: 590,
    },
    description: "Para gestores profissionais",
    features: [
      { name: "Propriedades ilimitadas", description: "Sem limite de propriedades", included: true },
      { name: "Gestão avançada", description: "Todas as funcionalidades", included: true },
      { name: "Relatórios personalizados", description: "Análises detalhadas", included: true },
      { name: "Exportação de dados", description: "Download em múltiplos formatos", included: true },
      { name: "Suporte prioritário", description: "Resposta em até 2h", included: true },
      { name: "Integração calendários", description: "Sincronização automática", included: true },
    ],
    icon: <Crown className="w-6 h-6" />,
    highlight: true,
    badge: "Mais Popular",
  },
];

export default function Subscriptions() {
  const { user, updateSubscription } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleSelectPlan = (tier: PricingTier, isYearly: boolean) => {
    if (tier.name === "Grátis") {
      toast({
        title: "Plano Grátis",
        description: "Você já está no plano gratuito!",
      });
      return;
    }

    setSelectedPlan({
      name: tier.name,
      price: isYearly ? tier.price.yearly : tier.price.monthly,
    });
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;
    
    const planId = selectedPlan.name.toLowerCase() as "basic" | "premium";
    updateSubscription(planId);
    
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

      {user?.subscriptionPlan && user.subscriptionPlan !== "free" && (
        <Card className="border-primary max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Subscrição {user.subscriptionPlan === "basic" ? "Básico" : "Premium"} -
              </span>
              <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                {user.subscriptionStatus === "active" ? "Ativo" : "Inativo"}
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
          <p>• Aceitamos Multibanco e MB Way</p>
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
          userEmail={user.email}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
