import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Home, Sparkles, Crown, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SubscriptionPlan = "free" | "basic" | "premium";

const plans = [
  {
    id: "free" as SubscriptionPlan,
    name: "Gratuito",
    price: "0",
    description: "Para começar",
    features: [
      "1 propriedade",
      "Funcionalidades básicas",
      "Suporte por email",
    ],
    icon: Home,
  },
  {
    id: "basic" as SubscriptionPlan,
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
    id: "premium" as SubscriptionPlan,
    name: "Premium",
    price: "59",
    description: "Para gestores profissionais",
    features: [
      "Propriedades ilimitadas",
      "Gestão de reservas avançada",
      "Relatórios personalizados",
      "Exportação de dados",
      "Suporte prioritário",
    ],
    icon: Crown,
    popular: true,
  },
];

export default function Auth() {
  const [step, setStep] = useState<"plan" | "login" | "signup">("plan");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelect = (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
    setStep("signup");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login efetuado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      navigate("/reservas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(email, password, name, selectedPlan || "free");
      toast({
        title: "Conta criada com sucesso!",
        description: "Pode agora aceder à plataforma.",
      });
      navigate("/reservas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Gestão de Alojamento</h1>
            <p className="text-muted-foreground text-lg">
              Escolha o plano ideal para começar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    plan.popular ? "border-primary shadow-md scale-105" : ""
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
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
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setStep("login")}
              className="text-muted-foreground hover:text-foreground"
            >
              Já tem conta? Entrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => setStep("plan")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Aceda à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A entrar..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>Ao continuar, concorda com os nossos termos e condições</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // step === "signup"
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 mb-2"
            onClick={() => setStep("plan")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
          <CardDescription className="text-center">
            Plano selecionado: <span className="font-semibold text-foreground">{selectedPlanData?.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telemóvel</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+351 900 000 000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                type="text"
                placeholder="000000000"
                required
                maxLength={9}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Palavra-passe</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "A criar conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>Ao continuar, concorda com os nossos termos e condições</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setStep("login")}
            className="text-primary"
          >
            Já tem conta? Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
