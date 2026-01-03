import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Calendar, 
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "Novo", color: "bg-blue-500", icon: Clock },
  contacted: { label: "Contactado", color: "bg-yellow-500", icon: MessageSquare },
  qualified: { label: "Qualificado", color: "bg-purple-500", icon: CheckCircle },
  converted: { label: "Convertido", color: "bg-green-500", icon: CheckCircle },
  lost: { label: "Perdido", color: "bg-red-500", icon: XCircle },
};

const AdminLeads = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulator_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const updateData: any = { status };
      if (admin_notes !== undefined) {
        updateData.admin_notes = admin_notes;
      }
      if (status === "contacted") {
        updateData.contacted_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("simulator_leads")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Lead atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar lead");
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("simulator_leads")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Lead eliminado com sucesso");
      setDeleteLeadId(null);
    },
    onError: () => {
      toast.error("Erro ao eliminar lead");
    },
  });

  // Filter leads
  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.owner_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const statusCounts = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleUpdateStatus = (id: string, status: string) => {
    updateLeadMutation.mutate({ id, status });
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      updateLeadMutation.mutate({ 
        id: selectedLead.id, 
        status: selectedLead.status,
        admin_notes: adminNotes 
      });
      setSelectedLead({ ...selectedLead, admin_notes: adminNotes });
    }
  };

  const openLeadDetails = (lead: any) => {
    setSelectedLead(lead);
    setAdminNotes(lead.admin_notes || "");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Lead Center"
        description="Gestão de pedidos do simulador"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-all hover:scale-105 ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${config.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-xl font-bold">{statusCounts[status] || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email ou propriedade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Leads ({filteredLeads?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">A carregar...</div>
          ) : filteredLeads?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Propriedade</TableHead>
                    <TableHead>Pacote</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads?.map((lead) => {
                    const status = statusConfig[lead.status as LeadStatus] || statusConfig.new;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(lead.created_at), "dd MMM yyyy", { locale: pt })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.owner_name}</p>
                            <p className="text-xs text-muted-foreground">{lead.owner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.property_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{lead.property_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.package_name}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {lead.total_commission}%
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openLeadDetails(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteLeadId(lead.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Informações do Proprietário
                </h3>
                <div className="grid gap-2 text-sm bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.owner_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedLead.owner_email}`} className="text-primary hover:underline">
                      {selectedLead.owner_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedLead.owner_phone}`} className="text-primary hover:underline">
                      {selectedLead.owner_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Informações da Propriedade
                </h3>
                <div className="grid gap-2 text-sm bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.property_name} ({selectedLead.property_type})
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.address}
                  </div>
                  <div className="flex gap-4 mt-2">
                    {selectedLead.bedrooms && (
                      <span className="text-muted-foreground">{selectedLead.bedrooms} quartos</span>
                    )}
                    {selectedLead.bathrooms && (
                      <span className="text-muted-foreground">{selectedLead.bathrooms} WC</span>
                    )}
                    {selectedLead.capacity && (
                      <span className="text-muted-foreground">{selectedLead.capacity} hóspedes</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Pacote Selecionado</h3>
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedLead.package_name}</span>
                    <span className="text-2xl font-bold text-primary">{selectedLead.total_commission}%</span>
                  </div>
                  {selectedLead.selected_services && selectedLead.selected_services.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">Serviços Adicionais:</p>
                      <ul className="text-sm space-y-1">
                        {selectedLead.selected_services.map((service: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes from client */}
              {selectedLead.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Notas do Cliente</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold">Notas Internas</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicionar notas sobre este lead..."
                  rows={3}
                />
                <Button onClick={handleSaveNotes} size="sm" variant="outline">
                  Guardar Notas
                </Button>
              </div>

              {/* Status Update */}
              <div className="space-y-3">
                <h3 className="font-semibold">Alterar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <Button
                      key={status}
                      variant={selectedLead.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedLead.id, status);
                        setSelectedLead({ ...selectedLead, status });
                      }}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Meta Info */}
              <div className="text-xs text-muted-foreground border-t pt-4 flex gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado: {format(new Date(selectedLead.created_at), "dd/MM/yyyy HH:mm")}
                </span>
                {selectedLead.contacted_at && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Contactado: {format(new Date(selectedLead.contacted_at), "dd/MM/yyyy HH:mm")}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este lead? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLeadId && deleteLeadMutation.mutate(deleteLeadId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLeads;
