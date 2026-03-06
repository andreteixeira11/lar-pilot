import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Building2, Crown, ArrowLeft, CreditCard, Smartphone, Loader2, Mail, RefreshCw, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import { PricingSection, PricingTier } from "@/components/blocks/pricing-section";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type SubscriptionPlan = "basic" | "pro" | "premium";
type PaymentMethod = "multibanco" | "mbway" | "ccard" | "apple" | "google";

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
  
  const isResetPasswordMode = searchParams.get("mode") === "reset-password";
  
  const [isLogin, setIsLogin] = useState(initialMode);
  const [step, setStep] = useState<"auth" | "plan" | "email" | "verify-email" | "profile" | "payment" | "waiting-payment" | "reset-password">(
    isResetPasswordMode ? "reset-password" : showPlans ? "plan" : "auth"
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(initialPlan);
  const [isYearlyPlan, setIsYearlyPlan] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("multibanco");
  const [mbwayPhone, setMbwayPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Email verification
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  
  // Payment state
  const [paymentReference, setPaymentReference] = useState<{
    entity?: string;
    reference?: string;
    amount?: string;
    expiryDate?: string;
    requestId?: string;
  } | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = (location.state as { from?: string })?.from || "/overview";

  // Resend timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify-email" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Check for password recovery event or URL mode
  useEffect(() => {
    if (isResetPasswordMode) {
      setStep("reset-password");
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [isResetPasswordMode]);

  const handlePlanSelect = (tier: PricingTier, isYearly: boolean) => {
    const planId = tier.name.toLowerCase() as SubscriptionPlan;
    setSelectedPlan(planId);
    setIsYearlyPlan(isYearly);
    setStep("email");
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
    navigate("/overview");
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

  const handleSendVerificationCode = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, introduza o seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingCode(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { action: 'send', email },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Código enviado!",
        description: "Verifique o seu email para o código de verificação.",
      });

      setStep("verify-email");
      setResendTimer(60);
      setCanResend(false);
    } catch (error: unknown) {
      console.error("Error sending code:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao enviar o código.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código incompleto",
        description: "Por favor, introduza o código de 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingCode(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { action: 'verify', email, code: verificationCode },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Email verificado!",
        description: "O seu email foi verificado com sucesso.",
      });

      setStep("profile");
    } catch (error: unknown) {
      console.error("Error verifying code:", error);
      const errorMessage = error instanceof Error ? error.message : "Código inválido.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    await handleSendVerificationCode();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A palavra-passe deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedPlanData = pricingTiers.find((p) => p.name.toLowerCase() === selectedPlan);
      const price = isYearlyPlan ? selectedPlanData?.price.yearly : selectedPlanData?.price.monthly;
      const amount = price?.toFixed(2) || "0.00";
      const orderId = `SUB-${Date.now()}`;

      if (paymentMethod === "multibanco") {
        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: 'create-multibanco',
            amount,
            orderId,
            description: `Subscrição ${selectedPlanData?.name}`,
            clientEmail: email,
            expiryDays: 3,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        setPaymentReference({
          entity: String(data.entity),
          reference: String(data.reference).padStart(9, '0'),
          amount: String(data.amount),
          expiryDate: data.expiryDate,
        });

        // Create the user with pending status
        const { error: signupError } = await signup(email, password, name, phone, nif, selectedPlan || "basic");
        
        if (signupError) {
          throw signupError;
        }

        // Save payment record with pending status
        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          amount: parseFloat(amount),
          payment_method: 'multibanco',
          payment_status: 'pending',
          subscription_plan: selectedPlan || 'basic',
          multibanco_entity: String(data.entity),
          multibanco_reference: String(data.reference).padStart(9, '0'),
          transaction_id: orderId,
        });

        if (paymentError) {
          console.error('Error saving payment:', paymentError);
        }

        toast({
          title: "Referência gerada!",
          description: "Use os dados abaixo para efetuar o pagamento.",
        });

        setStep("waiting-payment");
      } else if (paymentMethod === "mbway") {
        if (!mbwayPhone || mbwayPhone.length < 9) {
          toast({
            title: "Número inválido",
            description: "Por favor, introduza um número de telefone válido.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: 'create-mbway',
            amount,
            orderId,
            mobileNumber: mbwayPhone,
            description: `Subscrição ${selectedPlanData?.name}`,
            email,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        toast({
          title: "Pedido enviado!",
          description: "Verifique o seu telemóvel para aprovar o pagamento.",
        });

        // Start polling for payment status
        setIsPolling(true);
        setStep("waiting-payment");
        pollMBWayStatus(data.requestId);
      } else if (paymentMethod === "ccard" || paymentMethod === "apple" || paymentMethod === "google") {
        const actionMap: Record<string, string> = {
          ccard: 'create-ccard',
          apple: 'create-apple-pay',
          google: 'create-google-pay',
        };

        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: actionMap[paymentMethod],
            amount,
            orderId,
            description: `Subscrição ${selectedPlanData?.name}`,
            email,
            returnUrl: window.location.origin + '/auth?showPlans=true',
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        if (data.paymentUrl) {
          // Create the user before redirecting
          await signup(email, password, name, phone, nif, selectedPlan || "basic");
          window.location.href = data.paymentUrl;
        } else {
          toast({
            title: "Erro",
            description: "URL de pagamento não disponível.",
            variant: "destructive",
          });
        }
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao processar o pagamento.";
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollMBWayStatus = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        toast({
          title: "Tempo expirado",
          description: "O pagamento MB Way expirou. Por favor, tente novamente.",
          variant: "destructive",
        });
        setStep("payment");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: 'check-mbway-status',
            requestId,
          },
        });

        if (error) throw error;

        if (data.isPaid) {
          setIsPolling(false);
          
          // Create the user and activate subscription
          const { error: signupError } = await signup(email, password, name, phone, nif, selectedPlan || "basic");
          
          if (signupError) {
            toast({
              title: "Erro no registo",
              description: signupError.message,
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "Pagamento confirmado!",
            description: "A sua conta foi criada com sucesso.",
          });
          navigate("/overview");
          return;
        }

        attempts++;
        setTimeout(checkStatus, 5000);
      } catch (error) {
        console.error("Error checking MB Way status:", error);
        attempts++;
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  };

  // Password reset page
  if (step === "reset-password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-20 w-auto"
              />
            </Link>
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
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-20 w-auto"
              />
            </Link>
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
                    <PasswordInput
                      id="login-password"
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
        <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      </div>
    );
  }

  // Plan selection
  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-6xl space-y-4">
          <Link to="/" className="flex justify-center hover:opacity-80 transition-opacity">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumental Atlantic" 
              className="h-20 w-auto"
            />
          </Link>
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

  // Email step (before verification)
  if (step === "email") {
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
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-16 w-auto"
              />
            </Link>
            <CardTitle className="text-2xl font-bold text-center">Verificar Email</CardTitle>
            <CardDescription className="text-center">
              Introduza o seu email para receber o código de verificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || !email}
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Código de Verificação
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verify email step
  if (step === "verify-email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => setStep("email")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-16 w-auto"
              />
            </Link>
            <CardTitle className="text-2xl font-bold text-center">Introduza o Código</CardTitle>
            <CardDescription className="text-center">
              Enviámos um código de 6 dígitos para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleVerifyCode}
                disabled={isVerifyingCode || verificationCode.length !== 6}
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A verificar...
                  </>
                ) : (
                  "Verificar Código"
                )}
              </Button>

              <div className="text-center">
                {canResend ? (
                  <Button
                    variant="link"
                    onClick={handleResendCode}
                    disabled={isSendingCode}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar código
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Reenviar código em {resendTimer}s
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile step (after email verification)
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
              onClick={() => setStep("verify-email")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-16 w-auto"
              />
            </Link>
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
                <Label htmlFor="phone">Telemóvel *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="912345678"
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showStrength
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
  if (step === "payment") {
    const selectedPlanData = pricingTiers.find((p) => p.name.toLowerCase() === selectedPlan);
    const price = isYearlyPlan ? selectedPlanData?.price.yearly : selectedPlanData?.price.monthly;

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
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-16 w-auto"
              />
            </Link>
            <CardTitle className="text-2xl font-bold text-center">Método de Pagamento</CardTitle>
            <CardDescription className="text-center">
              Plano: <span className="font-semibold text-foreground">{selectedPlanData?.name}</span> - €{price}/{isYearlyPlan ? 'ano' : 'mês'}
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
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Multibanco</div>
                        <div className="text-xs text-muted-foreground">Referência MB</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="mbway" id="mbway" />
                    <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">MB Way</div>
                        <div className="text-xs text-muted-foreground">Pagamento instantâneo</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="ccard" id="ccard" />
                    <Label htmlFor="ccard" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Cartão de Crédito</div>
                        <div className="text-xs text-muted-foreground">Visa, Mastercard, etc.</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="apple" id="apple" />
                    <Label htmlFor="apple" className="flex items-center gap-2 cursor-pointer flex-1">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      <div>
                        <div className="font-medium">Apple Pay</div>
                        <div className="text-xs text-muted-foreground">Pagamento com Apple</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="google" id="google" />
                    <Label htmlFor="google" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Google Pay</div>
                        <div className="text-xs text-muted-foreground">Pagamento com Google</div>
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
                    placeholder="912345678"
                    value={mbwayPhone}
                    onChange={(e) => setMbwayPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={9}
                    required
                  />
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Plano:</span>
                  <span>{selectedPlanData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Valor:</span>
                  <span className="text-lg font-bold text-primary">€{price}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || (paymentMethod === "mbway" && mbwayPhone.length < 9)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : paymentMethod === "multibanco" ? (
                  "Gerar Referência"
                ) : paymentMethod === "mbway" ? (
                  "Pagar com MB Way"
                ) : paymentMethod === "ccard" ? (
                  "Pagar com Cartão"
                ) : paymentMethod === "apple" ? (
                  "Pagar com Apple Pay"
                ) : (
                  "Pagar com Google Pay"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting for payment confirmation
  if (step === "waiting-payment") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atlantic" 
                className="h-16 w-auto"
              />
            </Link>
            {isPolling ? (
              <>
                <CardTitle className="text-2xl font-bold text-center">A Aguardar Confirmação</CardTitle>
                <CardDescription className="text-center">
                  Por favor, confirme o pagamento na app MB Way do seu telemóvel
                </CardDescription>
              </>
            ) : paymentReference ? (
              <>
                <CardTitle className="text-2xl font-bold text-center">Referência de Pagamento</CardTitle>
                <CardDescription className="text-center">
                  Use os dados abaixo para efetuar o pagamento por Multibanco
                </CardDescription>
              </>
            ) : null}
          </CardHeader>
          <CardContent>
            {isPolling ? (
              <div className="space-y-6 py-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Aguardando confirmação do pagamento...
                </p>
              </div>
            ) : paymentReference ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Entidade</p>
                  <p className="text-2xl font-bold font-mono">{paymentReference.entity}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Referência</p>
                  <p className="text-2xl font-bold font-mono">{paymentReference.reference}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Valor</p>
                  <p className="text-2xl font-bold text-primary">€{paymentReference.amount}</p>
                </div>
                {paymentReference.expiryDate && (
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Validade</p>
                    <p className="text-lg font-semibold">{paymentReference.expiryDate}</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold">Informação importante:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• O pagamento pode demorar até 24h a ser processado</li>
                    <li>• Após confirmação, receberá um email de ativação</li>
                    <li>• Só terá acesso à plataforma após confirmação do pagamento</li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Voltar ao Início
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default fallback
  return null;
}
