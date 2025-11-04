import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Home, Sparkles, Crown, ArrowLeft, CreditCard, Smartphone, Building2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SubscriptionPlan = "free" | "basic" | "premium";
type PaymentMethod = "card" | "mbway" | "multibanco" | "paypal";

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
  const [step, setStep] = useState<"auth" | "plan" | "profile" | "payment" | "property">("auth");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [mbwayPhone, setMbwayPhone] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Property form fields
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [propertyCapacity, setPropertyCapacity] = useState(4);
  const [propertyBedrooms, setPropertyBedrooms] = useState(2);
  const [propertyBathrooms, setPropertyBathrooms] = useState(1);
  const [propertyCheckIn, setPropertyCheckIn] = useState("15:00");
  const [propertyCheckOut, setPropertyCheckOut] = useState("11:00");
  const [propertyWifi, setPropertyWifi] = useState("");
  const [propertyParking, setPropertyParking] = useState("");
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelect = (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
    setStep("profile");
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("property");
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan === "free") {
      handleFinalSignup();
    } else {
      setStep("payment");
    }
  };

  const handleFinalSignup = async () => {
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

  // Auth page (login/signup tabs)
  if (step === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumenta Atlantic" 
                className="h-20 w-auto"
              />
            </div>
            <CardDescription className="text-center">
              Aceda ou crie a sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registar</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Palavra-passe</Label>
                    <Input
                      id="login-password"
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
              </TabsContent>
              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="text-center space-y-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    Escolha o seu plano e crie a sua conta
                  </p>
                  <Button
                    onClick={() => setStep("plan")}
                    className="w-full"
                  >
                    Começar Registo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>Ao continuar, concorda com os nossos termos e condições</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Plan selection
  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("auth")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex justify-center mb-4">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumenta Atlantic" 
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold">Escolha o Seu Plano</h1>
            <p className="text-muted-foreground text-lg">
              Selecione o plano ideal para o seu negócio
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
        </div>
      </div>
    );
  }

  // Profile step
  if (step === "profile") {
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
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumenta Atlantic" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Complete o Seu Perfil</CardTitle>
            <CardDescription className="text-center">
              Plano: <span className="font-semibold text-foreground">{selectedPlanData?.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
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
                <Label htmlFor="signup-email">Email *</Label>
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
                <Label htmlFor="phone">Telemóvel *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+351 900 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF *</Label>
                <Input
                  id="nif"
                  type="text"
                  placeholder="000000000"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  required
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Palavra-passe *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">
                Continuar
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

  // Property step
  if (step === "property") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => setStep("profile")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex justify-center mb-4">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumenta Atlantic" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Adicione a Sua Propriedade</CardTitle>
            <CardDescription className="text-center">
              Configure os dados da sua primeira propriedade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Nome da Propriedade *</Label>
                  <Input
                    id="propertyName"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Ex: Casa da Praia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyCapacity">Capacidade</Label>
                  <Input
                    id="propertyCapacity"
                    type="number"
                    value={propertyCapacity}
                    onChange={(e) => setPropertyCapacity(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Morada *</Label>
                <Input
                  id="propertyAddress"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Rua, número, cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyDescription">Descrição</Label>
                <Textarea
                  id="propertyDescription"
                  value={propertyDescription}
                  onChange={(e) => setPropertyDescription(e.target.value)}
                  placeholder="Breve descrição da propriedade"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyBedrooms">Quartos</Label>
                  <Input
                    id="propertyBedrooms"
                    type="number"
                    value={propertyBedrooms}
                    onChange={(e) => setPropertyBedrooms(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyBathrooms">Casas de Banho</Label>
                  <Input
                    id="propertyBathrooms"
                    type="number"
                    value={propertyBathrooms}
                    onChange={(e) => setPropertyBathrooms(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyCheckIn">Check-in</Label>
                  <Input
                    id="propertyCheckIn"
                    type="time"
                    value={propertyCheckIn}
                    onChange={(e) => setPropertyCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyCheckOut">Check-out</Label>
                  <Input
                    id="propertyCheckOut"
                    type="time"
                    value={propertyCheckOut}
                    onChange={(e) => setPropertyCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyWifi">Password WiFi</Label>
                <Input
                  id="propertyWifi"
                  value={propertyWifi}
                  onChange={(e) => setPropertyWifi(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyParking">Informações de Estacionamento</Label>
                <Input
                  id="propertyParking"
                  value={propertyParking}
                  onChange={(e) => setPropertyParking(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <Button type="submit" className="w-full">
                {selectedPlan === "free" ? "Criar Conta" : "Continuar para Pagamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment step
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  
  const paymentMethods = [
    { id: "card" as PaymentMethod, name: "Cartão de Crédito", icon: CreditCard },
    { id: "mbway" as PaymentMethod, name: "MB WAY", icon: Smartphone },
    { id: "multibanco" as PaymentMethod, name: "Multibanco", icon: Building2 },
    { id: "paypal" as PaymentMethod, name: "PayPal", icon: DollarSign },
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 mb-2"
            onClick={() => setStep("profile")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
            <div className="flex justify-center mb-4">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumenta Atlantic" 
                className="h-16 w-auto"
              />
            </div>
          <CardTitle className="text-2xl font-bold text-center">Método de Pagamento</CardTitle>
          <CardDescription className="text-center">
            Plano {selectedPlanData?.name} - €{selectedPlanData?.price}/mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleFinalSignup(); }} className="space-y-6">
            <div className="space-y-3">
              <Label>Selecione o método de pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium text-center">{method.name}</span>
                      </Label>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão *</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Validade *</Label>
                    <Input
                      id="cardExpiry"
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV *</Label>
                    <Input
                      id="cardCvv"
                      type="text"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "mbway" && (
              <div className="space-y-2">
                <Label htmlFor="mbwayPhone">Número de Telemóvel *</Label>
                <Input
                  id="mbwayPhone"
                  type="tel"
                  placeholder="+351 900 000 000"
                  value={mbwayPhone}
                  onChange={(e) => setMbwayPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Irá receber uma notificação no seu telemóvel para confirmar o pagamento.
                </p>
              </div>
            )}

            {paymentMethod === "multibanco" && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Após confirmar, irá receber:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Entidade</li>
                  <li>• Referência</li>
                  <li>• Montante a pagar</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  As referências serão enviadas por email e têm validade de 48 horas.
                </p>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="space-y-2">
                <Label htmlFor="paypalEmail">Email PayPal *</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Será redirecionado para o PayPal para concluir o pagamento.
                </p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Plano {selectedPlanData?.name}</span>
                <span className="font-semibold">€{selectedPlanData?.price}/mês</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total</span>
                <span>€{selectedPlanData?.price}/mês</span>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "A processar..." : "Confirmar e Criar Conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>Pagamento seguro. Os seus dados estão protegidos.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
