import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  differenceInDays,
  isWithinInterval,
  getDay,
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Phone, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface ReservationCalendarGridProps {
  reservas: Reservation[];
  selectedPropertyId: string;
  onReservationClick: (reserva: Reservation) => void;
}

export function ReservationCalendarGrid({
  reservas,
  selectedPropertyId,
  onReservationClick,
}: ReservationCalendarGridProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter reservations for the selected property and visible in current month
  const visibleReservations = useMemo(() => {
    return reservas.filter((reserva) => {
      if (reserva.propertyId !== selectedPropertyId) return false;
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);
      // Check if reservation overlaps with current month
      return (
        isWithinInterval(monthStart, { start: checkIn, end: checkOut }) ||
        isWithinInterval(monthEnd, { start: checkIn, end: checkOut }) ||
        isWithinInterval(checkIn, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(checkOut, { start: monthStart, end: monthEnd })
      );
    });
  }, [reservas, selectedPropertyId, monthStart, monthEnd]);

  const getPlatformInfo = (plataforma: string) => {
    const normalized = plataforma?.toLowerCase() || "";
    if (normalized.includes("airbnb")) {
      return {
        bg: "bg-[#FF5A5F]",
        border: "border-[#FF5A5F]",
        icon: "/logos/airbnb.svg",
        label: "Airbnb",
        textColor: "text-white",
      };
    }
    if (normalized.includes("booking")) {
      return {
        bg: "bg-[#003580]",
        border: "border-[#003580]",
        icon: "/logos/booking.svg",
        label: "B",
        textColor: "text-white",
      };
    }
    return {
      bg: "bg-primary",
      border: "border-primary",
      icon: null,
      label: "D",
      textColor: "text-primary-foreground",
    };
  };

  // Calculate position and width for each reservation bar
  const getReservationPosition = (reserva: Reservation) => {
    const checkIn = parseISO(reserva.checkIn);
    const checkOut = parseISO(reserva.checkOut);

    // Clamp dates to current month
    const visibleStart = checkIn < monthStart ? monthStart : checkIn;
    const visibleEnd = checkOut > monthEnd ? monthEnd : checkOut;

    const startDay = visibleStart.getDate();
    const endDay = visibleEnd.getDate();
    const span = endDay - startDay + 1;

    const startsBeforeMonth = checkIn < monthStart;
    const endsAfterMonth = checkOut > monthEnd;

    return {
      startDay,
      span,
      startsBeforeMonth,
      endsAfterMonth,
      checkIn,
      checkOut,
    };
  };

  // Group reservations by row to avoid overlaps
  const reservationRows = useMemo(() => {
    const rows: Reservation[][] = [];

    visibleReservations.forEach((reserva) => {
      const pos = getReservationPosition(reserva);
      const reservaEnd = pos.startDay + pos.span - 1;

      // Find a row where this reservation fits
      let placed = false;
      for (const row of rows) {
        const hasConflict = row.some((existing) => {
          const existingPos = getReservationPosition(existing);
          const existingEnd = existingPos.startDay + existingPos.span - 1;
          return !(reservaEnd < existingPos.startDay || pos.startDay > existingEnd);
        });

        if (!hasConflict) {
          row.push(reserva);
          placed = true;
          break;
        }
      }

      if (!placed) {
        rows.push([reserva]);
      }
    });

    return rows;
  }, [visibleReservations]);

  const ReservationPopover = ({ reserva }: { reserva: Reservation }) => {
    const platform = getPlatformInfo(reserva.plataforma);
    const checkIn = parseISO(reserva.checkIn);
    const checkOut = parseISO(reserva.checkOut);

    return (
      <div className="w-72">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {reserva.hospede
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{reserva.hospede}</h3>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            {reserva.telefone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {reserva.telefone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Status</p>
            <p className="font-medium capitalize">{reserva.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Hóspedes</p>
            <p className="font-medium">{reserva.numHospedes || 1}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Check-in</p>
            <p className="font-medium">{format(checkIn, "dd.MM.yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Check-out</p>
            <p className="font-medium">{format(checkOut, "dd.MM.yyyy")}</p>
          </div>
        </div>

        {reserva.valor && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="font-bold text-lg">€{reserva.valor}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg capitalize">
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
      <CardContent className="p-0">
        {/* Days header */}
        <div
          className="grid border-b bg-muted/20"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))` }}
        >
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayOfWeek = getDay(day);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={day.toISOString()}
                className={`py-2 px-1 text-center border-r last:border-r-0 ${
                  isToday ? "bg-primary/10" : isWeekend ? "bg-muted/40" : ""
                }`}
              >
                <div className={`text-[10px] uppercase ${isWeekend ? "text-muted-foreground" : "text-muted-foreground"}`}>
                  {format(day, "EEE", { locale: pt })}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reservations grid */}
        <div className="relative min-h-[300px]">
          {reservationRows.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Nenhuma reserva neste mês
            </div>
          ) : (
            reservationRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="relative h-12 border-b last:border-b-0"
                style={{ gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))` }}
              >
                {/* Price cells background */}
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))` }}
                >
                  {days.map((day, i) => {
                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                    return (
                      <div
                        key={i}
                        className={`border-r last:border-r-0 ${isWeekend ? "bg-muted/20" : ""}`}
                      />
                    );
                  })}
                </div>

                {/* Reservation bars */}
                {row.map((reserva) => {
                  const pos = getReservationPosition(reserva);
                  const platform = getPlatformInfo(reserva.plataforma);

                  const leftPercent = ((pos.startDay - 1) / days.length) * 100;
                  const widthPercent = (pos.span / days.length) * 100;

                  return (
                    <Popover key={reserva.id}>
                      <PopoverTrigger asChild>
                        <button
                          className={`absolute top-1.5 h-9 flex items-center gap-2 px-3 ${platform.bg} ${platform.textColor} text-sm font-medium shadow-sm hover:opacity-90 transition-all cursor-pointer z-10 ${
                            pos.startsBeforeMonth ? "rounded-l-none" : "rounded-l-full"
                          } ${pos.endsAfterMonth ? "rounded-r-none" : "rounded-r-full"}`}
                          style={{
                            left: `calc(${leftPercent}% + 4px)`,
                            width: `calc(${widthPercent}% - 8px)`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {/* Platform icon */}
                          {platform.icon ? (
                            <img
                              src={platform.icon}
                              alt={platform.label}
                              className="h-4 w-4 object-contain brightness-0 invert shrink-0"
                            />
                          ) : (
                            <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                              {platform.label}
                            </span>
                          )}
                          <span className="truncate">{reserva.hospede}</span>
                          {reserva.valor && (
                            <span className="ml-auto text-xs opacity-90 shrink-0">
                              €{reserva.valor}
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="start"
                        className="w-auto p-4"
                        onClick={() => onReservationClick(reserva)}
                      >
                        <ReservationPopover reserva={reserva} />
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
