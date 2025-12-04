import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar, TrendingUp, AlertTriangle, Euro, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();

  // Get fiscal tasks
  const { data: fiscalTasks } = useQuery({
    queryKey: ["fiscal-tasks-dashboard", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];

      const { data, error } = await supabase
        .from("fiscal_tasks")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .eq("concluida", false)
        .order("prazo", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPropertyId,
  });

  // Get next 3 reservations
  const today = new Date();
  const nextReservations = reservas
    .filter((r) => r.propertyId === selectedPropertyId && isAfter(new Date(r.checkIn), today))
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 3);

  // Calculate current month revenue
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const currentMonthReservations = reservas.filter((r) => {
    const checkIn = new Date(r.checkIn);
    return (
      r.propertyId === selectedPropertyId &&
      r.status === "confirmada" &&
      isAfter(checkIn, monthStart) &&
      isBefore(checkIn, monthEnd)
    );
  });

  const monthlyRevenue = currentMonthReservations.reduce((total, r) => total + (r.valor || 0), 0);
  const monthlyNights = currentMonthReservations.reduce((total, r) => total + (r.noites || 0), 0);
  const monthlyGuests = currentMonthReservations.reduce((total, r) => total + (r.nrHospedes || 0), 0);

  if (!selectedProperty) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Dashboard"
          description="Visão geral da sua propriedade"
        />
        <div className="mt-8 text-center text-muted-foreground">
          Selecione uma propriedade para ver o dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description={`Visão geral - ${selectedProperty?.name}`}
      />

      <div className="grid gap-6 mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faturação do Mês</p>
                  <p className="text-2xl font-bold text-primary">€{monthlyRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Noites do Mês</p>
                  <p className="text-2xl font-bold">{monthlyNights}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hóspedes do Mês</p>
                  <p className="text-2xl font-bold">{monthlyGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Reservations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximas Reservas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reservas")}>
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {nextReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma reserva futura
                </p>
              ) : (
                <div className="space-y-4">
                  {nextReservations.map((reserva) => (
                    <div
                      key={reserva.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate("/reservas")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{reserva.hospede}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reserva.checkIn), "dd MMM", { locale: pt })} - {reserva.noites} noites
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{reserva.valor}</p>
                        <Badge variant="outline" className="text-xs">
                          {reserva.plataforma}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fiscal Obligations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Obrigações Fiscais Pendentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/calendario-fiscal")}>
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {!fiscalTasks || fiscalTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma obrigação pendente
                </p>
              ) : (
                <div className="space-y-3">
                  {fiscalTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.titulo}</p>
                        <p className="text-sm text-muted-foreground">{task.descricao}</p>
                      </div>
                      <Badge
                        variant={task.prioridade === "alta" ? "destructive" : "secondary"}
                      >
                        {task.prazo}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
