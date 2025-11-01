import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const resumoData = {
  receitas: {
    booking: 2450,
    airbnb: 3200,
    valorEstadia: 4800,
    taxaLimpeza: 850,
  },
  comissoes: {
    gestao: 847.5, // 15% de 5650
    plataforma: 565, // ~10%
  },
  despesas: {
    limpeza: 300,
    agua: 45,
    luz: 120,
    internet: 35,
    produtosLimpeza: 85,
    brindes: 60,
    autoliquidacaoIVA: 450,
  },
};

const ResumoMensal = () => {
  const totalReceitas =
    resumoData.receitas.booking +
    resumoData.receitas.airbnb +
    resumoData.receitas.taxaLimpeza;
  const totalComissoes =
    resumoData.comissoes.gestao + resumoData.comissoes.plataforma;
  const totalDespesas = Object.values(resumoData.despesas).reduce(
    (a, b) => a + b,
    0
  );
  const valorAntesImposto = totalReceitas - totalComissoes - totalDespesas;
  const irs = valorAntesImposto * 0.1;
  const valorLiquido = valorAntesImposto - irs;

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Resumo Mensal - Novembro 2025", 14, 20);

    doc.setFontSize(12);
    doc.text("Casa da Praia", 14, 30);

    // Receitas
    doc.setFontSize(14);
    doc.text("Receitas", 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [["Descrição", "Valor"]],
      body: [
        ["Booking", `€${resumoData.receitas.booking}`],
        ["Airbnb", `€${resumoData.receitas.airbnb}`],
        ["Taxa de Limpeza", `€${resumoData.receitas.taxaLimpeza}`],
        ["Total Faturado", `€${totalReceitas}`],
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
        ["Comissão por Gestão (15%)", `-€${resumoData.comissoes.gestao}`],
        ["Comissão da Plataforma", `-€${resumoData.comissoes.plataforma}`],
        ["Total Comissões", `-€${totalComissoes}`],
      ],
      theme: "grid",
    });

    // Despesas
    const finalY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Despesas Gerais do Alojamento", 14, finalY2);
    autoTable(doc, {
      startY: finalY2 + 5,
      head: [["Descrição", "Valor"]],
      body: [
        ["Limpeza", `€${resumoData.despesas.limpeza}`],
        ["Água", `€${resumoData.despesas.agua}`],
        ["Luz", `€${resumoData.despesas.luz}`],
        ["Internet", `€${resumoData.despesas.internet}`],
        ["Produtos de Limpeza", `€${resumoData.despesas.produtosLimpeza}`],
        ["Brindes Hóspedes", `€${resumoData.despesas.brindes}`],
        ["Autoliquidação de IVA", `€${resumoData.despesas.autoliquidacaoIVA}`],
        ["Total Despesas Gerais", `-€${totalDespesas}`],
      ],
      theme: "grid",
    });

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

    doc.save("resumo-mensal-novembro-2025.pdf");
    toast.success("PDF exportado com sucesso!");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Resumo Mensal"
        description="Análise financeira detalhada do mês"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select defaultValue="11-2025">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11-2025">Novembro 2025</SelectItem>
                <SelectItem value="10-2025">Outubro 2025</SelectItem>
                <SelectItem value="09-2025">Setembro 2025</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportarPDF} variant="outline" className="gap-2 w-full sm:w-auto">
              <FileDown className="h-4 w-4" />
              <span className="sm:inline">Exportar PDF</span>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6">
        {/* Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking</span>
              <span className="font-semibold">€{resumoData.receitas.booking}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Airbnb</span>
              <span className="font-semibold">€{resumoData.receitas.airbnb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de Limpeza</span>
              <span className="font-semibold">
                €{resumoData.receitas.taxaLimpeza}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Faturado</span>
              <span className="font-bold text-success">€{totalReceitas}</span>
            </div>
          </CardContent>
        </Card>

        {/* Comissões e Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Valores a Pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comissão por Gestão (15%)</span>
              <span className="font-semibold text-destructive">
                -€{resumoData.comissoes.gestao}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comissão da Plataforma</span>
              <span className="font-semibold text-destructive">
                -€{resumoData.comissoes.plataforma}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total Comissões</span>
              <span className="font-bold text-destructive">-€{totalComissoes}</span>
            </div>
          </CardContent>
        </Card>

        {/* Despesas Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              Despesas Gerais do Alojamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Limpeza</span>
              <span className="font-semibold">€{resumoData.despesas.limpeza}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Água</span>
              <span className="font-semibold">€{resumoData.despesas.agua}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Luz</span>
              <span className="font-semibold">€{resumoData.despesas.luz}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Internet</span>
              <span className="font-semibold">€{resumoData.despesas.internet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Produtos de Limpeza e Outros
              </span>
              <span className="font-semibold">
                €{resumoData.despesas.produtosLimpeza}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brindes Hóspedes</span>
              <span className="font-semibold">€{resumoData.despesas.brindes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autoliquidação de IVA</span>
              <span className="font-semibold">
                €{resumoData.despesas.autoliquidacaoIVA}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total Despesas Gerais</span>
              <span className="font-bold text-warning">-€{totalDespesas}</span>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Valor ANTES DE IMPOSTO</span>
              <span className="font-bold">€{valorAntesImposto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IRS (10%)</span>
              <span className="font-semibold text-destructive">
                -€{irs.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-2xl">
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
