import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  CalendarDays,
  Percent,
  Wallet,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt, enUS } from "date-fns/locale";

interface KPIData {
  totalRevenue: number;
  totalReservations: number;
  occupancyRate: number;
  estimatedProfit: number;
  commissionRate: number;
}

interface ChartData {
  month: string;
  revenue: number;
}

export default function OwnerDashboard() {
  const { owner } = useOwnerAuth();
  const { t, language, formatCurrency } = useOwnerLanguage();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [kpis, setKpis] = useState<KPIData>({
    totalRevenue: 0,
    totalReservations: 0,
    occupancyRate: 0,
    estimatedProfit: 0,
    commissionRate: 15,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyStatus, setPropertyStatus] = useState<"normal" | "attention">("normal");

  const dateLocale = language === "pt" ? pt : enUS;
  
  const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: format(new Date(2024, i, 1), "MMMM", { locale: dateLocale }),
  }));

  useEffect(() => {
    if (owner?.propertyId) {
      loadDashboardData();
    }
  }, [owner?.propertyId, selectedYear, selectedMonth]);

  const getDateRange = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1;
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    return { startDate, endDate };
  };

  const loadDashboardData = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const { startDate, endDate } = getDateRange();

      // Get reservations for the period
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", owner.propertyId)
        .gte("check_in", startDate.toISOString().split("T")[0])
        .lte("check_in", endDate.toISOString().split("T")[0]);

      if (error) {
        console.error("Error loading reservations:", error);
        return;
      }

      // Get owner's commission rate
      const { data: ownerData } = await supabase
        .from("property_owners")
        .select("commission_rate")
        .eq("id", owner.ownerId)
        .single();

      const commissionRate = ownerData?.commission_rate || 15;

      // Calculate KPIs
      const totalRevenue = reservations?.reduce(
        (sum, r) => sum + (r.total_price || 0),
        0
      ) || 0;
      const totalReservations = reservations?.length || 0;

      // Calculate occupancy (days booked / days in period)
      const daysInPeriod = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysBooked = reservations?.reduce(
        (sum, r) => sum + (r.num_nights || 0),
        0
      ) || 0;
      const occupancyRate = Math.min(
        100,
        Math.round((daysBooked / daysInPeriod) * 100)
      );

      // Calculate profit (after commission)
      const managerCommission = totalRevenue * (commissionRate / 100);
      const estimatedProfit = totalRevenue - managerCommission;

      // Determine property status
      const hasRecentReservations = totalReservations > 0;
      setPropertyStatus(hasRecentReservations ? "normal" : "attention");

      setKpis({
        totalRevenue,
        totalReservations,
        occupancyRate,
        estimatedProfit,
        commissionRate,
      });

      // Build chart data for last 6 months
      const chartMonths: ChartData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const { data: monthReservations } = await supabase
          .from("reservations")
          .select("total_price")
          .eq("property_id", owner.propertyId)
          .gte("check_in", monthStart.toISOString().split("T")[0])
          .lte("check_in", monthEnd.toISOString().split("T")[0]);

        const monthRevenue = monthReservations?.reduce(
          (sum, r) => sum + (r.total_price || 0),
          0
        ) || 0;

        chartMonths.push({
          month: format(monthDate, "MMM", { locale: dateLocale }),
          revenue: monthRevenue,
        });
      }

      setChartData(chartMonths);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {owner?.propertyName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {propertyStatus === "normal" ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("dashboard.statusNormal")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t("dashboard.statusAttention")}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.totalRevenue")}
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatCurrency(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.grossValue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.reservations")}
            </CardTitle>
            <CalendarDays className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : kpis.totalReservations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.totalReservations")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.occupancyRate")}
            </CardTitle>
            <Percent className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${kpis.occupancyRate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.nightsOccupied")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              {t("dashboard.estimatedProfit")}
            </CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? "..." : formatCurrency(kpis.estimatedProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.afterCommission")} {kpis.commissionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.revenueEvolution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("dashboard.loading")}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("dashboard.noData")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), t("dashboard.revenue")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
