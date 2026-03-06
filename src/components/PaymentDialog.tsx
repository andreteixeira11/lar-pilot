import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Copy, Check, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmailService } from "@/lib/emailService";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    id: string;
    name: string;
    price: string;
  };
  userEmail: string;
  onSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, plan, userEmail, onSuccess }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"multibanco" | "mbway" | "apple" | "google" | "ccard">("multibanco");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentReference, setPaymentReference] = useState<{
    entity?: string;
    reference?: string;
    amount?: string;
    expiryDate?: string;
    requestId?: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(plan.price).toFixed(2);
      const orderId = `SUB-${Date.now()}`;

      if (paymentMethod === "multibanco") {
        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: 'create-multibanco',
            amount,
            orderId,
            description: `Subscrição ${plan.name}`,
            clientEmail: userEmail,
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

        // Send email with payment reference
        await EmailService.sendPaymentReference(userEmail, {
          plan: plan.name,
          amount: parseFloat(amount),
          reference: String(data.reference).padStart(9, '0'),
          entidade: String(data.entity),
        });

        toast({
          title: "Referência gerada!",
          description: "Verifique o seu email para os detalhes de pagamento.",
        });

      } else if (paymentMethod === "mbway") {
        if (!phone || phone.length < 9) {
          toast({
            title: "Número de telefone inválido",
            description: "Por favor, introduza um número de telefone válido.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: 'create-mbway',
            amount,
            orderId,
            mobileNumber: phone,
            description: `Subscrição ${plan.name}`,
            email: userEmail,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        toast({
          title: "Pedido enviado!",
          description: "Verifique o seu telemóvel para aprovar o pagamento.",
        });

        setIsPolling(true);
        pollMBWayStatus(data.requestId);
      } else if (paymentMethod === "apple" || paymentMethod === "google" || paymentMethod === "ccard") {
        const actionMap = {
          apple: 'create-apple-pay',
          google: 'create-google-pay',
          ccard: 'create-ccard',
        };

        const { data, error } = await supabase.functions.invoke('ifthenpay-payment', {
          body: {
            action: actionMap[paymentMethod],
            amount,
            orderId,
            description: `Subscrição ${plan.name}`,
            email: userEmail,
            returnUrl: window.location.origin + '/subscriptions',
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        // Redirect to payment URL
        if (data.paymentUrl) {
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
      setIsProcessing(false);
    }
  };

  const pollMBWayStatus = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5 seconds interval)
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        toast({
          title: "Tempo expirado",
          description: "O pagamento MB Way expirou. Por favor, tente novamente.",
          variant: "destructive",
        });
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
          toast({
            title: "Pagamento confirmado!",
            description: "A sua subscrição foi ativada com sucesso.",
          });
          onSuccess();
          onOpenChange(false);
          return;
        }

        // Continue polling
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copiado!",
      description: `${field} copiado para a área de transferência.`,
    });
  };

  const handleClose = () => {
    if (!isPolling) {
      setPaymentReference(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pagamento - {plan.name}</DialogTitle>
          <DialogDescription>
            Escolha o método de pagamento para ativar a sua subscrição
          </DialogDescription>
        </DialogHeader>

        {isPolling ? (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="font-semibold text-lg">A aguardar confirmação</h3>
              <p className="text-sm text-muted-foreground">
                Por favor, confirme o pagamento na app MB Way do seu telemóvel.
              </p>
            </div>
          </div>
        ) : !paymentReference ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label>Método de Pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="multibanco" id="multibanco" />
                  <Label htmlFor="multibanco" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">Multibanco</div>
                      <div className="text-sm text-muted-foreground">Pagamento por referência</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="mbway" id="mbway" />
                  <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">MB Way</div>
                      <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="ccard" id="ccard" />
                  <Label htmlFor="ccard" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">Cartão de Crédito</div>
                      <div className="text-sm text-muted-foreground">Visa, Mastercard, etc.</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="apple" id="apple" />
                  <Label htmlFor="apple" className="flex items-center gap-2 cursor-pointer flex-1">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div className="flex-1">
                      <div className="font-semibold">Apple Pay</div>
                      <div className="text-sm text-muted-foreground">Pagamento com Apple</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <RadioGroupItem value="google" id="google" />
                  <Label htmlFor="google" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">Google Pay</div>
                      <div className="text-sm text-muted-foreground">Pagamento com Google</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "mbway" && (
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telemóvel</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={9}
                />
                <p className="text-sm text-muted-foreground">
                  Introduza o número de telemóvel associado ao MB Way
                </p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Plano:</span>
                <span>{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Valor:</span>
                <span className="text-lg font-bold text-primary">€{plan.price}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === "mbway" && phone.length < 9)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A processar...
                </>
              ) : (
                "Pagar"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Referência de Pagamento</h3>
              <p className="text-sm text-muted-foreground">
                Utilize os dados abaixo para efetuar o pagamento por Multibanco
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Entidade</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold font-mono">{paymentReference.entity}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentReference.entity!, "Entidade")}
                  >
                    {copied === "Entidade" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Referência</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold font-mono">{paymentReference.reference}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentReference.reference!, "Referência")}
                  >
                    {copied === "Referência" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Valor</div>
                <div className="text-2xl font-bold text-primary">€{paymentReference.amount}</div>
              </div>

              {paymentReference.expiryDate && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Validade</div>
                  <div className="text-lg font-semibold">{paymentReference.expiryDate}</div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Informação importante:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Os dados de pagamento foram enviados para o seu email</li>
                <li>• O pagamento pode demorar até 24h a ser processado</li>
                <li>• Receberá uma confirmação assim que o pagamento for confirmado</li>
              </ul>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
