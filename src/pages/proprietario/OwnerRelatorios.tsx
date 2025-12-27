import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
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
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats>({
    totalRevenue: 0,
    totalReservations: 0,
    totalNights: 0,
    averageNightValue: 0,
    occupancyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (owner?.propertyId) {
      loadReportData();
    }
  }, [owner?.propertyId]);

  const loadReportData = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);

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
        const monthDate = new Date(currentYear, i, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthReservations = reservations?.filter((r) => {
          const checkIn = new Date(r.check_in);
          return checkIn >= monthStart && checkIn <= monthEnd;
        }) || [];

        months.push({
          month: format(monthDate, "MMM", { locale: pt }),
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
      const monthsPassed = today.getMonth() + 1;
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
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const downloadMonthlyReport = () => {
    const doc = new jsPDF();
    const currentMonth = format(new Date(), "MMMM yyyy", { locale: pt });

    doc.setFontSize(20);
    doc.text("Relatório Mensal", 20, 20);
    doc.setFontSize(12);
    doc.text(`Propriedade: ${owner?.propertyName}`, 20, 30);
    doc.text(`Período: ${currentMonth}`, 20, 38);

    const currentMonthData = monthlyData[new Date().getMonth()];

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        ["Receita Total", formatCurrency(currentMonthData?.revenue || 0)],
        ["Número de Reservas", String(currentMonthData?.reservations || 0)],
        ["Total de Noites", String(currentMonthData?.nights || 0)],
        ["Valor Médio/Noite", formatCurrency(currentMonthData?.nights ? currentMonthData.revenue / currentMonthData.nights : 0)],
      ],
      theme: "grid",
      headStyles: { fillColor: [36, 125, 127] },
    });

    doc.save(`relatorio-mensal-${format(new Date(), "yyyy-MM")}.pdf`);
  };

  const downloadYearlyReport = () => {
    const doc = new jsPDF();
    const currentYear = new Date().getFullYear();

    doc.setFontSize(20);
    doc.text("Relatório Anual", 20, 20);
    doc.setFontSize(12);
    doc.text(`Propriedade: ${owner?.propertyName}`, 20, 30);
    doc.text(`Ano: ${currentYear}`, 20, 38);

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        ["Receita Total Anual", formatCurrency(yearlyStats.totalRevenue)],
        ["Total de Reservas", String(yearlyStats.totalReservations)],
        ["Total de Noites", String(yearlyStats.totalNights)],
        ["Valor Médio/Noite", formatCurrency(yearlyStats.averageNightValue)],
        ["Taxa de Ocupação", `${yearlyStats.occupancyRate}%`],
      ],
      theme: "grid",
      headStyles: { fillColor: [36, 125, 127] },
    });

    // Monthly breakdown
    const currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text("Evolução Mensal", 20, currentY);

    autoTable(doc, {
      startY: currentY + 10,
      head: [["Mês", "Receita", "Reservas", "Noites"]],
      body: monthlyData.map((m) => [
        m.month,
        formatCurrency(m.revenue),
        String(m.reservations),
        String(m.nights),
      ]),
      theme: "striped",
      headStyles: { fillColor: [100, 100, 100] },
    });

    doc.save(`relatorio-anual-${currentYear}.pdf`);
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Análise detalhada do desempenho da sua propriedade
        </p>
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
                  <p className="font-medium">Relatório Mensal</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), "MMMM yyyy", { locale: pt })}
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
                  <p className="font-medium">Relatório Anual</p>
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
            <p className="text-sm text-muted-foreground">Receita Anual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.totalReservations}</p>
            <p className="text-sm text-muted-foreground">Reservas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.totalNights}</p>
            <p className="text-sm text-muted-foreground">Noites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(yearlyStats.averageNightValue)}</p>
            <p className="text-sm text-muted-foreground">Valor/Noite</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{yearlyStats.occupancyRate}%</p>
            <p className="text-sm text-muted-foreground">Ocupação</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Evolução da receita ao longo do ano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  A carregar...
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
                      formatter={(value: number) => [formatCurrency(value), "Receita"]}
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
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>Últimos meses com receita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  A carregar...
                </div>
              ) : pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sem dados disponíveis</p>
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
