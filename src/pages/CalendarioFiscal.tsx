import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TarefaFiscal {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  categoria: "faturacao" | "iva" | "taxa_turistica" | "ine" | "outros";
  concluida: boolean;
  prioridade: "alta" | "media" | "baixa";
}

const tarefasFiscaisMensais: TarefaFiscal[] = [
  {
    id: "1",
    titulo: "Emissão de Faturas",
    descricao: "Emitir todas as faturas referentes às reservas do mês anterior",
    prazo: "Até dia 5",
    categoria: "faturacao",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "2",
    titulo: "Validação de Faturas no e-Fatura",
    descricao: "Validar todas as faturas emitidas no portal e-Fatura das Finanças",
    prazo: "Até dia 10",
    categoria: "faturacao",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "3",
    titulo: "Envio do Relatório da Taxa Turística",
    descricao: "Submeter o relatório mensal da taxa turística à Câmara Municipal",
    prazo: "Até dia 15",
    categoria: "taxa_turistica",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "4",
    titulo: "Pagamento da Taxa Turística",
    descricao: "Efetuar o pagamento da taxa turística relativa ao mês anterior",
    prazo: "Até dia 15",
    categoria: "taxa_turistica",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "5",
    titulo: "Envio do Modelo 30 (IVA)",
    descricao: "Declaração periódica de IVA no Portal das Finanças",
    prazo: "Até dia 20",
    categoria: "iva",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "6",
    titulo: "Autoliquidação de IVA",
    descricao: "Pagamento do IVA autoliquidado referente ao período anterior",
    prazo: "Até dia 20",
    categoria: "iva",
    concluida: false,
    prioridade: "alta",
  },
  {
    id: "7",
    titulo: "Envio de Dados ao INE",
    descricao: "Submeter estatísticas de hóspedes ao Instituto Nacional de Estatística",
    prazo: "Até dia 25",
    categoria: "ine",
    concluida: false,
    prioridade: "media",
  },
  {
    id: "8",
    titulo: "Reconciliação Bancária",
    descricao: "Conferir e reconciliar todos os movimentos bancários do mês",
    prazo: "Até dia 28",
    categoria: "outros",
    concluida: false,
    prioridade: "media",
  },
];

const CalendarioFiscal = () => {
  const [selectedMonth, setSelectedMonth] = useState("2025-03");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [tarefas, setTarefas] = useState<TarefaFiscal[]>(tarefasFiscaisMensais);

  const toggleTarefa = (id: string) => {
    setTarefas(tarefas.map(t => 
      t.id === id ? { ...t, concluida: !t.concluida } : t
    ));
  };

  const filteredTarefas = tarefas.filter(t => 
    selectedCategoria === "todas" || t.categoria === selectedCategoria
  );

  const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
  const tarefasPendentes = tarefas.filter(t => !t.concluida).length;

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      faturacao: "Faturação",
      iva: "IVA",
      taxa_turistica: "Taxa Turística",
      ine: "INE",
      outros: "Outros",
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      faturacao: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      iva: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      taxa_turistica: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ine: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      outros: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[categoria] || colors.outros;
  };

  const getPrioridadeIcon = (prioridade: string) => {
    if (prioridade === "alta") return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (prioridade === "media") return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Calendário Fiscal"
        description="Acompanhamento das obrigações fiscais mensais"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tarefasConcluidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{tarefasPendentes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Mês de Referência</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">Janeiro 2025</SelectItem>
              <SelectItem value="2025-02">Fevereiro 2025</SelectItem>
              <SelectItem value="2025-03">Março 2025</SelectItem>
              <SelectItem value="2025-04">Abril 2025</SelectItem>
              <SelectItem value="2025-05">Maio 2025</SelectItem>
              <SelectItem value="2025-06">Junho 2025</SelectItem>
              <SelectItem value="2025-07">Julho 2025</SelectItem>
              <SelectItem value="2025-08">Agosto 2025</SelectItem>
              <SelectItem value="2025-09">Setembro 2025</SelectItem>
              <SelectItem value="2025-10">Outubro 2025</SelectItem>
              <SelectItem value="2025-11">Novembro 2025</SelectItem>
              <SelectItem value="2025-12">Dezembro 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Categorias</SelectItem>
              <SelectItem value="faturacao">Faturação</SelectItem>
              <SelectItem value="iva">IVA</SelectItem>
              <SelectItem value="taxa_turistica">Taxa Turística</SelectItem>
              <SelectItem value="ine">INE</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarefas Fiscais - {new Date(selectedMonth + "-01").toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTarefas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa encontrada para os filtros selecionados.
              </p>
            ) : (
              filteredTarefas.map((tarefa) => (
                <Card key={tarefa.id} className={tarefa.concluida ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={tarefa.concluida}
                        onCheckedChange={() => toggleTarefa(tarefa.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${tarefa.concluida ? "line-through text-muted-foreground" : ""}`}>
                              {tarefa.titulo}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {tarefa.descricao}
                            </p>
                          </div>
                          {getPrioridadeIcon(tarefa.prioridade)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {tarefa.prazo}
                          </Badge>
                          <Badge className={getCategoriaColor(tarefa.categoria)}>
                            {getCategoriaLabel(tarefa.categoria)}
                          </Badge>
                          {tarefa.concluida && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluída
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Notas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Os prazos indicados são gerais e podem variar conforme a legislação vigente</p>
          <p>• Verifique sempre no Portal das Finanças os prazos específicos para cada obrigação</p>
          <p>• O não cumprimento dos prazos pode resultar em coimas e juros de mora</p>
          <p>• Mantenha toda a documentação organizada e arquivada por 10 anos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarioFiscal;
