import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";

interface UpsellItem {
  name: string;
  price: number;
  quantity: number;
}

interface UpsellOrder {
  id: string;
  guest_name: string;
  guest_email: string;
  items: UpsellItem[];
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  guidebook_id: string;
  reservation_id: string | null;
  guidebooks?: {
    title: string;
    property_id: string;
    properties?: {
      name: string;
    };
  };
}

const UpsellOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<UpsellOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["upsell-orders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("upsell_orders")
        .select(`
          *,
          guidebooks (
            title,
            property_id,
            properties (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as UpsellOrder[];
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("upsell_orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;

      // Send email notification
      if (status === "confirmed" || status === "rejected") {
        const order = orders?.find(o => o.id === orderId);
        if (order) {
          const { error: emailError } = await supabase.functions.invoke("send-upsell-status-email", {
            body: {
              guestEmail: order.guest_email,
              guestName: order.guest_name,
              status,
              items: order.items,
              totalAmount: order.total_amount,
              propertyName: order.guidebooks?.properties?.name,
            },
          });
          if (emailError) {
            console.error("Failed to send email:", emailError);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pending-upsells-count"] });
      toast.success("Estado atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar estado");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) => {
      const { error } = await supabase
        .from("upsell_orders")
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pending-upsells-count"] });
      toast.success("Estado de pagamento atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar pagamento");
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "secondary" },
      confirmed: { label: "Confirmado", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" },
      completed: { label: "Concluído", variant: "outline" },
    };
    const { label, variant } = config[status] || { label: status, variant: "secondary" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: "Aguarda Pagamento", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Pago", className: "bg-green-100 text-green-800" },
      refunded: { label: "Reembolsado", className: "bg-gray-100 text-gray-800" },
    };
    const { label, className } = config[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={className}>{label}</Badge>;
  };

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === "pending").length || 0,
    confirmed: orders?.filter(o => o.status === "confirmed").length || 0,
    totalRevenue: orders?.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount, 0) || 0,
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeader
        title="Pedidos de Upsell"
        description="Gerir pedidos de serviços adicionais dos hóspedes"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrar por estado:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              A carregar pedidos...
            </div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Alojamento</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(order.created_at), "dd MMM yyyy", { locale: pt })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.guest_name}</p>
                        <p className="text-sm text-muted-foreground">{order.guest_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.guidebooks?.properties?.name || order.guidebooks?.title || "-"}
                    </TableCell>
                    <TableCell>
                      {(order.items as UpsellItem[])?.length || 0} item(s)
                    </TableCell>
                    <TableCell className="font-medium">
                      €{order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "confirmed" })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "rejected" })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum pedido de upsell encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hóspede</p>
                  <p className="font-medium">{selectedOrder.guest_name}</p>
                  <p className="text-sm">{selectedOrder.guest_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "dd MMM yyyy HH:mm", { locale: pt })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Alojamento</p>
                <p className="font-medium">
                  {selectedOrder.guidebooks?.properties?.name || selectedOrder.guidebooks?.title || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Itens</p>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  {(selectedOrder.items as UpsellItem[])?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>€{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Estado do Pedido</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: value });
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Estado do Pagamento</p>
                  <Select
                    value={selectedOrder.payment_status}
                    onValueChange={(value) => {
                      updatePaymentMutation.mutate({ orderId: selectedOrder.id, paymentStatus: value });
                      setSelectedOrder({ ...selectedOrder, payment_status: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Aguarda Pagamento</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Última atualização: {format(new Date(selectedOrder.updated_at), "dd MMM yyyy HH:mm", { locale: pt })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpsellOrders;
