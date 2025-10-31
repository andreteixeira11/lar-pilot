import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";

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

  return (
    <div className="p-8">
      <PageHeader
        title="Resumo Mensal"
        description="Análise financeira detalhada do mês"
        actions={
          <Select defaultValue="11-2025">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11-2025">Novembro 2025</SelectItem>
              <SelectItem value="10-2025">Outubro 2025</SelectItem>
              <SelectItem value="09-2025">Setembro 2025</SelectItem>
            </SelectContent>
          </Select>
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
