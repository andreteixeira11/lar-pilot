import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function OwnerResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setIsValidToken(false);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    const { data, error } = await supabase
      .from("property_owners")
      .select("id")
      .eq("password_reset_token", resetToken)
      .gt("password_reset_expires", new Date().toISOString())
      .maybeSingle();

    setIsValidToken(!error && !!data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A password deve ter pelo menos 8 caracteres.");
      return;
    }

    // Check for complexity requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError("A password deve conter pelo menos uma letra maiúscula, uma minúscula e um número.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password and clear reset token
      const { error: updateError } = await supabase
        .from("property_owners")
        .update({
          password_hash: password, // Will be hashed by trigger
          password_reset_token: null,
          password_reset_expires: null,
        })
        .eq("password_reset_token", token);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => navigate("/proprietario/login"), 3000);
    } catch (err) {
      console.error("Reset error:", err);
      setError("Erro ao redefinir password. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">A validar...</div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Inválido ou Expirado</h2>
            <p className="text-muted-foreground mb-4">
              Este link de redefinição de password é inválido ou já expirou.
            </p>
            <Button onClick={() => navigate("/proprietario/login")}>
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Password Redefinida!</h2>
            <p className="text-muted-foreground">
              A sua password foi alterada com sucesso. Será redirecionado para o login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Redefinir Password</h1>
          <p className="text-muted-foreground mt-1">
            Crie uma nova password para a sua conta
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Nova Password</CardTitle>
            <CardDescription>
              Introduza a sua nova password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nova Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "A guardar..." : "Guardar Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
