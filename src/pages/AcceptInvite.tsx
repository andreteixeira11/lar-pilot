import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "login_required">("loading");
  const [message, setMessage] = useState("");
  const [invitation, setInvitation] = useState<any>(null);

  useEffect(() => {
    const verifyAndAcceptInvite = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Link de convite inválido.");
        return;
      }

      // First, fetch the invitation to check if it exists and is valid
      const { data: inviteData, error: inviteError } = await supabase
        .from("workspace_invitations")
        .select("*, properties(name)")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (inviteError || !inviteData) {
        setStatus("error");
        setMessage("Este convite não existe, já foi aceite ou expirou.");
        return;
      }

      setInvitation(inviteData);

      // If user is not logged in, they need to login/register first
      if (!user) {
        setStatus("login_required");
        setMessage(`Tem um convite para aceder a "${inviteData.properties?.name || 'uma propriedade'}". Por favor faça login ou registe-se para aceitar.`);
        return;
      }

      // Check if the user's email matches the invitation
      if (user.email?.toLowerCase() !== inviteData.email.toLowerCase()) {
        setStatus("error");
        setMessage(`Este convite foi enviado para ${inviteData.email}. Por favor faça login com essa conta.`);
        return;
      }

      // Accept the invitation
      try {
        // Add user as property member
        const { error: memberError } = await supabase
          .from("property_members")
          .insert({
            property_id: inviteData.property_id,
            user_id: user.id,
            role: inviteData.role,
            invited_by: inviteData.invited_by,
          });

        if (memberError) {
          // If already a member, that's ok
          if (!memberError.message.includes("duplicate")) {
            throw memberError;
          }
        }

        // Mark invitation as accepted
        await supabase
          .from("workspace_invitations")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", inviteData.id);

        setStatus("success");
        setMessage(`Convite aceite com sucesso! Agora tem acesso a "${inviteData.properties?.name}".`);
      } catch (err: any) {
        console.error("Error accepting invitation:", err);
        setStatus("error");
        setMessage("Ocorreu um erro ao aceitar o convite. Por favor tente novamente.");
      }
    };

    if (!authLoading) {
      verifyAndAcceptInvite();
    }
  }, [token, user, authLoading]);

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">A verificar convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
            {status === "login_required" && (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">👋</span>
              </div>
            )}
          </div>
          <CardTitle>
            {status === "success" && "Convite Aceite!"}
            {status === "error" && "Erro no Convite"}
            {status === "login_required" && "Bem-vindo!"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <Button 
              className="w-full rounded-full" 
              onClick={() => navigate("/overview")}
            >
              Ir para o Dashboard
            </Button>
          )}
          
          {status === "error" && (
            <Button 
              variant="outline" 
              className="w-full rounded-full" 
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
          )}
          
          {status === "login_required" && (
            <div className="space-y-2">
              <Button 
                className="w-full rounded-full" 
                onClick={() => navigate(`/auth?redirect=/accept-invite?token=${token}`)}
              >
                Entrar ou Registar
              </Button>
              <Button 
                variant="outline" 
                className="w-full rounded-full" 
                onClick={() => navigate("/")}
              >
                Voltar ao Início
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
