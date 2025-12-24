import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, List, CalendarDays } from "lucide-react";
import { AddReservaDialog } from "@/components/AddReservaDialog";
import { EditReservaDialog } from "@/components/EditReservaDialog";
import { ReservaDetailsDialog } from "@/components/ReservaDetailsDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Reservas = () => {
  const { selectedPropertyId } = useProperty();
  const { reservas, addReserva, updateReserva, deleteReserva } = useReserva();
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterYear, setFilterYear] = useState("2025");
  const [filterMonth, setFilterMonth] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

  const handleAddReserva = (novaReserva: any) => {
    addReserva({ ...novaReserva, propertyId: selectedPropertyId });
  };

  const handleReservaClick = (reserva: any) => {
    setSelectedReserva(reserva);
    setDetailsOpen(true);
  };

  const handleEditReserva = (reserva: any) => {
    setSelectedReserva(reserva);
    setEditOpen(true);
  };

  const handleUpdateReserva = (id: string, updatedData: any) => {
    updateReserva(id, updatedData);
  };

  const handleDeleteReserva = (reservaId: string) => {
    deleteReserva(reservaId);
    toast.success("Reserva excluída com sucesso!");
  };

  const filteredReservas = reservas.filter((reserva) => {
    const matchesProperty = reserva.propertyId === selectedPropertyId;
    const matchesPlatform = filterPlatform === "all" || reserva.plataforma === filterPlatform;
    
    const reservaDate = new Date(reserva.checkIn);
    const matchesYear = filterYear === "all" || reservaDate.getFullYear().toString() === filterYear;
    const matchesMonth = filterMonth === "all" || (reservaDate.getMonth() + 1).toString() === filterMonth;
    
    return matchesProperty && matchesPlatform && matchesYear && matchesMonth;
  });

  // Calendar helpers
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getReservationsForDay = (day: Date) => {
    return reservas.filter((reserva) => {
      if (reserva.propertyId !== selectedPropertyId) return false;
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);
      return isWithinInterval(day, { start: checkIn, end: checkOut }) || isSameDay(day, checkIn) || isSameDay(day, checkOut);
    });
  };

  const getPlatformInfo = (plataforma: string) => {
    switch (plataforma) {
      case "Airbnb":
        return { bg: "bg-rose-500", text: "text-white", icon: "/logos/airbnb.svg", label: "Airbnb" };
      case "Booking":
        return { bg: "bg-blue-600", text: "text-white", icon: "/logos/booking.svg", label: "Booking" };
      default:
        return { bg: "bg-primary", text: "text-primary-foreground", icon: null, label: "Direto" };
    }
  };

  const getReservationStyle = (reserva: any, day: Date) => {
    const checkIn = parseISO(reserva.checkIn);
    const checkOut = parseISO(reserva.checkOut);
    const isStart = isSameDay(day, checkIn);
    const isEnd = isSameDay(day, checkOut);
    const platform = getPlatformInfo(reserva.plataforma);
    
    return {
      className: `${platform.bg} ${platform.text} ${isStart ? "rounded-l-lg ml-1" : ""} ${isEnd ? "rounded-r-lg mr-1" : ""} px-1.5 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity`,
      isStart,
      isEnd,
      platform,
    };
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Controlo de Reservas"
        description="Gerir todas as reservas da propriedade"
        actions={
          <div className="flex gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-none"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
            <AddReservaDialog onAdd={handleAddReserva} />
          </div>
        }
      />

      {viewMode === "list" && (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Plataforma</label>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Direto">Direto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ano</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Mês</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 mt-6">
            {filteredReservas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma reserva encontrada com os filtros selecionados
                </CardContent>
              </Card>
            ) : (
              filteredReservas.map((reserva) => (
                <Card 
                  key={reserva.id} 
                  className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => handleReservaClick(reserva)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base md:text-lg truncate">{reserva.hospede}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {reserva.plataforma === "Airbnb" && (
                              <img src="/logos/airbnb.svg" alt="Airbnb" className="h-5 w-auto" />
                            )}
                            {reserva.plataforma === "Booking" && (
                              <img src="/logos/booking.svg" alt="Booking.com" className="h-5 w-auto" />
                            )}
                            {reserva.plataforma === "Direto" && (
                              <Badge variant="outline">Direto</Badge>
                            )}
                            <Badge
                              variant={
                                reserva.status === "confirmada" ? "default" : "secondary"
                              }
                            >
                              {reserva.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-xl md:text-2xl font-bold text-foreground">
                          €{reserva.valor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reserva.noites} noites
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="font-medium">
                          {new Date(reserva.checkIn).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="font-medium">
                          {new Date(reserva.checkOut).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {viewMode === "calendar" && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg min-w-[180px] text-center">
                {format(calendarMonth, "MMMM yyyy", { locale: pt })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {/* Empty cells for days before month start */}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-lg" />
              ))}
              {days.map((day) => {
                const dayReservations = getReservationsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`h-24 border rounded-lg p-1 overflow-hidden ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isToday ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1 overflow-hidden flex-1">
                      {dayReservations.slice(0, 2).map((reserva) => {
                        const style = getReservationStyle(reserva, day);
                        return (
                          <div
                            key={reserva.id}
                            className={style.className}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReservaClick(reserva);
                            }}
                            title={`${reserva.hospede} - ${reserva.plataforma}`}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              {style.isStart && (
                                <span className="font-medium text-[10px] bg-white/20 px-1 rounded">
                                  IN
                                </span>
                              )}
                              {style.isEnd && (
                                <span className="font-medium text-[10px] bg-black/20 px-1 rounded">
                                  OUT
                                </span>
                              )}
                              <span className="truncate flex-1 font-medium">
                                {style.isStart ? reserva.hospede : (style.isEnd ? reserva.hospede : "")}
                              </span>
                              {style.platform.icon && style.isStart && (
                                <img 
                                  src={style.platform.icon} 
                                  alt={style.platform.label} 
                                  className="h-3 w-3 object-contain brightness-0 invert opacity-80"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {dayReservations.length > 2 && (
                        <div className="text-[10px] text-muted-foreground font-medium">
                          +{dayReservations.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <ReservaDetailsDialog
        reserva={selectedReserva}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEditReserva}
        onDelete={handleDeleteReserva}
      />

      <EditReservaDialog
        reserva={selectedReserva}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={handleUpdateReserva}
      />
    </div>
  );
};

export default Reservas;
