import { useState, useMemo, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  getDay,
  differenceInDays,
  isBefore,
  isAfter,
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Phone, Lock, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface Reservation {
  id: string;
  hospede: string;
  checkIn: string;
  checkOut: string;
  plataforma: string;
  status: string;
  numHospedes?: number;
  telefone?: string;
  valor?: number;
  propertyId: string;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
}

interface ReservationCalendarGridProps {
  reservas: Reservation[];
  selectedPropertyId: string;
  onReservationClick: (reserva: Reservation) => void;
  onReservationUpdate?: (id: string, updates: { checkIn: string; checkOut: string }) => void;
}

// Draggable reservation bar component
function DraggableReservationBar({
  reserva,
  startCol,
  span,
  row,
  startsBeforeView,
  endsAfterView,
  platform,
  onReservationClick,
}: {
  reserva: Reservation;
  startCol: number;
  span: number;
  row: number;
  startsBeforeView: boolean;
  endsAfterView: boolean;
  platform: { bg: string; icon: string | null; label: string; textColor: string };
  onReservationClick: (reserva: Reservation) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: reserva.id,
    data: { reserva },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          className={`absolute flex items-center gap-1.5 px-2 h-7 ${platform.bg} ${platform.textColor} text-xs font-medium shadow-sm hover:opacity-90 transition-all cursor-grab active:cursor-grabbing z-10 ${
            startsBeforeView ? "rounded-l-none" : "rounded-l-full"
          } ${endsAfterView ? "rounded-r-none" : "rounded-r-full"} ${
            isDragging ? "opacity-50" : ""
          }`}
          style={{
            top: `${row * 28 + 28}px`,
            left: `${(startCol / 7) * 100}%`,
            width: `${(span / 7) * 100}%`,
          }}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3 w-3 opacity-50 shrink-0" />
          {platform.icon ? (
            <img
              src={platform.icon}
              alt={platform.label}
              className="h-3.5 w-3.5 object-contain brightness-0 invert shrink-0"
            />
          ) : (
            <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">
              {platform.label}
            </span>
          )}
          <span className="truncate">{reserva.hospede}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 p-4" onClick={() => onReservationClick(reserva)}>
        <ReservationPopoverContent reserva={reserva} />
      </PopoverContent>
    </Popover>
  );
}

// Droppable day cell
function DroppableDayCell({
  day,
  isToday,
  isWeekend,
  isCurrentMonth,
  price,
  isDynamicPrice,
  isBlocked,
  onBlock,
  onUnblock,
  children,
}: {
  day: Date;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
  price?: number;
  isDynamicPrice?: boolean;
  isBlocked: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  children?: React.ReactNode;
}) {
  const dateStr = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { date: day },
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          className={`relative min-h-[80px] border-r border-b p-1 transition-colors ${
            !isCurrentMonth ? "bg-muted/30" : ""
          } ${isWeekend ? "bg-muted/20" : ""} ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""} ${
            isBlocked ? "bg-destructive/10" : ""
          } ${isOver ? "bg-primary/20" : ""}`}
        >
          <div className="flex items-start justify-between">
            <span
              className={`text-xs font-medium ${
                isToday ? "text-primary" : !isCurrentMonth ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {format(day, "d")}
            </span>
            {isBlocked && <Lock className="h-3 w-3 text-destructive" />}
          </div>
          {price !== undefined && !isBlocked && (
            <div className={`text-[10px] mt-0.5 font-medium ${isDynamicPrice ? "text-amber-600" : "text-muted-foreground"}`}>
              €{price}
              {isDynamicPrice && <span className="ml-0.5 text-[8px]">✦</span>}
            </div>
          )}
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isBlocked ? (
          <ContextMenuItem onClick={onUnblock} className="text-destructive">
            <X className="h-4 w-4 mr-2" />
            Desbloquear data
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={onBlock}>
            <Lock className="h-4 w-4 mr-2" />
            Bloquear data
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Reservation popover content
function ReservationPopoverContent({ reserva }: { reserva: Reservation }) {
  const checkIn = parseISO(reserva.checkIn);
  const checkOut = parseISO(reserva.checkOut);

  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {reserva.hospede
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{reserva.hospede}</h3>
          {reserva.telefone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {reserva.telefone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Status</p>
          <p className="font-medium capitalize">{reserva.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Hóspedes</p>
          <p className="font-medium">{reserva.numHospedes || 1}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Check-in</p>
          <p className="font-medium">{format(checkIn, "dd.MM.yyyy")}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Check-out</p>
          <p className="font-medium">{format(checkOut, "dd.MM.yyyy")}</p>
        </div>
      </div>

      {reserva.valor && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="font-bold text-lg">€{reserva.valor}</p>
        </div>
      )}
    </div>
  );
}

export function ReservationCalendarGrid({
  reservas,
  selectedPropertyId,
  onReservationClick,
  onReservationUpdate,
}: ReservationCalendarGridProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [activeReserva, setActiveReserva] = useState<Reservation | null>(null);
  const [basePricePerNight, setBasePricePerNight] = useState<number | undefined>();
  const [dynamicPricing, setDynamicPricing] = useState<{ start_date: string; end_date: string; price_per_night: number }[]>([]);
  
  // Check if date has dynamic pricing
  const hasDynamicPricing = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dynamicPricing.some(
      (rule) => dateStr >= rule.start_date && dateStr <= rule.end_date
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch blocked dates
  useEffect(() => {
    const fetchBlockedDates = async () => {
      if (!selectedPropertyId) return;
      const { data } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("property_id", selectedPropertyId);
      if (data) setBlockedDates(data);
    };
    fetchBlockedDates();
  }, [selectedPropertyId, calendarMonth]);

  // Fetch pricing from direct booking page
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedPropertyId) return;
      const { data: pageData } = await supabase
        .from("direct_booking_pages")
        .select("id, price_per_night")
        .eq("property_id", selectedPropertyId)
        .maybeSingle();
      
      if (pageData) {
        setBasePricePerNight(pageData.price_per_night || undefined);
        
        const { data: dynamicData } = await supabase
          .from("dynamic_pricing")
          .select("start_date, end_date, price_per_night")
          .eq("page_id", pageData.id);
        
        if (dynamicData) setDynamicPricing(dynamicData);
      }
    };
    fetchPricing();
  }, [selectedPropertyId]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = Math.ceil(days.length / 7);

  const getPriceForDate = (date: Date): number | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dynamicRule = dynamicPricing.find(
      (rule) => dateStr >= rule.start_date && dateStr <= rule.end_date
    );
    return dynamicRule?.price_per_night || basePricePerNight;
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.some((b) => b.blocked_date === dateStr);
  };

  const handleBlockDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("blocked_dates")
      .insert({ property_id: selectedPropertyId, blocked_date: dateStr })
      .select()
      .single();
    
    if (error) {
      toast.error("Erro ao bloquear data");
      return;
    }
    if (data) {
      setBlockedDates((prev) => [...prev, data]);
      toast.success("Data bloqueada");
    }
  };

  const handleUnblockDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const blocked = blockedDates.find((b) => b.blocked_date === dateStr);
    if (!blocked) return;

    const { error } = await supabase.from("blocked_dates").delete().eq("id", blocked.id);
    if (error) {
      toast.error("Erro ao desbloquear data");
      return;
    }
    setBlockedDates((prev) => prev.filter((b) => b.id !== blocked.id));
    toast.success("Data desbloqueada");
  };

  const getPlatformInfo = (plataforma: string) => {
    const normalized = plataforma?.toLowerCase() || "";
    if (normalized.includes("airbnb")) {
      return { bg: "bg-[#FF5A5F]", icon: "/logos/airbnb.svg", label: "A", textColor: "text-white" };
    }
    if (normalized.includes("booking")) {
      return { bg: "bg-[#003580]", icon: "/logos/booking.svg", label: "B", textColor: "text-white" };
    }
    return { bg: "bg-primary", icon: null, label: "D", textColor: "text-primary-foreground" };
  };

  // Get reservations visible in this calendar view
  const visibleReservations = useMemo(() => {
    return reservas.filter((reserva) => {
      if (reserva.propertyId !== selectedPropertyId) return false;
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);
      return (
        isWithinInterval(calendarStart, { start: checkIn, end: checkOut }) ||
        isWithinInterval(calendarEnd, { start: checkIn, end: checkOut }) ||
        isWithinInterval(checkIn, { start: calendarStart, end: calendarEnd }) ||
        isWithinInterval(checkOut, { start: calendarStart, end: calendarEnd })
      );
    });
  }, [reservas, selectedPropertyId, calendarStart, calendarEnd]);

  // Group reservations into rows per week to avoid overlaps
  const getReservationsForWeek = (weekStart: Date, weekEnd: Date) => {
    return visibleReservations.filter((reserva) => {
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);
      return (
        isWithinInterval(weekStart, { start: checkIn, end: checkOut }) ||
        isWithinInterval(weekEnd, { start: checkIn, end: checkOut }) ||
        isWithinInterval(checkIn, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(checkOut, { start: weekStart, end: weekEnd })
      );
    });
  };

  const getReservationRowsForWeek = (weekDays: Date[]) => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekReservations = getReservationsForWeek(weekStart, weekEnd);
    
    const rows: { reserva: Reservation; startCol: number; span: number; startsBeforeView: boolean; endsAfterView: boolean }[][] = [];

    weekReservations.forEach((reserva) => {
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);

      const visibleStart = isBefore(checkIn, weekStart) ? weekStart : checkIn;
      const visibleEnd = isAfter(checkOut, weekEnd) ? weekEnd : checkOut;

      const startCol = weekDays.findIndex((d) => isSameDay(d, visibleStart) || isAfter(d, visibleStart) && isBefore(d, visibleEnd));
      const endCol = weekDays.findIndex((d) => isSameDay(d, visibleEnd));
      const actualStartCol = startCol === -1 ? 0 : startCol;
      const actualEndCol = endCol === -1 ? 6 : endCol;
      const span = Math.max(1, actualEndCol - actualStartCol + 1);

      const item = {
        reserva,
        startCol: actualStartCol,
        span,
        startsBeforeView: isBefore(checkIn, weekStart),
        endsAfterView: isAfter(checkOut, weekEnd),
      };

      // Find row without conflict
      let placed = false;
      for (const row of rows) {
        const hasConflict = row.some((existing) => {
          const existingEnd = existing.startCol + existing.span - 1;
          const itemEnd = item.startCol + item.span - 1;
          return !(itemEnd < existing.startCol || item.startCol > existingEnd);
        });
        if (!hasConflict) {
          row.push(item);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([item]);
      }
    });

    return rows;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const reserva = visibleReservations.find((r) => r.id === active.id);
    if (reserva) setActiveReserva(reserva);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveReserva(null);

    if (!over || !onReservationUpdate) return;

    const reserva = visibleReservations.find((r) => r.id === active.id);
    if (!reserva) return;

    const newCheckIn = parseISO(over.id as string);
    const oldCheckIn = parseISO(reserva.checkIn);
    const oldCheckOut = parseISO(reserva.checkOut);
    const duration = differenceInDays(oldCheckOut, oldCheckIn);

    const newCheckOut = new Date(newCheckIn);
    newCheckOut.setDate(newCheckOut.getDate() + duration);

    onReservationUpdate(reserva.id, {
      checkIn: format(newCheckIn, "yyyy-MM-dd"),
      checkOut: format(newCheckOut, "yyyy-MM-dd"),
    });

    toast.success("Reserva movida com sucesso!");
  };

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg capitalize">
            {format(calendarMonth, "MMMM yyyy", { locale: pt })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b bg-muted/20">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {Array.from({ length: weeks }).map((_, weekIndex) => {
            const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
            const reservationRows = getReservationRowsForWeek(weekDays);
            const minHeight = Math.max(80, 28 + reservationRows.length * 28 + 8);

            return (
              <div key={weekIndex} className="relative grid grid-cols-7" style={{ minHeight }}>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                  const price = getPriceForDate(day);
                  const isDynamic = hasDynamicPricing(day);
                  const blocked = isDateBlocked(day);

                  return (
                    <DroppableDayCell
                      key={day.toISOString()}
                      day={day}
                      isToday={isToday}
                      isWeekend={isWeekend}
                      isCurrentMonth={isCurrentMonth}
                      price={price}
                      isDynamicPrice={isDynamic}
                      isBlocked={blocked}
                      onBlock={() => handleBlockDate(day)}
                      onUnblock={() => handleUnblockDate(day)}
                    />
                  );
                })}

                {/* Reservation bars for this week */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="relative h-full pointer-events-auto">
                    {reservationRows.map((row, rowIndex) =>
                      row.map((item) => (
                        <DraggableReservationBar
                          key={item.reserva.id}
                          reserva={item.reserva}
                          startCol={item.startCol}
                          span={item.span}
                          row={rowIndex}
                          startsBeforeView={item.startsBeforeView}
                          endsAfterView={item.endsAfterView}
                          platform={getPlatformInfo(item.reserva.plataforma)}
                          onReservationClick={onReservationClick}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <DragOverlay>
            {activeReserva && (
              <div
                className={`flex items-center gap-1.5 px-2 h-7 ${getPlatformInfo(activeReserva.plataforma).bg} ${getPlatformInfo(activeReserva.plataforma).textColor} text-xs font-medium shadow-lg rounded-full`}
              >
                <GripVertical className="h-3 w-3 opacity-50" />
                <span className="truncate">{activeReserva.hospede}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 p-3 border-t bg-muted/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#003580]" />
            <span>Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5A5F]" />
            <span>Airbnb</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Direto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-destructive" />
            <span>Bloqueado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-600 font-medium">€✦</span>
            <span>Preço Dinâmico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
