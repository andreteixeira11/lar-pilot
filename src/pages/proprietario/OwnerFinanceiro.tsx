import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  Percent,
  Sparkles,
  Wrench,
  ShowerHead,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CostItem {
  id: string;
  cost_type: string;
  description: string | null;
  amount: number;
  month: string;
}

interface FinancialSummary {
  grossRevenue: number;
  managerCommission: number;
  netRevenue: number;
  totalCosts: number;
  finalProfit: number;
  commissionRate: number;
}

export default function OwnerFinanceiro() {
  const { owner } = useOwnerAuth();
  const { t, language } = useOwnerLanguage();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString().padStart(2, "0"));
  const [summary, setSummary] = useState<FinancialSummary>({
    grossRevenue: 0,
    managerCommission: 0,
    netRevenue: 0,
    totalCosts: 0,
    finalProfit: 0,
    commissionRate: 15,
  });
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<string[]>([currentYear.toString()]);

  const dateLocale = language === "pt" ? pt : enUS;

  const costTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    limpeza: { label: t("financial.cleaning"), icon: <ShowerHead className="w-4 h-4" /> },
    manutencao: { label: t("financial.maintenance"), icon: <Wrench className="w-4 h-4" /> },
    outros: { label: t("financial.other"), icon: <Sparkles className="w-4 h-4" /> },
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const date = new Date(parseInt(selectedYear), i, 1);
    return {
      value: monthNum.toString().padStart(2, "0"),
      label: format(date, "MMMM", { locale: dateLocale }),
    };
  });

  useEffect(() => {
    if (owner?.propertyId) {
      loadAvailableYears();
    }
  }, [owner?.propertyId]);

  useEffect(() => {
    if (owner?.propertyId) {
      loadFinancialData();
    }
  }, [owner?.propertyId, selectedYear, selectedMonth]);

  const loadAvailableYears = async () => {
    if (!owner?.propertyId) return;
    
    const { data: reservationsData } = await supabase
      .from("reservations")
      .select("check_in")
      .eq("property_id", owner.propertyId);
    
    if (reservationsData && reservationsData.length > 0) {
      const yearsSet = new Set<string>();
      reservationsData.forEach(r => {
        const year = new Date(r.check_in).getFullYear().toString();
        yearsSet.add(year);
      });
      // Always include current year
      yearsSet.add(currentYear.toString());
      const sortedYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(sortedYears);
    }
  };

  const loadFinancialData = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const yearNum = parseInt(selectedYear);
      const monthNum = parseInt(selectedMonth);
      const startDate = startOfMonth(new Date(yearNum, monthNum - 1));
      const endDate = endOfMonth(startDate);
      const monthKey = `${selectedYear}-${selectedMonth}`;

      // Get reservations for the month
      const { data: reservations } = await supabase
        .from("reservations")
        .select("total_price")
        .eq("property_id", owner.propertyId)
        .gte("check_in", startDate.toISOString().split("T")[0])
        .lte("check_in", endDate.toISOString().split("T")[0])
        .in("status", ["confirmada", "concluida"]);

      // Get owner's commission rate
      const { data: ownerData } = await supabase
        .from("property_owners")
        .select("commission_rate")
        .eq("id", owner.ownerId)
        .single();

      // Get costs for the month
      const { data: costsData } = await supabase
        .from("owner_costs")
        .select("*")
        .eq("property_id", owner.propertyId)
        .eq("month", monthKey);

      const commissionRate = ownerData?.commission_rate || 15;
      const grossRevenue = reservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
      const managerCommission = grossRevenue * (commissionRate / 100);
      const netRevenue = grossRevenue - managerCommission;
      const totalCosts = costsData?.reduce((sum, c) => sum + c.amount, 0) || 0;
      const finalProfit = netRevenue - totalCosts;

      setSummary({
        grossRevenue,
        managerCommission,
        netRevenue,
        totalCosts,
        finalProfit,
        commissionRate,
      });

      setCosts(costsData || []);
    } catch (err) {
      console.error("Financial data error:", err);
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

  const downloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = `${monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth} ${selectedYear}`;

    // Header
    doc.setFontSize(20);
    doc.text(language === "pt" ? "Relatório Financeiro" : "Financial Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`${language === "pt" ? "Propriedade" : "Property"}: ${owner?.propertyName}`, 20, 30);
    doc.text(`${language === "pt" ? "Período" : "Period"}: ${monthLabel}`, 20, 38);

    // Summary table
    autoTable(doc, {
      startY: 50,
      head: [[language === "pt" ? "Descrição" : "Description", language === "pt" ? "Valor" : "Value"]],
      body: [
        [t("financial.totalRevenue"), formatCurrency(summary.grossRevenue)],
        [`${t("financial.managementCommission")} (${summary.commissionRate}%)`, `- ${formatCurrency(summary.managerCommission)}`],
        [language === "pt" ? "Receita Líquida" : "Net Revenue", formatCurrency(summary.netRevenue)],
        [t("financial.operationalCosts"), `- ${formatCurrency(summary.totalCosts)}`],
        [t("financial.netProfit"), formatCurrency(summary.finalProfit)],
      ],
      theme: "grid",
      headStyles: { fillColor: [36, 125, 127] },
      footStyles: { fillColor: [36, 125, 127] },
    });

    // Costs breakdown if any
    if (costs.length > 0) {
      const currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text(t("financial.costsBreakdown"), 20, currentY);

      autoTable(doc, {
        startY: currentY + 10,
        head: [[t("documents.type"), language === "pt" ? "Descrição" : "Description", language === "pt" ? "Valor" : "Value"]],
        body: costs.map((cost) => [
          costTypeLabels[cost.cost_type]?.label || cost.cost_type,
          cost.description || "-",
          formatCurrency(cost.amount),
        ]),
        theme: "striped",
        headStyles: { fillColor: [100, 100, 100] },
      });
    }

    doc.save(`${language === "pt" ? "relatorio-financeiro" : "financial-report"}-${selectedYear}-${selectedMonth}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("financial.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("financial.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={language === "pt" ? "Mês" : "Month"} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={downloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              {language === "pt" ? "Receitas" : "Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("financial.totalRevenue")}</span>
              <span className="font-semibold">{formatCurrency(summary.grossRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {language === "pt" ? "Comissão" : "Commission"} ({summary.commissionRate}%)
              </span>
              <span className="text-destructive">- {formatCurrency(summary.managerCommission)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium">{language === "pt" ? "Receita Líquida" : "Net Revenue"}</span>
              <span className="font-bold text-lg">{formatCurrency(summary.netRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Costs Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              {t("financial.operationalCosts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {costs.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("financial.noCosts")}</p>
            ) : (
              costs.slice(0, 3).map((cost) => (
                <div key={cost.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {costTypeLabels[cost.cost_type]?.icon}
                    {costTypeLabels[cost.cost_type]?.label || cost.cost_type}
                  </span>
                  <span className="text-destructive">- {formatCurrency(cost.amount)}</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium">{language === "pt" ? "Total Custos" : "Total Costs"}</span>
              <span className="font-bold text-lg text-destructive">
                - {formatCurrency(summary.totalCosts)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {t("financial.netProfit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {isLoading ? "..." : formatCurrency(summary.finalProfit)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {language === "pt" ? "Após comissão e custos operacionais" : "After commission and operational costs"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "pt" ? "Resumo Mensal" : "Monthly Summary"}</CardTitle>
          <CardDescription>
            {language === "pt" ? "Detalhamento completo das finanças de" : "Complete financial breakdown for"}{" "}
            {monthOptions.find((m) => m.value === selectedMonth)?.label} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "pt" ? "Descrição" : "Description"}</TableHead>
                  <TableHead className="text-right">{language === "pt" ? "Valor" : "Value"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("financial.totalRevenue")} ({language === "pt" ? "Reservas" : "Bookings"})</TableCell>
                  <TableCell className="text-right text-green-600">
                    + {formatCurrency(summary.grossRevenue)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {t("financial.managementCommission")} ({summary.commissionRate}%)
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    - {formatCurrency(summary.managerCommission)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">{language === "pt" ? "Receita Líquida" : "Net Revenue"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(summary.netRevenue)}
                  </TableCell>
                </TableRow>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {costTypeLabels[cost.cost_type]?.icon}
                        {costTypeLabels[cost.cost_type]?.label || cost.cost_type}
                        {cost.description && (
                          <span className="text-muted-foreground">- {cost.description}</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      - {formatCurrency(cost.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-primary/10">
                  <TableCell className="font-bold text-primary">{t("financial.netProfit")}</TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">
                    {formatCurrency(summary.finalProfit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
