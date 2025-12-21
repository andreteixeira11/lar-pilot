import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Plus, 
  FileText, 
  Euro, 
  TrendingUp, 
  Download, 
  Send, 
  Settings,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const Faturacao = () => {
  const { user } = useAuth();
  const { selectedProperty } = useProperty();
  const queryClient = useQueryClient();
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", user?.id, selectedProperty?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (selectedProperty) {
        query = query.eq("property_id", selectedProperty.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch invoice series
  const { data: invoiceSeries } = useQuery({
    queryKey: ["invoice-series", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("invoice_series")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch SAF-T submissions
  const { data: saftSubmissions } = useQuery({
    queryKey: ["saft-submissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("saft_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch account transactions
  const { data: transactions } = useQuery({
    queryKey: ["account-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("account_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats = {
    totalInvoiced: invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
    pendingPayments: invoices?.filter(inv => inv.payment_status === "pending").reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
    paidThisMonth: invoices?.filter(inv => 
      inv.payment_status === "paid" && 
      inv.issue_date?.startsWith(selectedMonth)
    ).reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
    invoiceCount: invoices?.length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20"><AlertCircle className="h-3 w-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Faturação"
        description="Gestão completa de faturação, séries e conta corrente"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Faturado</p>
                <p className="text-2xl font-bold">€{stats.totalInvoiced.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">€{stats.pendingPayments.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recebido Este Mês</p>
                <p className="text-2xl font-bold text-green-600">€{stats.paidThisMonth.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturas Emitidas</p>
                <p className="text-2xl font-bold">{stats.invoiceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="mt-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" />
            Faturas
          </TabsTrigger>
          <TabsTrigger value="series" className="gap-2">
            <Settings className="h-4 w-4" />
            Séries
          </TabsTrigger>
          <TabsTrigger value="saft" className="gap-2">
            <Send className="h-4 w-4" />
            SAF-T
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Conta Corrente
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-auto"
              />
            </div>
            <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Fatura</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da fatura
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Série</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar série" />
                        </SelectTrigger>
                        <SelectContent>
                          {invoiceSeries?.map((series) => (
                            <SelectItem key={series.id} value={series.id}>
                              {series.series_code} - {series.series_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Emissão</Label>
                      <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Cliente</Label>
                      <Input placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label>NIF do Cliente</Label>
                      <Input placeholder="NIF" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Morada do Cliente</Label>
                    <Input placeholder="Morada completa" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Itens da Fatura</h4>
                    <div className="grid grid-cols-12 gap-2 mb-2 text-sm text-muted-foreground">
                      <div className="col-span-5">Descrição</div>
                      <div className="col-span-2">Qtd</div>
                      <div className="col-span-2">Preço</div>
                      <div className="col-span-2">IVA</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Descrição do item" />
                      <Input className="col-span-2" type="number" defaultValue="1" />
                      <Input className="col-span-2" type="number" placeholder="0.00" />
                      <Select defaultValue="23">
                        <SelectTrigger className="col-span-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="6">6%</SelectItem>
                          <SelectItem value="13">13%</SelectItem>
                          <SelectItem value="23">23%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="col-span-1">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>Criar Fatura</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Fatura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        A carregar faturas...
                      </TableCell>
                    </TableRow>
                  ) : invoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Ainda não existem faturas. Crie a primeira fatura acima.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.series}/{invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.client_name}</p>
                            <p className="text-sm text-muted-foreground">{invoice.nif_cliente}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.issue_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{Number(invoice.total_amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.payment_status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Series Tab */}
        <TabsContent value="series" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestão de Séries de Faturação
              </CardTitle>
              <CardDescription>
                Configure diferentes séries para diferentes tipos de documentos ou propriedades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Série
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Último Número</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceSeries?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma série configurada. Crie a primeira série acima.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoiceSeries?.map((series) => (
                      <TableRow key={series.id}>
                        <TableCell className="font-mono font-medium">{series.series_code}</TableCell>
                        <TableCell>{series.series_name}</TableCell>
                        <TableCell>{series.year}</TableCell>
                        <TableCell>{series.current_number}</TableCell>
                        <TableCell>
                          <Badge variant={series.is_active ? "default" : "secondary"}>
                            {series.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAF-T Tab */}
        <TabsContent value="saft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submissão SAF-T
              </CardTitle>
              <CardDescription>
                Gere e submeta automaticamente os ficheiros SAF-T para a Autoridade Tributária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar SAF-T
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Data de Geração</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data de Submissão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saftSubmissions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma submissão SAF-T registada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    saftSubmissions?.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.month}/{submission.year}
                        </TableCell>
                        <TableCell>
                          {format(new Date(submission.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={submission.status === "submitted" ? "default" : "secondary"}>
                            {submission.status === "submitted" ? "Submetido" : 
                             submission.status === "pending" ? "Pendente" : submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.submitted_at 
                            ? format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm")
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Conta Corrente Global
              </CardTitle>
              <CardDescription>
                Visão geral de todos os movimentos financeiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Montante</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum movimento registado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.transaction_type}</Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {Number(transaction.amount) >= 0 ? "+" : ""}€{Number(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          €{Number(transaction.balance).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Faturacao;
