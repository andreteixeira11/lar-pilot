import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "29",
    description: "Ideal para quem está a começar",
    features: [
      "Até 3 propriedades",
      "Gestão de reservas",
      "Relatórios mensais",
      "Suporte por email",
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "59",
    description: "Para gestores profissionais",
    features: [
      "Propriedades ilimitadas",
      "Gestão de reservas avançada",
      "Relatórios personalizados",
      "Exportação de dados",
      "Suporte prioritário",
      "Integração com calendários",
    ],
    icon: Crown,
    popular: true,
  },
];

export default function Subscriptions() {
  const { user, updateSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: "basic" | "premium") => {
    setIsLoading(planId);
    
    // TODO: Integrate with MySQL and payment gateway
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    updateSubscription(planId);
    
    toast({
      title: "Subscrição ativada!",
      description: `Plano ${planId === "basic" ? "Básico" : "Premium"} ativado com sucesso.`,
    });
    
    setIsLoading(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Subscrições"
        description="Escolha o plano ideal para o seu negócio"
      />

      {user?.subscriptionPlan && user.subscriptionPlan !== "free" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <CardDescription>
              Subscrição {user.subscriptionPlan === "basic" ? "Básico" : "Premium"} - 
              Status: <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                {user.subscriptionStatus === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = user?.subscriptionPlan === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg" : ""
              } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || isLoading === plan.id}
                  onClick={() => handleSubscribe(plan.id as "basic" | "premium")}
                >
                  {isCurrentPlan
                    ? "Plano Atual"
                    : isLoading === plan.id
                    ? "A processar..."
                    : "Escolher Plano"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Notas importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Todos os preços são apresentados sem IVA</p>
          <p>• Pode cancelar a sua subscrição a qualquer momento</p>
          <p>• Pagamentos processados de forma segura</p>
          <p>• Suporte disponível para todos os planos</p>
        </CardContent>
      </Card>
    </div>
  );
}
