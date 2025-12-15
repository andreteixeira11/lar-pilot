import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Clock, Calendar, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface TarefaFiscal {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  categoria: "faturacao" | "iva" | "taxa_turistica" | "ine" | "outros";
  concluida: boolean;
  prioridade: "alta" | "media" | "baixa";
}

interface BookingRequest {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number | null;
  status: string;
  created_at: string;
}

export function NotificationMenu() {
  const [tarefasPendentes, setTarefasPendentes] = useState<TarefaFiscal[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedProperty, selectedPropertyId } = useProperty();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProperty?.id) {
      loadData();
    }
  }, [selectedProperty?.id]);

  const loadData = async () => {
    if (!selectedProperty?.id) return;

    setLoading(true);
    
    // Load fiscal tasks
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: tasksData, error: tasksError } = await supabase
      .from("fiscal_tasks")
      .select("*")
      .eq("property_id", selectedProperty.id)
      .eq("month", currentMonth)
      .eq("concluida", false)
      .order("prioridade", { ascending: true })
      .order("prazo", { ascending: true });

    if (!tasksError) {
      setTarefasPendentes((tasksData || []) as TarefaFiscal[]);
    }

    // Load pending booking requests
    const { data: pageData } = await supabase
      .from("direct_booking_pages")
      .select("id")
      .eq("property_id", selectedProperty.id)
      .maybeSingle();

    if (pageData?.id) {
      const { data: requestsData, error: requestsError } = await supabase
        .from("direct_booking_requests")
        .select("*")
        .eq("page_id", pageData.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!requestsError) {
        setBookingRequests((requestsData || []) as BookingRequest[]);
      }
    } else {
      setBookingRequests([]);
    }

    setLoading(false);
  };

  // Set up realtime subscription for booking requests
  useEffect(() => {
    if (!selectedPropertyId) return;

    const channel = supabase
      .channel('booking-requests-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_booking_requests'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPropertyId]);

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

  const totalNotifications = tarefasPendentes.length + bookingRequests.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[90vw] sm:w-[420px] max-w-md max-h-[80vh] sm:max-h-[500px] overflow-hidden">
        <Tabs defaultValue="reservas" className="w-full">
          <div className="p-3 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="reservas" className="flex-1 gap-2">
                Reservas
                {bookingRequests.length > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                    {bookingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="flex-1 gap-2">
                Fiscal
                {tarefasPendentes.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                    {tarefasPendentes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reservas" className="m-0 max-h-[350px] overflow-y-auto">
            <div className="p-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  A carregar...
                </div>
              ) : bookingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sem pedidos de reserva pendentes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-3 hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => navigate("/reservas-diretas")}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{request.guest_name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(request.check_in), "d MMM", { locale: pt })} - {format(new Date(request.check_out), "d MMM yyyy", { locale: pt })}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {request.num_guests} {request.num_guests === 1 ? "hóspede" : "hóspedes"}
                        </span>
                        {request.total_price && (
                          <span className="text-sm font-medium text-primary">
                            €{request.total_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {bookingRequests.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    onClick={() => navigate("/reservas-diretas")}
                  >
                    Ver todos os pedidos
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="fiscal" className="m-0 max-h-[350px] overflow-y-auto">
            <div className="p-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  A carregar...
                </div>
              ) : tarefasPendentes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sem tarefas fiscais pendentes!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tarefasPendentes.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="border rounded-lg p-3 hover:bg-primary/10 transition-colors cursor-pointer"
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

            {tarefasPendentes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    onClick={() => navigate("/calendario-fiscal")}
                  >
                    Ver calendário fiscal
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}