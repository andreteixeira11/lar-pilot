import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

export function OwnerForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Check if owner exists
      const { data: owner, error: findError } = await supabase
        .from("property_owners")
        .select("id, name, email, property_id")
        .eq("email", email)
        .maybeSingle();

      if (findError || !owner) {
        setError("Não foi encontrada nenhuma conta com este email.");
        setIsSubmitting(false);
        return;
      }

      // Get property name
      const { data: property } = await supabase
        .from("properties")
        .select("name")
        .eq("id", owner.property_id)
        .single();

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Save token
      const { error: updateError } = await supabase
        .from("property_owners")
        .update({
          password_reset_token: resetToken,
          password_reset_expires: expiresAt.toISOString(),
        })
        .eq("id", owner.id);

      if (updateError) {
        throw updateError;
      }

      // Send email
      const resetLink = `${window.location.origin}/proprietario/reset-password?token=${resetToken}`;
      
      await supabase.functions.invoke("send-owner-notification", {
        body: {
          type: "password_reset",
          ownerEmail: owner.email,
          ownerName: owner.name,
          propertyName: property?.name || "Sua Propriedade",
          resetLink,
        },
      });

      setSuccess(true);
    } catch (err) {
      console.error("Reset request error:", err);
      setError("Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmail("");
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm p-0 h-auto">
          Esqueceu a password?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recuperar Password</DialogTitle>
          <DialogDescription>
            Introduza o seu email para receber um link de recuperação.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Email Enviado!</p>
            <p className="text-sm text-muted-foreground">
              Verifique a sua caixa de entrada para o link de recuperação.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "A enviar..." : "Enviar Link de Recuperação"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
