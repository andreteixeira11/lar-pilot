import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, FileDown, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
}

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

const ResumoMensal = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", valor: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get available months and years from reservations
  const { availableYears, availableMonthsByYear } = useMemo(() => {
    const yearsSet = new Set<string>();
    const monthsByYear: { [year: string]: Set<string> } = {};
    
    reservas
      .filter((r) => r.propertyId === selectedPropertyId && r.status === "confirmada")
      .forEach((r) => {
        const date = parseISO(r.checkIn);
        const year = format(date, "yyyy");
        const month = format(date, "MM");
        
        yearsSet.add(year);
        if (!monthsByYear[year]) monthsByYear[year] = new Set();
        monthsByYear[year].add(month);
      });
    
    const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    const monthsMap: { [year: string]: string[] } = {};
    Object.entries(monthsByYear).forEach(([year, months]) => {
      monthsMap[year] = Array.from(months).sort((a, b) => b.localeCompare(a));
    });
    
    return { availableYears: years, availableMonthsByYear: monthsMap };
  }, [reservas, selectedPropertyId]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || format(new Date(), "yyyy");
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const months = availableMonthsByYear[selectedYear] || [];
    return months[0] || format(new Date(), "MM");
  });

  // Update month when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const months = availableMonthsByYear[year] || [];
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  };

  // Parse selected month
  const monthStart = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
  const monthEnd = endOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));

  // Calculate data from reservations
  const resumoData = useMemo(() => {
    const monthReservations = reservas.filter((r) => {
      if (r.propertyId !== selectedPropertyId) return false;
      if (r.status !== "confirmada") return false;
      const checkIn = parseISO(r.checkIn);
      return isWithinInterval(checkIn, { start: monthStart, end: monthEnd });
    });

    const booking = monthReservations
      .filter((r) => r.plataforma === "Booking")
      .reduce((sum, r) => sum + (r.valor || 0), 0);

    const airbnb = monthReservations
      .filter((r) => r.plataforma === "Airbnb")
      .reduce((sum, r) => sum + (r.valor || 0), 0);

    const direto = monthReservations
      .filter((r) => r.plataforma === "Direto")
      .reduce((sum, r) => sum + (r.valor || 0), 0);

    const totalFaturado = booking + airbnb + direto;

    // Calculate platform commissions
    const bookingCommission = booking * 0.15;
    const airbnbCommission = airbnb * 0.15;
    const comissaoPlataforma = bookingCommission + airbnbCommission;

    // Management commission: 15% of total
    const comissaoGestao = totalFaturado * 0.15;

    return {
      receitas: {
        booking,
        airbnb,
        direto,
        total: totalFaturado,
      },
      comissoes: {
        gestao: comissaoGestao,
        plataforma: comissaoPlataforma,
      },
    };
  }, [reservas, selectedPropertyId, monthStart, monthEnd]);

  const totalReceitas = resumoData.receitas.total;
  const totalComissoes = resumoData.comissoes.gestao + resumoData.comissoes.plataforma;
  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
  const valorAntesImposto = totalReceitas - totalComissoes - totalDespesas;
  const irs = valorAntesImposto > 0 ? valorAntesImposto * 0.1 : 0;
  const valorLiquido = valorAntesImposto - irs;

  const handleAddDespesa = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor) {
      toast.error("Preencha todos os campos");
      return;
    }

    const valor = parseFloat(novaDespesa.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Valor inválido");
      return;
    }

    setDespesas([
      ...despesas,
      {
        id: Date.now().toString(),
        descricao: novaDespesa.descricao,
        valor,
      },
    ]);
    setNovaDespesa({ descricao: "", valor: "" });
    setDialogOpen(false);
    toast.success("Despesa adicionada");
  };

  const handleRemoveDespesa = (id: string) => {
    setDespesas(despesas.filter((d) => d.id !== id));
    toast.success("Despesa removida");
  };

  const getMonthLabel = () => {
    const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || "";
    return `${monthName} ${selectedYear}`;
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Resumo Mensal - ${getMonthLabel()}`, 14, 20);

    doc.setFontSize(12);
    doc.text(selectedProperty?.name || "Propriedade", 14, 30);

    // Receitas
    doc.setFontSize(14);
    doc.text("Receitas", 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [["Descrição", "Valor"]],
      body: [
        ["Booking", `€${resumoData.receitas.booking.toFixed(2)}`],
        ["Airbnb", `€${resumoData.receitas.airbnb.toFixed(2)}`],
        ["Direto", `€${resumoData.receitas.direto.toFixed(2)}`],
        ["Total Faturado", `€${totalReceitas.toFixed(2)}`],
      ],
      theme: "grid",
    });

    // Comissões
    const finalY1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Valores a Pagar", 14, finalY1);
    autoTable(doc, {
      startY: finalY1 + 5,
      head: [["Descrição", "Valor"]],
      body: [
        ["Comissão por Gestão (15%)", `-€${resumoData.comissoes.gestao.toFixed(2)}`],
        ["Comissão da Plataforma", `-€${resumoData.comissoes.plataforma.toFixed(2)}`],
        ["Total Comissões", `-€${totalComissoes.toFixed(2)}`],
      ],
      theme: "grid",
    });

    // Despesas
    if (despesas.length > 0) {
      const finalY2 = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Despesas", 14, finalY2);
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [["Descrição", "Valor"]],
        body: [
          ...despesas.map((d) => [d.descricao, `€${d.valor.toFixed(2)}`]),
          ["Total Despesas", `-€${totalDespesas.toFixed(2)}`],
        ],
        theme: "grid",
      });
    }

    // Resumo Final
    const finalY3 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Resumo Final", 14, finalY3);
    autoTable(doc, {
      startY: finalY3 + 5,
      head: [["Descrição", "Valor"]],
      body: [
        ["Valor ANTES DE IMPOSTO", `€${valorAntesImposto.toFixed(2)}`],
        ["IRS (10%)", `-€${irs.toFixed(2)}`],
        ["Valor Líquido", `€${valorLiquido.toFixed(2)}`],
      ],
      theme: "grid",
      styles: { fontStyle: "bold" },
    });

    doc.save(`resumo-mensal-${selectedMonth}-${selectedYear}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const currentMonths = availableMonthsByYear[selectedYear] || [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Resumo Mensal"
        description={`Análise financeira detalhada - ${selectedProperty?.name || ""}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {currentMonths.length > 0 ? (
                    currentMonths.map((monthValue) => {
                      const month = MONTHS.find(m => m.value === monthValue);
                      return month ? (
                        <SelectItem key={monthValue} value={monthValue}>
                          {month.label}
                        </SelectItem>
                      ) : null;
                    })
                  ) : (
                    MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={format(new Date(), "yyyy")}>
                      {format(new Date(), "yyyy")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportarPDF} variant="outline" className="gap-2 w-full sm:w-auto">
              <FileDown className="h-4 w-4" />
              <span className="sm:inline">Exportar PDF</span>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:gap-6">
        {/* Receitas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">Booking</span>
              <span className="font-semibold">€{resumoData.receitas.booking.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">Airbnb</span>
              <span className="font-semibold">€{resumoData.receitas.airbnb.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">Direto</span>
              <span className="font-semibold">€{resumoData.receitas.direto.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base md:text-lg">
              <span className="font-semibold">Total Faturado</span>
              <span className="font-bold text-primary">€{totalReceitas.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Comissões e Pagamentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Valores a Pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">Comissão por Gestão (15%)</span>
              <span className="font-semibold text-destructive">
                -€{resumoData.comissoes.gestao.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">Comissão da Plataforma</span>
              <span className="font-semibold text-destructive">
                -€{resumoData.comissoes.plataforma.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm md:text-base">
              <span className="font-semibold">Total Comissões</span>
              <span className="font-bold text-destructive">-€{totalComissoes.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Despesas
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Despesa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={novaDespesa.descricao}
                        onChange={(e) =>
                          setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                        }
                        placeholder="Ex: Limpeza, Água, Luz..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (€)</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={novaDespesa.valor}
                        onChange={(e) =>
                          setNovaDespesa({ ...novaDespesa, valor: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={handleAddDespesa} className="w-full">
                      Adicionar Despesa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {despesas.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">
                Nenhuma despesa adicionada
              </p>
            ) : (
              <>
                {despesas.map((despesa) => (
                  <div key={despesa.id} className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-muted-foreground">{despesa.descricao}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">€{despesa.valor.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDespesa(despesa.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-semibold">Total Despesas</span>
                  <span className="font-bold text-orange-500">-€{totalDespesas.toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-base md:text-lg">
              <span className="font-semibold">Valor ANTES DE IMPOSTO</span>
              <span className="font-bold">€{valorAntesImposto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-muted-foreground">IRS (10%)</span>
              <span className="font-semibold text-destructive">
                -€{irs.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl md:text-2xl">
              <span className="font-bold">Valor Líquido</span>
              <span className="font-bold text-primary">
                €{valorLiquido.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumoMensal;