import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, FileText, Calendar, CreditCard, Building2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    phone?: string | null;
    nif?: string | null;
    subscription_plan?: string | null;
    subscription_status?: string | null;
    extra_users_count?: number | null;
    extra_users_cost?: number | null;
    created_at: string;
    updated_at: string;
  } | null;
}

export const UserDetailsDialog = ({
  open,
  onOpenChange,
  user,
}: UserDetailsDialogProps) => {
  const { data: properties } = useQuery({
    queryKey: ["user-properties", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  const { data: payments } = useQuery({
    queryKey: ["user-payments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  if (!user) return null;

  const getPlanBadgeVariant = (plan: string | null) => {
    switch (plan) {
      case "premium":
        return "default";
      case "pro":
        return "secondary";
      case "basic":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {user.name || "Sem nome"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Telemóvel</p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phone || "-"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">NIF</p>
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {user.nif || "-"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Subscription */}
          <div>
            <h4 className="font-medium mb-3">Subscrição</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Plano</p>
                <Badge variant={getPlanBadgeVariant(user.subscription_plan)} className="mt-1">
                  {user.subscription_plan || "Free"}
                </Badge>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="mt-1">{getStatusBadge(user.subscription_status)}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Utilizadores Extra</p>
                <p className="font-medium mt-1">{user.extra_users_count || 0}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Custo Extra</p>
                <p className="font-medium mt-1">€{(user.extra_users_cost || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Properties */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Propriedades ({properties?.length || 0})
            </h4>
            {properties && properties.length > 0 ? (
              <div className="space-y-2">
                {properties.map((prop) => (
                  <div key={prop.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{prop.name}</p>
                    <p className="text-sm text-muted-foreground">{prop.address}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma propriedade</p>
            )}
          </div>

          <Separator />

          {/* Recent Payments */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamentos Recentes
            </h4>
            {payments && payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{payment.subscription_plan}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: pt })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">€{Number(payment.amount).toFixed(2)}</p>
                      <Badge variant={payment.payment_status === "completed" ? "default" : "outline"}>
                        {payment.payment_status === "completed" ? "Pago" : payment.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pagamento registado</p>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Registo</p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(user.updated_at), "dd/MM/yyyy HH:mm", { locale: pt })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
