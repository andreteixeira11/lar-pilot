import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, startOfMonth, endOfMonth, subMonths, differenceInDays, startOfYear, endOfYear } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Building2, 
  Euro, 
  Calendar, 
  Users, 
  TrendingUp, 
  BedDouble, 
  Percent,
  ArrowRight,
  Eye,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OverviewCalendar } from "@/components/overview/OverviewCalendar";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const OverviewDashboard = () => {
  const navigate = useNavigate();
  const { properties, setSelectedPropertyId } = useProperty();
  const { reservas } = useReserva();
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [revenuePropertyFilter, setRevenuePropertyFilter] = useState<string>("all");
  
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);

  // Fetch pending fiscal tasks across all properties
  const { data: allFiscalTasks } = useQuery({
    queryKey: ["fiscal-tasks-overview", properties.map(p => p.id)],
    queryFn: async () => {
      if (properties.length === 0) return [];
      const { data, error } = await supabase
        .from("fiscal_tasks")
        .select("*")
        .in("property_id", properties.map(p => p.id))
        .eq("concluida", false)
        .order("prazo", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: properties.length > 0,
  });

  // Calculate consolidated metrics across ALL properties
  const allPropertyIds = properties.map(p => p.id);
  
  // Current month metrics
  const currentMonthReservations = reservas.filter((r) => {
    const checkIn = new Date(r.checkIn);
    return (
      allPropertyIds.includes(r.propertyId) &&
      r.status === "confirmada" &&
      isAfter(checkIn, monthStart) &&
      isBefore(checkIn, monthEnd)
    );
  });

  const totalMonthlyRevenue = currentMonthReservations.reduce((total, r) => total + (r.valor || 0), 0);
  const totalMonthlyNights = currentMonthReservations.reduce((total, r) => total + (r.noites || 0), 0);
  const totalMonthlyGuests = currentMonthReservations.reduce((total, r) => total + (r.nrHospedes || 0), 0);
  const totalMonthlyReservations = currentMonthReservations.length;

  // Year metrics
  const yearReservations = reservas.filter((r) => {
    const checkIn = new Date(r.checkIn);
    return (
      allPropertyIds.includes(r.propertyId) &&
      r.status === "confirmada" &&
      isAfter(checkIn, yearStart) &&
      isBefore(checkIn, yearEnd)
    );
  });
  const totalYearlyRevenue = yearReservations.reduce((total, r) => total + (r.valor || 0), 0);

  // Average occupancy rate
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const avgOccupancy = properties.length > 0 
    ? ((totalMonthlyNights / (daysInMonth * properties.length)) * 100).toFixed(0) 
    : 0;

  // Average daily rate
  const avgDailyRate = totalMonthlyNights > 0 
    ? (totalMonthlyRevenue / totalMonthlyNights).toFixed(2) 
    : 0;


  // Revenue trend last 6 months - with property filter
  const revenueChartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(today, 5 - i);
    const monthStartDate = startOfMonth(month);
    const monthEndDate = endOfMonth(month);

    const propertyIdsToFilter = revenuePropertyFilter === "all" 
      ? allPropertyIds 
      : [revenuePropertyFilter];

    const monthReservations = reservas.filter((r) => {
      const checkIn = new Date(r.checkIn);
      return (
        propertyIdsToFilter.includes(r.propertyId) &&
        r.status === "confirmada" &&
        isAfter(checkIn, monthStartDate) &&
        isBefore(checkIn, monthEndDate)
      );
    });

    const revenue = monthReservations.reduce((total, r) => total + (r.valor || 0), 0);
    const nights = monthReservations.reduce((total, r) => total + (r.noites || 0), 0);

    return {
      name: format(month, "MMM", { locale: pt }),
      faturacao: revenue,
      noites: nights,
    };
  });

  // Calculate per-property metrics for list
  const propertyMetrics = properties.map(property => {
    const propertyReservations = reservas.filter(r => r.propertyId === property.id);
    const currentMonthPropReservations = propertyReservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return r.status === "confirmada" && isAfter(checkIn, monthStart) && isBefore(checkIn, monthEnd);
    });
    
    const monthRevenue = currentMonthPropReservations.reduce((total, r) => total + (r.valor || 0), 0);
    const monthNights = currentMonthPropReservations.reduce((total, r) => total + (r.noites || 0), 0);
    const occupancy = daysInMonth > 0 ? ((monthNights / daysInMonth) * 100).toFixed(0) : 0;
    
    // Next check-in
    const nextReservation = propertyReservations
      .filter(r => isAfter(new Date(r.checkIn), today))
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];

    return {
      ...property,
      monthRevenue,
      monthNights,
      occupancy: Number(occupancy),
      nextCheckIn: nextReservation?.checkIn,
      nextGuest: nextReservation?.hospede,
      reservationCount: currentMonthPropReservations.length,
    };
  });

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    navigate("/dashboard");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Visão Geral do Negócio"
        description="Métricas consolidadas de todas as propriedades"
      />

      {/* Consolidated KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Propriedades</p>
              <p className="text-xl font-bold">{properties.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground">Faturação Mês</p>
              <p className="text-xl font-bold text-green-600">€{totalMonthlyRevenue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground">Faturação Ano</p>
              <p className="text-xl font-bold">€{totalYearlyRevenue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">Ocupação Média</p>
              <p className="text-xl font-bold">{avgOccupancy}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground">Reservas Mês</p>
              <p className="text-xl font-bold">{totalMonthlyReservations}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-xs text-muted-foreground">Hóspedes Mês</p>
              <p className="text-xl font-bold">{totalMonthlyGuests}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Evolução Faturação
              </CardTitle>
              <Select value={revenuePropertyFilter} onValueChange={setRevenuePropertyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as propriedades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as propriedades</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-6 px-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toFixed(2)}`, "Faturação"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="faturacao" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorFaturacao)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Calendar for all properties */}
        <OverviewCalendar properties={properties} reservas={reservas} />
      </div>

      {/* Properties List */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Propriedades
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddProperty(true)}>
            + Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma propriedade</h3>
              <p className="text-muted-foreground mb-4">
                Adicione a sua primeira propriedade para começar
              </p>
              <Button onClick={() => setShowAddProperty(true)}>
                Adicionar Propriedade
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyMetrics.map((property) => (
                <div 
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{property.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {property.region === 'madeira' ? 'Madeira' : 'Continental'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-8">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <p className="text-xs text-muted-foreground">Faturação</p>
                          <p className="font-semibold text-green-600">€{property.monthRevenue.toFixed(0)}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Receita total de reservas confirmadas no mês atual</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <p className="text-xs text-muted-foreground">Ocupação</p>
                          <p className="font-semibold">{property.occupancy}%</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentagem de noites ocupadas em relação ao total de dias do mês</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <p className="text-xs text-muted-foreground">Reservas</p>
                          <p className="font-semibold">{property.reservationCount}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Número de reservas confirmadas com check-in no mês atual</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-center min-w-[120px]">
                      <p className="text-xs text-muted-foreground">Próx. Check-in</p>
                      {property.nextCheckIn ? (
                        <p className="font-semibold text-sm">
                          {format(new Date(property.nextCheckIn), "dd MMM", { locale: pt })}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm">-</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      {allFiscalTasks && allFiscalTasks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tarefas Fiscais Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allFiscalTasks.slice(0, 5).map((task) => {
                const property = properties.find(p => p.id === task.property_id);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {property?.name} • Prazo: {task.prazo}
                      </p>
                    </div>
                    <Badge 
                      variant={task.prioridade === 'alta' ? 'destructive' : 'secondary'}
                    >
                      {task.prioridade}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <AddPropertyDialog open={showAddProperty} onOpenChange={setShowAddProperty} />
    </div>
  );
};

export default OverviewDashboard;
