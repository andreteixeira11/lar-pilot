import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Home, Sparkles, Crown, ArrowLeft, CreditCard, Smartphone, Building2, DollarSign, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import { PricingSection, PricingTier } from "@/components/blocks/pricing-section";

type SubscriptionPlan = "basic" | "pro" | "premium";
type PaymentMethod = "card" | "mbway" | "multibanco" | "paypal";

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: {
      monthly: 7,
      yearly: 70,
    },
    description: "Para começar",
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

export default function Auth() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get("mode") === "login";
  const initialPlan = searchParams.get("plan") as SubscriptionPlan | null;
  const showPlans = searchParams.get("showPlans") === "true";
  
  const [isLogin, setIsLogin] = useState(initialMode);
  const [step, setStep] = useState<"auth" | "plan" | "profile" | "payment" | "property" | "reset-password">(
    showPlans ? "plan" : "auth"
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(initialPlan);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
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
  const location = useLocation();
  const { toast } = useToast();
  
  // Get return path from state (set by AdminRoute or ProtectedRoute)
  const from = (location.state as { from?: string })?.from || "/dashboard";

  // Check for password recovery event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanSelect = (tier: PricingTier, isYearly: boolean) => {
    const planId = tier.name.toLowerCase() as SubscriptionPlan;
    setSelectedPlan(planId);
    setStep("profile");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As palavras-passe não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A palavra-passe deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Palavra-passe atualizada!",
      description: "A sua palavra-passe foi alterada com sucesso.",
    });
    setIsLoading(false);
    navigate("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(email, password);
    
    if (error) {
      toast({
        title: "Erro de autenticação",
        description: error.message === "Invalid login credentials" 
          ? "Email ou palavra-passe incorretos." 
          : error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Login efetuado com sucesso!",
      description: "Bem-vindo de volta.",
    });
    setIsLoading(false);
    navigate(from);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("property");
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFinalSignup();
  };

  const handleFinalSignup = async () => {
    setIsLoading(true);
    
    const { error } = await signup(email, password, name, phone, nif, selectedPlan || "basic");
    
    if (error) {
      toast({
        title: "Erro no registo",
        description: error.message === "User already registered" 
          ? "Este email já está registado. Faça login." 
          : error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Conta criada com sucesso!",
      description: "Pode agora aceder à plataforma.",
    });
    setIsLoading(false);
    navigate("/dashboard");
  };

  // Password reset page
  if (step === "reset-password") {
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
            <CardTitle className="text-2xl font-bold text-center">Redefinir Palavra-passe</CardTitle>
            <CardDescription className="text-center">
              Introduza a sua nova palavra-passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Palavra-passe</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="Introduza a nova palavra-passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showStrength
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Palavra-passe</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="Repita a palavra-passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A guardar..." : "Guardar Nova Palavra-passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Palavra-passe</Label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueceu a palavra-passe?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
        <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      </div>
    );
  }

  // Plan selection
  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-6xl space-y-4">
          <div className="flex justify-center">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumenta Atlantic" 
              className="h-20 w-auto"
            />
          </div>
          <div className="flex justify-start max-w-5xl mx-auto px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("auth")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <PricingSection 
            tiers={pricingTiers} 
            onSelectPlan={handlePlanSelect}
            className="py-4"
          />
        </div>
      </div>
    );
  }

  // Profile step
  if (step === "profile") {
    const selectedPlanData = pricingTiers.find((p) => p.name.toLowerCase() === selectedPlan);
    
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
                <PasswordInput
                  id="signup-password"
                  placeholder="Introduza a palavra-passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showStrength
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

  // Payment step (now comes BEFORE property)
  if (step === "payment") {
    const selectedPlanData = pricingTiers.find((p) => p.name.toLowerCase() === selectedPlan);

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
            <CardTitle className="text-2xl font-bold text-center">Método de Pagamento</CardTitle>
            <CardDescription className="text-center">
              Plano: <span className="font-semibold text-foreground">{selectedPlanData?.name}</span> - €{selectedPlanData?.price.monthly}/mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Selecione o Método de Pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="multibanco" id="multibanco" />
                    <Label htmlFor="multibanco" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Multibanco</div>
                        <div className="text-xs text-muted-foreground">Referência MB</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="mbway" id="mbway" />
                    <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <div className="font-medium">MB Way</div>
                        <div className="text-xs text-muted-foreground">Pagamento via telemóvel</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Cartão de Crédito</div>
                        <div className="text-xs text-muted-foreground">Visa, Mastercard</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "mbway" && (
                <div className="space-y-2">
                  <Label htmlFor="mbway-phone">Número de Telemóvel</Label>
                  <Input
                    id="mbway-phone"
                    type="tel"
                    placeholder="+351 900 000 000"
                    value={mbwayPhone}
                    onChange={(e) => setMbwayPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              {paymentMethod === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Número do Cartão</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">Validade</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                        maxLength={3}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">
                {paymentMethod === "multibanco" ? "Gerar Referência" : "Continuar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property step (now comes AFTER payment)
  if (step === "property") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => setStep("payment")}
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
                Continuar para Pagamento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment step
  const selectedPlanData = pricingTiers.find((p) => p.name.toLowerCase() === selectedPlan);
  
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
            Plano {selectedPlanData?.name} - €{selectedPlanData?.price.monthly}/mês
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
                <span className="font-semibold">€{selectedPlanData?.price.monthly}/mês</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total</span>
                <span>€{selectedPlanData?.price.monthly}/mês</span>
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
