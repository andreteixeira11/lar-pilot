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
import { CreditCard, Smartphone, Copy, Check } from "lucide-react";
import { IfthenPayService } from "@/lib/ifthenpay";
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
  const [paymentMethod, setPaymentMethod] = useState<"multibanco" | "mbway">("multibanco");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<{
    entidade?: string;
    referencia?: string;
    valor?: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(plan.price);
      const orderId = `SUB-${Date.now()}`;

      if (paymentMethod === "multibanco") {
        const payment = await IfthenPayService.createMultibancoPayment({
          amount,
          orderId,
          description: `Subscrição ${plan.name}`,
          email: userEmail,
        });

        setPaymentReference(payment);

        // Send email with payment reference
        await EmailService.sendPaymentReference(userEmail, {
          plan: plan.name,
          amount,
          reference: payment.referencia,
          entidade: payment.entidade,
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

        await IfthenPayService.createMBWayPayment({
          amount,
          orderId,
          description: `Subscrição ${plan.name}`,
          email: userEmail,
          phone,
        });

        toast({
          title: "Pedido enviado!",
          description: "Verifique o seu telemóvel para aprovar o pagamento.",
        });

        // Simulate payment confirmation after 3 seconds
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pagamento - {plan.name}</DialogTitle>
          <DialogDescription>
            Escolha o método de pagamento para ativar a sua subscrição
          </DialogDescription>
        </DialogHeader>

        {!paymentReference ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label>Método de Pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "multibanco" | "mbway")}>
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
              {isProcessing ? "A processar..." : "Pagar"}
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
                  <div className="text-2xl font-bold font-mono">{paymentReference.entidade}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentReference.entidade!, "Entidade")}
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
                  <div className="text-2xl font-bold font-mono">{paymentReference.referencia}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentReference.referencia!, "Referência")}
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
                <div className="text-2xl font-bold text-primary">€{paymentReference.valor}</div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Informação importante:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Os dados de pagamento foram enviados para o seu email</li>
                <li>• O pagamento pode demorar até 24h a ser processado</li>
                <li>• Receberá uma confirmação assim que o pagamento for confirmado</li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
