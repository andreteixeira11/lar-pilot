import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Globe, 
  Monitor,
  Smartphone,
  Clock
} from "lucide-react";
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
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, subHours } from "date-fns";
import { pt } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";

const COLORS = ["hsl(180, 53%, 32%)", "#FF5A5F", "#003580", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState<string>("30");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const now = new Date();
  const last24Hours = subHours(now, 24);
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);
  const rangeStart = subDays(now, parseInt(dateRange));

  const viewsLast24h = analyticsData?.filter(a => new Date(a.created_at) >= last24Hours).length || 0;
  const viewsLast7d = analyticsData?.filter(a => new Date(a.created_at) >= last7Days).length || 0;
  const viewsLast30d = analyticsData?.filter(a => new Date(a.created_at) >= last30Days).length || 0;

  // Unique sessions
  const uniqueSessions24h = new Set(
    analyticsData?.filter(a => new Date(a.created_at) >= last24Hours).map(a => a.session_id)
  ).size;
  const uniqueSessions7d = new Set(
    analyticsData?.filter(a => new Date(a.created_at) >= last7Days).map(a => a.session_id)
  ).size;

  // Filter data by selected range
  const filteredData = analyticsData?.filter(a => new Date(a.created_at) >= rangeStart) || [];

  // Views by page
  const pageViews = filteredData.reduce((acc, item) => {
    const page = item.page_path || "/";
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageViews)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Daily views for selected range (max 30 points)
  const chartDays = Math.min(parseInt(dateRange), 30);
  const dailyViews = Array.from({ length: chartDays }, (_, i) => {
    const date = subDays(now, chartDays - 1 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const views = filteredData.filter(a => {
      const created = new Date(a.created_at);
      return created >= dayStart && created <= dayEnd;
    }).length;

    const uniqueVisitors = new Set(
      filteredData.filter(a => {
        const created = new Date(a.created_at);
        return created >= dayStart && created <= dayEnd;
      }).map(a => a.session_id)
    ).size;

    return {
      name: format(date, "dd MMM", { locale: pt }),
      views,
      visitantes: uniqueVisitors,
    };
  });

  // Device breakdown (simple detection from user agent)
  const deviceBreakdown = filteredData.reduce((acc, item) => {
    const ua = (item.user_agent || "").toLowerCase();
    let device = "Desktop";
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      device = "Mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet";
    }
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceBreakdown).map(([name, value]) => ({ name, value }));

  // Referrer breakdown
  const referrerBreakdown = filteredData.reduce((acc, item) => {
    let referrer = "Direto";
    if (item.referrer) {
      try {
        const url = new URL(item.referrer);
        referrer = url.hostname.replace("www.", "");
      } catch {
        referrer = item.referrer.slice(0, 30);
      }
    }
    acc[referrer] = (acc[referrer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrerData = Object.entries(referrerBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Hourly distribution for today
  const todayStart = startOfDay(now);
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
    const hourStart = new Date(todayStart);
    hourStart.setHours(hour);
    const hourEnd = new Date(todayStart);
    hourEnd.setHours(hour + 1);

    const views = filteredData.filter(a => {
      const created = new Date(a.created_at);
      return created >= hourStart && created < hourEnd;
    }).length;

    return {
      hour: `${hour}h`,
      views,
    };
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Estatísticas do Site"
          description="Análise de visitas e comportamento dos utilizadores"
        />
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Últimas 24 horas</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
                <p className="text-2xl font-bold">{viewsLast24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visitantes (24h)</p>
                <p className="text-2xl font-bold">{uniqueSessions24h}</p>
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
                <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
                <p className="text-2xl font-bold">{viewsLast7d}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
                <p className="text-2xl font-bold">{viewsLast30d}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Daily Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Visitas (últimos 14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyViews}>
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
                    dataKey="views"
                    name="Visualizações"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitantes"
                    name="Visitantes Únicos"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Distribuição Horária (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
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
                  <Bar dataKey="views" name="Visualizações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Origem do Tráfego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {referrerData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={referrerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name.slice(0, 15)} ${(percent * 100).toFixed(0)}%`}
                    >
                      {referrerData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Páginas Mais Visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {topPages.length > 0 ? (
                topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
                      <span className="text-sm truncate max-w-[150px]" title={page.page}>
                        {page.page}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{page.views}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Sem dados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
