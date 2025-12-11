import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Euro, TrendingUp, Calendar, CreditCard } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

const COLORS = ["hsl(180, 53%, 32%)", "#FF5A5F", "#003580", "#10B981", "#F59E0B"];

const AdminDashboard = () => {
  // Fetch total users
  const { data: usersCount } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total properties
  const { data: propertiesCount } = useQuery({
    queryKey: ["admin-properties-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total reservations
  const { data: reservationsCount } = useQuery({
    queryKey: ["admin-reservations-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch payments/revenue
  const { data: paymentsData } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("payment_status", "completed");
      if (error) throw error;
      return data || [];
    },
  });

  const totalRevenue = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Fetch monthly user registrations for chart
  const { data: monthlyUsers } = useQuery({
    queryKey: ["admin-monthly-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at");
      if (error) throw error;

      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(now, 5 - i);
        return {
          name: format(month, "MMM", { locale: pt }),
          start: startOfMonth(month),
          end: endOfMonth(month),
          count: 0,
        };
      });

      data?.forEach((profile) => {
        const createdAt = new Date(profile.created_at);
        const monthIndex = months.findIndex(
          (m) => createdAt >= m.start && createdAt <= m.end
        );
        if (monthIndex !== -1) {
          months[monthIndex].count++;
        }
      });

      return months.map((m) => ({ name: m.name, utilizadores: m.count }));
    },
  });

  // Fetch subscription plan distribution
  const { data: planDistribution } = useQuery({
    queryKey: ["admin-plan-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("subscription_plan");
      if (error) throw error;

      const planCounts: Record<string, number> = {};
      data?.forEach((profile) => {
        const plan = profile.subscription_plan || "free";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });

      return Object.entries(planCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Painel de Administração"
        description="Visão geral da plataforma"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilizadores</p>
                <p className="text-2xl font-bold">{usersCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Propriedades</p>
                <p className="text-2xl font-bold">{propertiesCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reservas</p>
                <p className="text-2xl font-bold">{reservationsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* User Registrations Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Novos Utilizadores por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUsers || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="utilizadores" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {planDistribution && planDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de planos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
