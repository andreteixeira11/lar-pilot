import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Perfil() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setNif(profile.nif || "");
    }
    if (user) {
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone, nif })
      .eq("id", user.id);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil atualizado",
        description: "As suas informações foram atualizadas com sucesso.",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem("current-password") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("new-password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirm-password") as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As palavras-passe não coincidem.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Palavra-passe alterada",
        description: "A sua palavra-passe foi alterada com sucesso.",
      });
      form.reset();
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Perfil"
        description="Gerir as suas informações pessoais"
      />

      <div className="mt-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telemóvel</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+351 900 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  placeholder="000000000"
                  maxLength={9}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A guardar..." : "Guardar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Alterar Palavra-passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Palavra-passe Atual</Label>
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Palavra-passe</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Palavra-passe</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full">
                Alterar Palavra-passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
