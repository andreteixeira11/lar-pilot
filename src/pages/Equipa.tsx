import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Users, Trash2, Mail, Crown, Shield, Eye, Edit } from "lucide-react";

interface PropertyMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    name: string;
    email?: string;
  };
  user_email?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

const EXTRA_USER_COST = 5; // €5/mês por utilizador adicional

type AppRole = "owner" | "admin" | "editor" | "viewer";

const roleLabels: Record<AppRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  editor: <Edit className="h-4 w-4" />,
  viewer: <Eye className="h-4 w-4" />,
};

export default function Equipa() {
  const { user, profile } = useAuth();
  const { selectedPropertyId, selectedProperty, properties } = useProperty();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<PropertyMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("viewer");
  const [isInviting, setIsInviting] = useState(false);

  const isPremium = profile?.subscription_plan === "premium";
  const totalExtraUsers = members.length; // Excluding owner
  const monthlyCost = isPremium ? 0 : totalExtraUsers * EXTRA_USER_COST;

  useEffect(() => {
    if (selectedPropertyId) {
      loadMembers();
      loadInvitations();
    }
  }, [selectedPropertyId]);

  const loadMembers = async () => {
    if (!selectedPropertyId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("property_members")
      .select("*")
      .eq("property_id", selectedPropertyId);

    if (!error && data) {
      // Fetch profile info for each member
      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", member.user_id)
            .maybeSingle();
          
          return {
            ...member,
            profile: profileData || undefined,
          };
        })
      );
      setMembers(membersWithProfiles);
    }
    setIsLoading(false);
  };

  const loadInvitations = async () => {
    if (!selectedPropertyId) return;
    
    const { data, error } = await supabase
      .from("workspace_invitations")
      .select("*")
      .eq("property_id", selectedPropertyId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString());

    if (!error && data) {
      setInvitations(data);
    }
  };

  const handleInvite = async () => {
    if (!selectedPropertyId || !user || !inviteEmail) return;

    setIsInviting(true);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", inviteEmail)
      .maybeSingle();

    // Create invitation
    const { error } = await supabase.from("workspace_invitations").insert([{
      email: inviteEmail,
      property_id: selectedPropertyId,
      role: inviteRole as AppRole,
      invited_by: user.id,
    }]);

    setIsInviting(false);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Convite enviado",
      description: `Convite enviado para ${inviteEmail}`,
    });

    setInviteEmail("");
    setInviteRole("viewer");
    setInviteDialogOpen(false);
    loadInvitations();
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from("property_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Membro removido",
      description: "O membro foi removido da propriedade.",
    });

    loadMembers();
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from("workspace_invitations")
      .delete()
      .eq("id", invitationId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o convite.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Convite cancelado",
      description: "O convite foi cancelado.",
    });

    loadInvitations();
  };

  const handleUpdateRole = async (memberId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("property_members")
      .update({ role: newRole as AppRole })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Papel atualizado",
      description: "O papel do membro foi atualizado.",
    });

    loadMembers();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "?";
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Equipa"
        description="Gerir utilizadores com acesso às suas propriedades"
      />

      <div className="mt-6 space-y-6 max-w-4xl">
        {/* Billing Info Card */}
        <Card className={isPremium ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Utilizadores
                </CardTitle>
                <CardDescription>
                  {isPremium 
                    ? "Plano Premium: utilizadores ilimitados incluídos" 
                    : `Custo adicional: €${EXTRA_USER_COST}/mês por utilizador`
                  }
                </CardDescription>
              </div>
              {!isPremium && totalExtraUsers > 0 && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  +€{monthlyCost}/mês
                </Badge>
              )}
              {isPremium && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Property Owner Card */}
        <Card>
          <CardHeader>
            <CardTitle>Proprietário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(profile?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{profile?.name || "Proprietário"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Proprietário
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membros da Equipa</CardTitle>
                <CardDescription>
                  Utilizadores com acesso a "{selectedProperty?.name}"
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <DialogDescription>
                      Envie um convite para adicionar um novo membro à propriedade.
                      {!isPremium && (
                        <span className="block mt-2 text-primary font-medium">
                          Custo: +€{EXTRA_USER_COST}/mês
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Papel</Label>
                      <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AppRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Administrador - Acesso total
                            </div>
                          </SelectItem>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Editor - Pode editar dados
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Visualizador - Apenas leitura
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail || isInviting}
                      className="rounded-full"
                    >
                      {isInviting ? "A enviar..." : "Enviar Convite"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                A carregar...
              </div>
            ) : members.length === 0 && invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ainda não tem membros na equipa.</p>
                <p className="text-sm">Convide utilizadores para colaborar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Members */}
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(member.profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.profile?.name || "Utilizador"}</p>
                      <p className="text-sm text-muted-foreground">
                        Adicionado em {new Date(member.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleUpdateRole(member.id, value as AppRole)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                        <SelectItem value="editor">{roleLabels.editor}</SelectItem>
                        <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover o acesso deste utilizador à propriedade.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}

                {/* Pending Invitations */}
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-dashed bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Convite pendente • Expira em{" "}
                        {new Date(invitation.expires_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-property info */}
        {properties.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Acesso a Múltiplas Propriedades</CardTitle>
              <CardDescription>
                Os membros podem ter acesso diferente em cada propriedade. 
                Selecione a propriedade no menu para gerir a equipa específica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {properties.map((property) => (
                  <Badge
                    key={property.id}
                    variant={property.id === selectedPropertyId ? "default" : "outline"}
                  >
                    {property.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
