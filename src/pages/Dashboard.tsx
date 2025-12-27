import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, startOfMonth, endOfMonth, subMonths, differenceInDays, startOfYear, endOfYear } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar, TrendingUp, AlertTriangle, Euro, User, ArrowRight, BedDouble, Percent, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

const COLORS = ["hsl(var(--primary))", "#FF5A5F", "#003580", "#10B981"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();

  // Get fiscal tasks
  const { data: fiscalTasks } = useQuery({
    queryKey: ["fiscal-tasks-dashboard", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];

      const { data, error } = await supabase
        .from("fiscal_tasks")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .eq("concluida", false)
        .order("prazo", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPropertyId,
  });

  // Get next 3 reservations
  const today = new Date();
  const nextReservations = reservas
    .filter((r) => r.propertyId === selectedPropertyId && isAfter(new Date(r.checkIn), today))
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 3);

  // Calculate current month stats
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const currentMonthReservations = reservas.filter((r) => {
    const checkIn = new Date(r.checkIn);
    return (
      r.propertyId === selectedPropertyId &&
      r.status === "confirmada" &&
      isAfter(checkIn, monthStart) &&
      isBefore(checkIn, monthEnd)
    );
  });

  const monthlyRevenue = currentMonthReservations.reduce((total, r) => total + (r.valor || 0), 0);
  const monthlyNights = currentMonthReservations.reduce((total, r) => total + (r.noites || 0), 0);
  const monthlyGuests = currentMonthReservations.reduce((total, r) => total + (r.nrHospedes || 0), 0);
  const monthlyReservationCount = currentMonthReservations.length;

  // Calculate occupancy rate for current month
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const occupancyRate = daysInMonth > 0 ? ((monthlyNights / daysInMonth) * 100).toFixed(0) : 0;

  // Calculate average daily rate (ADR)
  const avgDailyRate = monthlyNights > 0 ? (monthlyRevenue / monthlyNights).toFixed(2) : 0;

  // Calculate year-to-date stats
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearReservations = reservas.filter((r) => {
    const checkIn = new Date(r.checkIn);
    return (
      r.propertyId === selectedPropertyId &&
      r.status === "confirmada" &&
      isAfter(checkIn, yearStart) &&
      isBefore(checkIn, yearEnd)
    );
  });
  const yearlyRevenue = yearReservations.reduce((total, r) => total + (r.valor || 0), 0);

  // Calculate revenue data for the last 6 months
  const revenueChartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(today, 5 - i);
    const monthStartDate = startOfMonth(month);
    const monthEndDate = endOfMonth(month);

    const monthReservations = reservas.filter((r) => {
      const checkIn = new Date(r.checkIn);
      return (
        r.propertyId === selectedPropertyId &&
        r.status === "confirmada" &&
        isAfter(checkIn, monthStartDate) &&
        isBefore(checkIn, monthEndDate)
      );
    });

    const revenue = monthReservations.reduce((total, r) => total + (r.valor || 0), 0);
    const nights = monthReservations.reduce((total, r) => total + (r.noites || 0), 0);
    const guests = monthReservations.reduce((total, r) => total + (r.nrHospedes || 0), 0);

    return {
      name: format(month, "MMM", { locale: pt }),
      faturacao: revenue,
      noites: nights,
      hospedes: guests,
    };
  });

  // Calculate revenue by platform for pie chart
  const revenueByPlatform = reservas
    .filter((r) => {
      const checkIn = new Date(r.checkIn);
      return (
        r.propertyId === selectedPropertyId &&
        r.status === "confirmada" &&
        isAfter(checkIn, subMonths(today, 6))
      );
    })
    .reduce((acc, r) => {
      const platform = r.plataforma || "Direto";
      acc[platform] = (acc[platform] || 0) + (r.valor || 0);
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(revenueByPlatform).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  // Calculate reservations by platform count
  const reservationsByPlatform = reservas
    .filter((r) => {
      const checkIn = new Date(r.checkIn);
      return (
        r.propertyId === selectedPropertyId &&
        r.status === "confirmada" &&
        isAfter(checkIn, subMonths(today, 6))
      );
    })
    .reduce((acc, r) => {
      const platform = r.plataforma || "Direto";
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const reservationsBarData = Object.entries(reservationsByPlatform).map(([name, value]) => ({
    name,
    reservas: value,
  }));

  if (!selectedProperty) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Dashboard da Propriedade"
          description="Selecione uma propriedade para ver os detalhes"
        />
        <div className="mt-8 text-center py-12">
          <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma propriedade selecionada</h3>
          <p className="text-muted-foreground mb-4">
            Use o seletor no topo para escolher uma propriedade
          </p>
          <Button onClick={() => navigate("/overview")} variant="outline">
            Voltar à Visão Geral
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={selectedProperty?.name || "Dashboard"}
          description="Detalhes e métricas da propriedade"
        />
        <Button variant="outline" onClick={() => navigate("/overview")}>
          ← Visão Geral
        </Button>
      </div>

      <div className="grid gap-6 mt-6">
        {/* Stats Cards - Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Euro className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Faturação Mês</p>
                <p className="text-xl font-bold text-primary">€{monthlyRevenue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground">Faturação Ano</p>
                <p className="text-xl font-bold">€{yearlyRevenue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                  <BedDouble className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground">Noites Mês</p>
                <p className="text-xl font-bold">{monthlyNights}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground">Ocupação</p>
                <p className="text-xl font-bold">{occupancyRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground">Hóspedes Mês</p>
                <p className="text-xl font-bold">{monthlyGuests}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-xs text-muted-foreground">Reservas Mês</p>
                <p className="text-xl font-bold">{monthlyReservationCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ADR Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tarifa Média Diária (ADR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Euro className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">€{avgDailyRate}</p>
                  <p className="text-sm text-muted-foreground">por noite (este mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evolução de Noites Ocupadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorNoites" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} noites`, "Noites"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="noites" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorNoites)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Faturação Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
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
                      formatter={(value: number) => [`€${value.toFixed(2)}`, "Faturação"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="faturacao" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                Receita por Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
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
                    Sem dados de reservas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations by Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Reservas por Plataforma (últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {reservationsBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reservationsBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} reservas`, "Reservas"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="reservas" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de reservas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Reservations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximas Reservas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reservas")}>
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {nextReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma reserva futura
                </p>
              ) : (
                <div className="space-y-4">
                  {nextReservations.map((reserva) => (
                    <div
                      key={reserva.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate("/reservas")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{reserva.hospede}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reserva.checkIn), "dd MMM", { locale: pt })} - {reserva.noites} noites
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{reserva.valor}</p>
                        <Badge variant="outline" className="text-xs">
                          {reserva.plataforma}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fiscal Obligations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Obrigações Fiscais Pendentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/calendario-fiscal")}>
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {!fiscalTasks || fiscalTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma obrigação pendente
                </p>
              ) : (
                <div className="space-y-3">
                  {fiscalTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.titulo}</p>
                        <p className="text-sm text-muted-foreground">{task.descricao}</p>
                      </div>
                      <Badge
                        variant={task.prioridade === "alta" ? "destructive" : "secondary"}
                      >
                        {task.prazo}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;