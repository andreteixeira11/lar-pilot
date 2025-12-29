import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Euro,
  Users,
  CreditCard,
  TrendingUp,
  Search,
  Ban,
  CheckCircle,
  FileText,
  AlertTriangle,
  Crown,
  Building2,
  Calendar,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#247d7f", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all users with subscription info
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-sales-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all payments
  const { data: payments } = useQuery({
    queryKey: ["admin-sales-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate sales statistics
  const salesStats = {
    totalRevenue: payments?.filter(p => p.payment_status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    pendingRevenue: payments?.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    totalUsers: users?.length || 0,
    activeSubscriptions: users?.filter(u => u.subscription_status === "active").length || 0,
    blockedUsers: users?.filter(u => u.subscription_status === "blocked").length || 0,
  };

  // Plan distribution
  const planDistribution = users?.reduce((acc, user) => {
    const plan = user.subscription_plan || "free";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const planChartData = Object.entries(planDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Monthly revenue
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthPayments = payments?.filter(p => {
      const paymentDate = new Date(p.created_at);
      return paymentDate >= monthStart && paymentDate <= monthEnd && p.payment_status === "completed";
    }) || [];

    return {
      name: format(monthDate, "MMM", { locale: pt }),
      receita: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    };
  });

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.nif?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || user.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Block/Unblock user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, block }: { userId: string; block: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: block ? "blocked" : "active" })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { block }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sales-users"] });
      toast({
        title: block ? "Utilizador bloqueado" : "Utilizador desbloqueado",
        description: block ? "O utilizador já não tem acesso à plataforma." : "O utilizador pode agora aceder à plataforma.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estado do utilizador.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const getPlanBadgeVariant = (plan: string | null): "default" | "secondary" | "outline" => {
    switch (plan) {
      case "premium": return "default";
      case "pro": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "blocked":
        return <Badge variant="destructive">Bloqueado</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Inativo</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Gestão de Vendas"
        description="Visão geral das vendas, utilizadores e subscrições"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(salesStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(salesStats.pendingRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilizadores</p>
                <p className="text-xl font-bold">{salesStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscrições Ativas</p>
                <p className="text-xl font-bold">{salesStats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
                <p className="text-xl font-bold text-red-600">{salesStats.blockedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilizadores
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <Crown className="h-4 w-4" />
            Planos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-green-600" />
                  Receita Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `€${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Receita"]}
                      />
                      <Bar dataKey="receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Distribuição de Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Utilizadores</CardTitle>
              <CardDescription>Gerir estados de subscrição e bloqueios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome, telefone ou NIF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="blocked">Bloqueados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          A carregar...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum utilizador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name || "-"}</p>
                              <p className="text-xs text-muted-foreground">{user.phone || user.nif || "-"}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPlanBadgeVariant(user.subscription_plan)}>
                              {user.subscription_plan || "Free"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                          <TableCell>
                            {format(new Date(user.created_at), "dd/MM/yyyy", { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant={user.subscription_status === "blocked" ? "default" : "destructive"}
                                  size="sm"
                                >
                                  {user.subscription_status === "blocked" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Desbloquear
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-1" />
                                      Bloquear
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user.subscription_status === "blocked" ? "Desbloquear utilizador?" : "Bloquear utilizador?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {user.subscription_status === "blocked"
                                      ? "O utilizador poderá voltar a aceder à plataforma."
                                      : "O utilizador deixará de poder aceder à plataforma."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      blockUserMutation.mutate({
                                        userId: user.id,
                                        block: user.subscription_status !== "blocked",
                                      })
                                    }
                                  >
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices/Payments Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Todos os pagamentos de subscrições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPlanBadgeVariant(payment.subscription_plan)}>
                            {payment.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>
                          {payment.payment_status === "completed" ? (
                            <Badge className="bg-green-500">Pago</Badge>
                          ) : payment.payment_status === "pending" ? (
                            <Badge variant="secondary">Pendente</Badge>
                          ) : (
                            <Badge variant="destructive">Falhou</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!payments || payments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Sem pagamentos registados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(planDistribution).map(([plan, count]) => {
              const planPrices: Record<string, number> = {
                basic: 7,
                pro: 19,
                premium: 49,
                free: 0,
              };
              const monthlyRevenue = count * (planPrices[plan] || 0);
              
              return (
                <Card key={plan}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className={`h-5 w-5 ${plan === "premium" ? "text-yellow-500" : "text-primary"}`} />
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      {planPrices[plan] > 0 ? `€${planPrices[plan]}/mês` : "Gratuito"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Utilizadores</span>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Receita Mensal</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(monthlyRevenue)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSales;
