import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/contexts/PropertyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  User,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const requestTypeLabels: Record<string, string> = {
  early_checkin: "Check-in antecipado",
  late_checkout: "Check-out tardio",
  extra_bed: "Cama extra",
  transfer: "Transfer",
  other: "Outro",
};

export default function PedidosHospedes() {
  const { selectedProperty } = useProperty();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["guest-requests", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];

      // Get reservations for this property first
      const { data: reservations } = await supabase
        .from("reservations")
        .select("id, guest_name, check_in, check_out")
        .eq("property_id", selectedProperty.id);

      if (!reservations?.length) return [];

      const reservationIds = reservations.map((r) => r.id);

      const { data, error } = await supabase
        .from("guest_requests")
        .select("*")
        .in("reservation_id", reservationIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Merge reservation info
      return (data || []).map((req: any) => {
        const res = reservations.find((r) => r.id === req.reservation_id);
        return { ...req, guest_name: res?.guest_name, check_in: res?.check_in, check_out: res?.check_out };
      });
    },
    enabled: !!selectedProperty?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, manager_response }: { id: string; status: string; manager_response: string }) => {
      const { error } = await supabase
        .from("guest_requests")
        .update({ status, manager_response, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-requests"] });
      toast.success("Pedido atualizado!");
      setSelectedRequest(null);
      setResponse("");
      setNewStatus("");
    },
    onError: () => toast.error("Erro ao atualizar pedido"),
  });

  const filteredRequests = requests?.filter((r: any) =>
    filterStatus === "all" ? true : r.status === filterStatus
  ) || [];

  const statusCounts = {
    pending: requests?.filter((r: any) => r.status === "pending").length || 0,
    approved: requests?.filter((r: any) => r.status === "approved").length || 0,
    rejected: requests?.filter((r: any) => r.status === "rejected").length || 0,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title="Pedidos dos Hóspedes" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{statusCounts.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{statusCounts.approved}</p>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{statusCounts.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="approved">Aprovados</SelectItem>
          <SelectItem value="rejected">Rejeitados</SelectItem>
        </SelectContent>
      </Select>

      {/* Request List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req: any) => (
            <Card
              key={req.id}
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setSelectedRequest(req); setNewStatus(req.status); setResponse(req.manager_response || ""); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm text-foreground truncate">{req.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {req.check_in && format(parseISO(req.check_in), "d MMM", { locale: pt })}
                      {" → "}
                      {req.check_out && format(parseISO(req.check_out), "d MMM", { locale: pt })}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {requestTypeLabels[req.request_type] || req.request_type}
                    </Badge>
                    <p className="text-sm text-foreground line-clamp-2">{req.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {req.status === "pending" ? "Pendente" : req.status === "approved" ? "Aprovado" : "Rejeitado"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(parseISO(req.created_at), "d MMM HH:mm", { locale: pt })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Responder ao Pedido
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{selectedRequest.guest_name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {requestTypeLabels[selectedRequest.request_type] || selectedRequest.request_type}
                </Badge>
                <p className="text-sm text-foreground">{selectedRequest.message}</p>
              </div>

              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovar</SelectItem>
                  <SelectItem value="rejected">Rejeitar</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Resposta ao hóspede (opcional)..."
                rows={3}
              />

              <Button
                onClick={() => updateMutation.mutate({
                  id: selectedRequest.id,
                  status: newStatus,
                  manager_response: response,
                })}
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Atualizar Pedido
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
