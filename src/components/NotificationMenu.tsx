import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";

interface TarefaFiscal {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  categoria: "faturacao" | "iva" | "taxa_turistica" | "ine" | "outros";
  concluida: boolean;
  prioridade: "alta" | "media" | "baixa";
}

export function NotificationMenu() {
  const [tarefasPendentes, setTarefasPendentes] = useState<TarefaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedProperty } = useProperty();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProperty?.id) {
      loadTarefasPendentes();
    }
  }, [selectedProperty?.id]);

  const loadTarefasPendentes = async () => {
    if (!selectedProperty?.id) return;

    setLoading(true);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from("fiscal_tasks")
      .select("*")
      .eq("property_id", selectedProperty.id)
      .eq("month", currentMonth)
      .eq("concluida", false)
      .order("prioridade", { ascending: true })
      .order("prazo", { ascending: true });

    if (error) {
      console.error("Error loading fiscal tasks:", error);
    } else {
      setTarefasPendentes((data || []) as TarefaFiscal[]);
    }
    setLoading(false);
  };

  const getPrioridadeIcon = (prioridade: string) => {
    if (prioridade === "alta") return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (prioridade === "media") return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {tarefasPendentes.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {tarefasPendentes.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Tarefas Fiscais Pendentes</h3>
            {tarefasPendentes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tarefasPendentes.length} {tarefasPendentes.length === 1 ? "tarefa" : "tarefas"}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              A carregar...
            </div>
          ) : tarefasPendentes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Sem tarefas pendentes!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tarefasPendentes.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/calendario-fiscal")}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                    {getPrioridadeIcon(tarefa.prioridade)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {tarefa.descricao}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tarefa.prazo}
                    </Badge>
                    <Badge className={`text-xs ${getCategoriaColor(tarefa.categoria)}`}>
                      {tarefa.categoria.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => navigate("/calendario-fiscal")}
          >
            Ver todas as tarefas
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
