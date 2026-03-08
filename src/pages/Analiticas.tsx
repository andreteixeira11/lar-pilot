import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip as RechartsTooltip } from "recharts";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  subMonths,
  isAfter,
  isBefore,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import { pt } from "date-fns/locale";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Percent,
  BedDouble,
  CalendarDays,
  FileDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "#FF5A5F", "#003580", "#10B981", "#F59E0B", "#8B5CF6"];

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const Analiticas = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();
  const today = new Date();
  const currentYear = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [compareYear, setCompareYear] = useState((currentYear - 1).toString());

  const yearNum = parseInt(selectedYear);
  const compareYearNum = parseInt(compareYear);

  // Filter reservations for property
  const propertyReservations = reservas.filter(
    (r) => r.propertyId === selectedPropertyId && r.status === "confirmada"
  );

  // Helper: get monthly data for a given year
  const getMonthlyData = (year: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = endOfMonth(monthStart);
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

      const monthReservations = propertyReservations.filter((r) => {
        const checkIn = new Date(r.checkIn);
        return checkIn.getFullYear() === year && checkIn.getMonth() === i;
      });

      const revenue = monthReservations.reduce((sum, r) => sum + (r.valor || 0), 0);
      const nights = monthReservations.reduce((sum, r) => sum + (r.noites || 0), 0);
      const guests = monthReservations.reduce((sum, r) => sum + (r.nrHospedes || 0), 0);
      const count = monthReservations.length;

      const occupancy = daysInMonth > 0 ? (nights / daysInMonth) * 100 : 0;
      const adr = nights > 0 ? revenue / nights : 0;
      const revpar = daysInMonth > 0 ? revenue / daysInMonth : 0;

      return {
        month: i,
        name: MONTHS_PT[i].substring(0, 3),
        fullName: MONTHS_PT[i],
        revenue,
        nights,
        guests,
        count,
        occupancy,
        adr,
        revpar,
        daysInMonth,
      };
    });
  };

  const currentYearData = getMonthlyData(yearNum);
  const compareYearData = getMonthlyData(compareYearNum);

  // Annual totals
  const yearTotals = currentYearData.reduce(
    (acc, m) => ({
      revenue: acc.revenue + m.revenue,
      nights: acc.nights + m.nights,
      guests: acc.guests + m.guests,
      count: acc.count + m.count,
      daysInYear: acc.daysInYear + m.daysInMonth,
    }),
    { revenue: 0, nights: 0, guests: 0, count: 0, daysInYear: 0 }
  );

  const compareYearTotals = compareYearData.reduce(
    (acc, m) => ({
      revenue: acc.revenue + m.revenue,
      nights: acc.nights + m.nights,
      count: acc.count + m.count,
      daysInYear: acc.daysInYear + m.daysInMonth,
    }),
    { revenue: 0, nights: 0, count: 0, daysInYear: 0 }
  );

  const annualOccupancy = yearTotals.daysInYear > 0 ? (yearTotals.nights / yearTotals.daysInYear) * 100 : 0;
  const annualADR = yearTotals.nights > 0 ? yearTotals.revenue / yearTotals.nights : 0;
  const annualRevPAR = yearTotals.daysInYear > 0 ? yearTotals.revenue / yearTotals.daysInYear : 0;

  // Compare percentages
  const revenueChange = compareYearTotals.revenue > 0
    ? ((yearTotals.revenue - compareYearTotals.revenue) / compareYearTotals.revenue) * 100
    : 0;
  const nightsChange = compareYearTotals.nights > 0
    ? ((yearTotals.nights - compareYearTotals.nights) / compareYearTotals.nights) * 100
    : 0;

  // Revenue by platform
  const revenueByPlatform = propertyReservations
    .filter((r) => new Date(r.checkIn).getFullYear() === yearNum)
    .reduce((acc, r) => {
      const platform = r.plataforma || "Direto";
      acc[platform] = (acc[platform] || 0) + (r.valor || 0);
      return acc;
    }, {} as Record<string, number>);

  const platformData = Object.entries(revenueByPlatform)
    .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  // Reservations by platform
  const reservationsByPlatform = propertyReservations
    .filter((r) => new Date(r.checkIn).getFullYear() === yearNum)
    .reduce((acc, r) => {
      const platform = r.plataforma || "Direto";
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const platformReservationsData = Object.entries(reservationsByPlatform)
    .map(([name, value]) => ({ name, reservas: value }))
    .sort((a, b) => b.reservas - a.reservas);

  // Chart data for comparison
  const comparisonChartData = currentYearData.map((m, i) => ({
    name: m.name,
    [`Receita ${selectedYear}`]: m.revenue,
    [`Receita ${compareYear}`]: compareYearData[i].revenue,
  }));

  const occupancyChartData = currentYearData.map((m, i) => ({
    name: m.name,
    [`Ocupação ${selectedYear}`]: parseFloat(m.occupancy.toFixed(1)),
    [`Ocupação ${compareYear}`]: parseFloat(compareYearData[i].occupancy.toFixed(1)),
  }));

  const kpiChartData = currentYearData.map((m) => ({
    name: m.name,
    ADR: parseFloat(m.adr.toFixed(2)),
    RevPAR: parseFloat(m.revpar.toFixed(2)),
  }));

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(26, 122, 110);
    doc.text("Relatório de Analytics", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${selectedProperty?.name || "Propriedade"} — ${selectedYear}`, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado em: ${format(today, "dd 'de' MMMM 'de' yyyy", { locale: pt })}`,
      pageWidth / 2, 38, { align: "center" }
    );

    // KPIs
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Indicadores Anuais", 14, 52);
    autoTable(doc, {
      startY: 57,
      head: [["Indicador", "Valor"]],
      body: [
        ["Receita Total", `€${yearTotals.revenue.toFixed(2)}`],
        ["Noites Vendidas", yearTotals.nights.toString()],
        ["Taxa de Ocupação", `${annualOccupancy.toFixed(1)}%`],
        ["ADR (Tarifa Média Diária)", `€${annualADR.toFixed(2)}`],
        ["RevPAR (Receita por Quarto Disponível)", `€${annualRevPAR.toFixed(2)}`],
        ["Total de Reservas", yearTotals.count.toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [26, 122, 110] },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Monthly breakdown
    doc.setFontSize(14);
    doc.text("Desempenho Mensal", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [["Mês", "Receita", "Noites", "Ocupação", "ADR", "RevPAR"]],
      body: currentYearData.map((m) => [
        m.fullName,
        `€${m.revenue.toFixed(2)}`,
        m.nights.toString(),
        `${m.occupancy.toFixed(1)}%`,
        `€${m.adr.toFixed(2)}`,
        `€${m.revpar.toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [26, 122, 110] },
      styles: { fontSize: 9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 250) { doc.addPage(); currentY = 20; }

    // Revenue by platform
    if (platformData.length > 0) {
      doc.setFontSize(14);
      doc.text("Receita por Canal", 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Canal", "Receita", "% do Total"]],
        body: platformData.map((p) => [
          p.name,
          `€${p.value.toFixed(2)}`,
          `${yearTotals.revenue > 0 ? ((p.value / yearTotals.revenue) * 100).toFixed(1) : 0}%`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`analytics-${selectedProperty?.name || "propriedade"}-${selectedYear}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  };

  if (!selectedProperty) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader title="Analytics" description="Selecione uma propriedade para ver os analytics" />
        <div className="mt-8 text-center py-12">
          <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma propriedade selecionada</h3>
          <p className="text-muted-foreground">Use o seletor no topo para escolher uma propriedade</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title, value, subtitle, icon: Icon, trend, trendLabel, color = "primary",
  }: {
    title: string; value: string; subtitle?: string; icon: any; trend?: number; trendLabel?: string; color?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`h-10 w-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`h-5 w-5 text-${color}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span className="font-medium">{trend >= 0 ? "+" : ""}{trend.toFixed(1)}%</span>
            {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Analytics"
        description={`Métricas de desempenho — ${selectedProperty.name}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={compareYear} onValueChange={setCompareYear}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Comparar" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map((y) => (
                    <SelectItem key={y} value={y.toString()}>vs {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportPDF} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <StatCard
          title="Receita Total"
          value={`€${yearTotals.revenue.toFixed(0)}`}
          icon={Euro}
          trend={revenueChange}
          trendLabel={`vs ${compareYear}`}
          color="primary"
        />
        <StatCard
          title="Taxa Ocupação"
          value={`${annualOccupancy.toFixed(1)}%`}
          icon={Percent}
          subtitle={`${yearTotals.nights} noites vendidas`}
          color="primary"
          trend={nightsChange}
          trendLabel={`vs ${compareYear}`}
        />
        <StatCard
          title="ADR"
          value={`€${annualADR.toFixed(0)}`}
          icon={BedDouble}
          subtitle="Tarifa média diária"
          color="primary"
        />
        <StatCard
          title="RevPAR"
          value={`€${annualRevPAR.toFixed(0)}`}
          icon={TrendingUp}
          subtitle="Receita por quarto disp."
          color="primary"
        />
        <StatCard
          title="Reservas"
          value={yearTotals.count.toString()}
          icon={CalendarDays}
          subtitle={`${yearTotals.guests} hóspedes`}
          color="primary"
        />
      </div>

      {/* Revenue Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              Receita Mensal — Comparação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`€${value.toFixed(2)}`, name]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey={`Receita ${selectedYear}`} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={`Receita ${compareYear}`} fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Taxa de Ocupação — Comparação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey={`Ocupação ${selectedYear}`} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey={`Ocupação ${compareYear}`} stroke="hsl(var(--primary) / 0.4)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADR/RevPAR + Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              ADR & RevPAR Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiChartData}>
                  <defs>
                    <linearGradient id="colorADR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevPAR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`€${value.toFixed(2)}`, name]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="ADR" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorADR)" />
                  <Area type="monotone" dataKey="RevPAR" stroke="#10B981" fillOpacity={1} fill="url(#colorRevPAR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Receita por Canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Sem dados de reservas para {selectedYear}</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Desempenho Mensal Detalhado — {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Mês</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Receita</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Noites</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ocupação</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">ADR</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">RevPAR</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Reservas</th>
                </tr>
              </thead>
              <tbody>
                {currentYearData.map((m) => (
                  <tr key={m.month} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-2 font-medium">{m.fullName}</td>
                    <td className="py-2.5 px-2 text-right">€{m.revenue.toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right">{m.nights}</td>
                    <td className="py-2.5 px-2 text-right">
                      <Badge variant={m.occupancy > 70 ? "default" : m.occupancy > 40 ? "secondary" : "outline"}>
                        {m.occupancy.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 text-right">€{m.adr.toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right">€{m.revpar.toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right">{m.count}</td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="font-bold bg-muted/30">
                  <td className="py-2.5 px-2">Total</td>
                  <td className="py-2.5 px-2 text-right">€{yearTotals.revenue.toFixed(0)}</td>
                  <td className="py-2.5 px-2 text-right">{yearTotals.nights}</td>
                  <td className="py-2.5 px-2 text-right">
                    <Badge>{annualOccupancy.toFixed(0)}%</Badge>
                  </td>
                  <td className="py-2.5 px-2 text-right">€{annualADR.toFixed(0)}</td>
                  <td className="py-2.5 px-2 text-right">€{annualRevPAR.toFixed(0)}</td>
                  <td className="py-2.5 px-2 text-right">{yearTotals.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analiticas;
