import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Euro, TrendingUp, Calendar, CreditCard } from "lucide-react";
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
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const AdminReports = () => {
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Fetch payments data
  const { data: payments } = useQuery({
    queryKey: ["admin-payments-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate monthly revenue
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    const monthPayments = payments?.filter((p) => {
      const paymentDate = new Date(p.created_at);
      return (
        paymentDate.getFullYear().toString() === selectedYear &&
        (paymentDate.getMonth() + 1).toString().padStart(2, "0") === month &&
        p.payment_status === "completed"
      );
    });

    const revenue = monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return {
      name: MONTHS[i].label.substring(0, 3),
      receita: revenue,
    };
  });

  // Calculate plan distribution by month
  const planRevenue = payments?.reduce((acc, p) => {
    if (p.payment_status !== "completed") return acc;
    const plan = p.subscription_plan || "unknown";
    acc[plan] = (acc[plan] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);

  const planChartData = Object.entries(planRevenue || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    valor: value,
  }));

  // Current month stats
  const currentMonthPayments = payments?.filter((p) => {
    const paymentDate = new Date(p.created_at);
    return (
      paymentDate.getFullYear().toString() === selectedYear &&
      (paymentDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonth &&
      p.payment_status === "completed"
    );
  });

  const currentMonthRevenue =
    currentMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const currentMonthCount = currentMonthPayments?.length || 0;

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório Financeiro", 14, 20);

    doc.setFontSize(12);
    doc.text(`${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`, 14, 30);

    // Summary
    doc.setFontSize(14);
    doc.text("Resumo do Mês", 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        ["Receita Total", `€${currentMonthRevenue.toFixed(2)}`],
        ["Nº de Pagamentos", currentMonthCount.toString()],
      ],
      theme: "grid",
    });

    // Monthly breakdown
    const finalY1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Receita por Plano", 14, finalY1);
    autoTable(doc, {
      startY: finalY1 + 5,
      head: [["Plano", "Receita"]],
      body: planChartData.map((p) => [p.name, `€${p.valor.toFixed(2)}`]),
      theme: "grid",
    });

    doc.save(`relatorio-financeiro-${selectedMonth}-${selectedYear}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Relatórios Financeiros"
        description="Análise de receitas e vendas da plataforma"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {["2023", "2024", "2025"].map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  €{currentMonthRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagamentos</p>
                <p className="text-2xl font-bold">{currentMonthCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receita Mensal - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
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
                    formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Receita por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
