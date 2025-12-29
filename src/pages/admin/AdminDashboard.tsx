import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Euro, TrendingUp, Calendar, CreditCard, Crown, Award, BarChart3 } from "lucide-react";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPDFExport } from "@/components/admin/AdminPDFExport";

const COLORS = ["hsl(180, 53%, 32%)", "#FF5A5F", "#003580", "#10B981", "#F59E0B", "#8B5CF6"];

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

  // Fetch most sold plans (from payments)
  const { data: planSales } = useQuery({
    queryKey: ["admin-plan-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("subscription_plan, amount")
        .eq("payment_status", "completed");
      if (error) throw error;

      const planStats: Record<string, { count: number; revenue: number }> = {};
      data?.forEach((payment) => {
        const plan = payment.subscription_plan || "unknown";
        if (!planStats[plan]) {
          planStats[plan] = { count: 0, revenue: 0 };
        }
        planStats[plan].count++;
        planStats[plan].revenue += Number(payment.amount);
      });

      return Object.entries(planStats)
        .map(([name, stats]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          vendas: stats.count,
          receita: stats.revenue,
        }))
        .sort((a, b) => b.vendas - a.vendas);
    },
  });

  // Fetch monthly revenue
  const { data: monthlyRevenue } = useQuery({
    queryKey: ["admin-monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("created_at, amount")
        .eq("payment_status", "completed");
      if (error) throw error;

      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(now, 5 - i);
        return {
          name: format(month, "MMM", { locale: pt }),
          start: startOfMonth(month),
          end: endOfMonth(month),
          revenue: 0,
        };
      });

      data?.forEach((payment) => {
        const createdAt = new Date(payment.created_at);
        const monthIndex = months.findIndex(
          (m) => createdAt >= m.start && createdAt <= m.end
        );
        if (monthIndex !== -1) {
          months[monthIndex].revenue += Number(payment.amount);
        }
      });

      return months.map((m) => ({ name: m.name, receita: m.revenue }));
    },
  });

  // Fetch top properties by revenue
  const { data: topProperties } = useQuery({
    queryKey: ["admin-top-properties"],
    queryFn: async () => {
      const { data: reservations, error: resError } = await supabase
        .from("reservations")
        .select("property_id, total_price");
      if (resError) throw resError;

      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id, name, user_id");
      if (propError) throw propError;

      const propertyRevenue: Record<string, { name: string; revenue: number; reservations: number }> = {};
      
      reservations?.forEach((res) => {
        const propId = res.property_id;
        const property = properties?.find(p => p.id === propId);
        if (property) {
          if (!propertyRevenue[propId]) {
            propertyRevenue[propId] = { 
              name: property.name, 
              revenue: 0, 
              reservations: 0 
            };
          }
          propertyRevenue[propId].revenue += Number(res.total_price) || 0;
          propertyRevenue[propId].reservations++;
        }
      });

      return Object.entries(propertyRevenue)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    },
  });

  // Fetch reservation trends
  const { data: reservationTrends } = useQuery({
    queryKey: ["admin-reservation-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("created_at, booking_source");
      if (error) throw error;

      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(now, 5 - i);
        return {
          name: format(month, "MMM", { locale: pt }),
          start: startOfMonth(month),
          end: endOfMonth(month),
          total: 0,
          diretas: 0,
          airbnb: 0,
          booking: 0,
        };
      });

      data?.forEach((reservation) => {
        const createdAt = new Date(reservation.created_at);
        const monthIndex = months.findIndex(
          (m) => createdAt >= m.start && createdAt <= m.end
        );
        if (monthIndex !== -1) {
          months[monthIndex].total++;
          const source = (reservation.booking_source || "").toLowerCase();
          if (source.includes("airbnb")) {
            months[monthIndex].airbnb++;
          } else if (source.includes("booking") || source.includes("booking.com")) {
            months[monthIndex].booking++;
          } else {
            months[monthIndex].diretas++;
          }
        }
      });

      return months.map((m) => ({
        name: m.name,
        total: m.total,
        diretas: m.diretas,
        airbnb: m.airbnb,
        booking: m.booking,
      }));
    },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Painel de Administração"
          description="Visão geral da plataforma"
        />
        <AdminPDFExport 
          data={{
            usersCount: usersCount || 0,
            propertiesCount: propertiesCount || 0,
            reservationsCount: reservationsCount || 0,
            totalRevenue,
            planDistribution,
            planSales,
            topProperties,
            monthlyUsers,
            monthlyRevenue,
          }}
        />
      </div>

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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <Crown className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="properties" className="gap-2">
            <Award className="h-4 w-4" />
            Top Propriedades
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Reservas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-green-600" />
                  Receita Mensal (Subscrições)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue || []}>
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
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receita" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Distribuição de Planos Ativos
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

            {/* Plan Sales Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Planos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {planSales && planSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={planSales} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs fill-muted-foreground" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          className="text-xs fill-muted-foreground"
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [
                            name === "receita" ? `€${value.toFixed(2)}` : value,
                            name === "receita" ? "Receita" : "Vendas"
                          ]}
                        />
                        <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Sem vendas registadas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Vendas por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead className="text-center">Vendas</TableHead>
                    <TableHead className="text-right">Receita Total</TableHead>
                    <TableHead className="text-right">Média por Venda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planSales?.map((plan) => (
                    <TableRow key={plan.name}>
                      <TableCell>
                        <Badge variant={plan.name.toLowerCase() === "premium" ? "default" : "secondary"}>
                          {plan.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{plan.vendas}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        €{plan.receita.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        €{(plan.receita / plan.vendas).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!planSales || planSales.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Sem vendas registadas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top 10 Propriedades por Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] mb-6">
                {topProperties && topProperties.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProperties} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        type="number" 
                        className="text-xs fill-muted-foreground"
                        tickFormatter={(value) => `€${value}`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        className="text-xs fill-muted-foreground"
                        width={150}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                      />
                      <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados de propriedades
                  </div>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Propriedade</TableHead>
                    <TableHead className="text-center">Reservas</TableHead>
                    <TableHead className="text-right">Receita Total</TableHead>
                    <TableHead className="text-right">Média por Reserva</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProperties?.map((property, index) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        {index < 3 ? (
                          <span className={`text-lg ${
                            index === 0 ? "text-yellow-500" : 
                            index === 1 ? "text-gray-400" : 
                            "text-amber-600"
                          }`}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell className="text-center">{property.reservations}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        €{property.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        €{(property.revenue / (property.reservations || 1)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!topProperties || topProperties.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Sem dados de propriedades
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Tendência de Reservas por Canal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {reservationTrends && reservationTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reservationTrends}>
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
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="diretas" 
                        stackId="1"
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.6}
                        name="Diretas"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="airbnb" 
                        stackId="1"
                        stroke="#FF5A5F" 
                        fill="#FF5A5F" 
                        fillOpacity={0.6}
                        name="Airbnb"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="booking" 
                        stackId="1"
                        stroke="#003580" 
                        fill="#003580" 
                        fillOpacity={0.6}
                        name="Booking.com"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados de reservas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reservas Diretas</p>
                    <p className="text-2xl font-bold">
                      {reservationTrends?.reduce((sum, m) => sum + m.diretas, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FF5A5F20" }}>
                    <img src="/logos/airbnb.svg" alt="Airbnb" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Airbnb</p>
                    <p className="text-2xl font-bold" style={{ color: "#FF5A5F" }}>
                      {reservationTrends?.reduce((sum, m) => sum + m.airbnb, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#00358020" }}>
                    <img src="/logos/booking.svg" alt="Booking.com" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Booking.com</p>
                    <p className="text-2xl font-bold" style={{ color: "#003580" }}>
                      {reservationTrends?.reduce((sum, m) => sum + m.booking, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
