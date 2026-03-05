import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthlyData {
  month: string;
  revenue: number;
  reservations: number;
  nights: number;
}

interface YearlyStats {
  totalRevenue: number;
  totalReservations: number;
  totalNights: number;
  averageNightValue: number;
  occupancyRate: number;
}

const CHART_COLORS = [
  "hsl(180, 53%, 32%)",
  "hsl(180, 53%, 45%)",
  "hsl(180, 53%, 60%)",
  "hsl(210, 85%, 45%)",
];

export default function OwnerRelatorios() {
  const { owner } = useOwnerAuth();
  const { t, language } = useOwnerLanguage();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([new Date().getFullYear().toString()]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats>({
    totalRevenue: 0,
    totalReservations: 0,
    totalNights: 0,
    averageNightValue: 0,
    occupancyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const dateLocale = language === "pt" ? pt : enUS;

  useEffect(() => {
    if (owner?.propertyId) {
      loadAvailableYears();
    }
  }, [owner?.propertyId]);

  useEffect(() => {
    if (owner?.propertyId) {
      loadReportData();
    }
  }, [owner?.propertyId, selectedYear]);

  const loadAvailableYears = async () => {
    if (!owner?.propertyId) return;
    const { data } = await supabase
      .from("reservations")
      .select("check_in")
      .eq("property_id", owner.propertyId);
    if (data && data.length > 0) {
      const yearsSet = new Set<string>();
      data.forEach(r => yearsSet.add(new Date(r.check_in).getFullYear().toString()));
      yearsSet.add(new Date().getFullYear().toString());
      setAvailableYears(Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a)));
    }
  };

  const loadReportData = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const yearNum = parseInt(selectedYear);
      const yearStart = new Date(yearNum, 0, 1);
      const yearEnd = new Date(yearNum, 11, 31);

      // Get all reservations for the year
      const { data: reservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", owner.propertyId)
        .gte("check_in", yearStart.toISOString().split("T")[0])
        .lte("check_in", yearEnd.toISOString().split("T")[0])
        .in("status", ["confirmada", "concluida"]);

      // Build monthly data
      const months: MonthlyData[] = [];
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(yearNum, i, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthReservations = reservations?.filter((r) => {
          const checkIn = new Date(r.check_in);
          return checkIn >= monthStart && checkIn <= monthEnd;
        }) || [];

        months.push({
          month: format(monthDate, "MMM", { locale: dateLocale }),
          revenue: monthReservations.reduce((sum, r) => sum + (r.total_price || 0), 0),
          reservations: monthReservations.length,
          nights: monthReservations.reduce((sum, r) => sum + (r.num_nights || 0), 0),
        });
      }

      setMonthlyData(months);

      // Calculate yearly stats
      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
      const totalReservations = reservations?.length || 0;
      const totalNights = reservations?.reduce((sum, r) => sum + (r.num_nights || 0), 0) || 0;
      const averageNightValue = totalNights > 0 ? totalRevenue / totalNights : 0;
      
      // Calculate occupancy for past months only
      const today = new Date();
      const daysPassed = Math.ceil(
        (today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const occupancyRate = daysPassed > 0 ? Math.min(100, Math.round((totalNights / daysPassed) * 100)) : 0;

      setYearlyStats({
        totalRevenue,
        totalReservations,
        totalNights,
        averageNightValue,
        occupancyRate,
      });
    } catch (err) {
      console.error("Report data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-PT" : "en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const downloadMonthlyReport = () => {
    const doc = new jsPDF();
    const currentMonth = format(new Date(), "MMMM yyyy", { locale: dateLocale });

    doc.setFontSize(20);
    doc.text(language === "pt" ? "Relatório Mensal" : "Monthly Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`${language === "pt" ? "Propriedade" : "Property"}: ${owner?.propertyName}`, 20, 30);
    doc.text(`${language === "pt" ? "Período" : "Period"}: ${currentMonth}`, 20, 38);

    const currentMonthData = monthlyData[new Date().getMonth()];

    autoTable(doc, {
      startY: 50,
      head: [[language === "pt" ? "Métrica" : "Metric", language === "pt" ? "Valor" : "Value"]],
      body: [
        [t("dashboard.totalRevenue"), formatCurrency(currentMonthData?.revenue || 0)],
        [language === "pt" ? "Número de Reservas" : "Number of Reservations", String(currentMonthData?.reservations || 0)],
        [language === "pt" ? "Total de Noites" : "Total Nights", String(currentMonthData?.nights || 0)],
        [language === "pt" ? "Valor Médio/Noite" : "Avg Value/Night", formatCurrency(currentMonthData?.nights ? currentMonthData.revenue / currentMonthData.nights : 0)],
      ],
      theme: "grid",
      headStyles: { fillColor: [36, 125, 127] },
    });

    doc.save(`${language === "pt" ? "relatorio-mensal" : "monthly-report"}-${format(new Date(), "yyyy-MM")}.pdf`);
  };

  const downloadYearlyReport = () => {
    const doc = new jsPDF();
    const currentYear = new Date().getFullYear();

    doc.setFontSize(20);
    doc.text(language === "pt" ? "Relatório Anual" : "Annual Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`${language === "pt" ? "Propriedade" : "Property"}: ${owner?.propertyName}`, 20, 30);
    doc.text(`${language === "pt" ? "Ano" : "Year"}: ${currentYear}`, 20, 38);

    autoTable(doc, {
      startY: 50,
      head: [[language === "pt" ? "Métrica" : "Metric", language === "pt" ? "Valor" : "Value"]],
      body: [
        [language === "pt" ? "Receita Total Anual" : "Total Annual Revenue", formatCurrency(yearlyStats.totalRevenue)],
        [language === "pt" ? "Total de Reservas" : "Total Reservations", String(yearlyStats.totalReservations)],
        [language === "pt" ? "Total de Noites" : "Total Nights", String(yearlyStats.totalNights)],
        [language === "pt" ? "Valor Médio/Noite" : "Avg Value/Night", formatCurrency(yearlyStats.averageNightValue)],
        [t("dashboard.occupancyRate"), `${yearlyStats.occupancyRate}%`],
      ],
      theme: "grid",
      headStyles: { fillColor: [36, 125, 127] },
    });

    // Monthly breakdown
    const currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text(language === "pt" ? "Evolução Mensal" : "Monthly Evolution", 20, currentY);

    autoTable(doc, {
      startY: currentY + 10,
      head: [[language === "pt" ? "Mês" : "Month", language === "pt" ? "Receita" : "Revenue", language === "pt" ? "Reservas" : "Reservations", language === "pt" ? "Noites" : "Nights"]],
      body: monthlyData.map((m) => [
        m.month,
        formatCurrency(m.revenue),
        String(m.reservations),
        String(m.nights),
      ]),
      theme: "striped",
      headStyles: { fillColor: [100, 100, 100] },
    });

    doc.save(`${language === "pt" ? "relatorio-anual" : "annual-report"}-${currentYear}.pdf`);
  };

  // Pie chart data for revenue distribution
  const pieData = monthlyData
    .filter((m) => m.revenue > 0)
    .slice(-4)
    .map((m, i) => ({
      name: m.month,
      value: m.revenue,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("reports.subtitle")}
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder={language === "pt" ? "Ano" : "Year"} />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-64">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{language === "pt" ? "Relatório Mensal" : "Monthly Report"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), "MMMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <Button onClick={downloadMonthlyReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-64">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{language === "pt" ? "Relatório Anual" : "Annual Report"}</p>
                  <p className="text-sm text-muted-foreground">{new Date().getFullYear()}</p>
                </div>
              </div>
              <Button onClick={downloadYearlyReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(yearlyStats.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">{language === "pt" ? "Receita Anual" : "Annual Revenue"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.totalReservations}</p>
            <p className="text-sm text-muted-foreground">{t("reservations.title")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.totalNights}</p>
            <p className="text-sm text-muted-foreground">{t("reservations.nights")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(yearlyStats.averageNightValue)}</p>
            <p className="text-sm text-muted-foreground">{language === "pt" ? "Valor/Noite" : "Value/Night"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.occupancyRate}%</p>
            <p className="text-sm text-muted-foreground">{language === "pt" ? "Ocupação" : "Occupancy"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{language === "pt" ? "Receita Mensal" : "Monthly Revenue"}</CardTitle>
            <CardDescription>{language === "pt" ? "Evolução da receita ao longo do ano" : "Revenue evolution throughout the year"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "pt" ? "Distribuição" : "Distribution"}</CardTitle>
            <CardDescription>{language === "pt" ? "Últimos meses com receita" : "Recent months with revenue"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("reports.noData")}</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: €${value.toFixed(0)}`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
