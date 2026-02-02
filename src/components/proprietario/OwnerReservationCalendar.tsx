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
  isBefore,
  isAfter,
} from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";

interface Reservation {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_nights: number;
  total_price: number | null;
  status: string;
  booking_source: string | null;
  guest_phone?: string | null;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
}

interface OwnerReservationCalendarProps {
  propertyId: string;
  reservations: Reservation[];
}

export function OwnerReservationCalendar({
  propertyId,
  reservations,
}: OwnerReservationCalendarProps) {
  const { language, formatCurrency } = useOwnerLanguage();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [basePricePerNight, setBasePricePerNight] = useState<number | undefined>();
  const [dynamicPricing, setDynamicPricing] = useState<{ start_date: string; end_date: string; price_per_night: number }[]>([]);

  const dateLocale = language === "pt" ? pt : enUS;
  const dayLabels = language === "pt" 
    ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Fetch blocked dates
  useEffect(() => {
    const fetchBlockedDates = async () => {
      if (!propertyId) return;
      const { data } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("property_id", propertyId);
      if (data) setBlockedDates(data);
    };
    fetchBlockedDates();
  }, [propertyId, calendarMonth]);

  // Fetch pricing from direct booking page
  useEffect(() => {
    const fetchPricing = async () => {
      if (!propertyId) return;
      const { data: pageData } = await supabase
        .from("direct_booking_pages")
        .select("id, price_per_night")
        .eq("property_id", propertyId)
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
  }, [propertyId]);

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

  const hasDynamicPricing = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dynamicPricing.some(
      (rule) => dateStr >= rule.start_date && dateStr <= rule.end_date
    );
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.some((b) => b.blocked_date === dateStr);
  };

  const getPlatformInfo = (plataforma: string | null) => {
    const normalized = plataforma?.toLowerCase() || "";
    if (normalized.includes("airbnb")) {
      return { bg: "bg-[#FF5A5F]", icon: "/logos/airbnb.svg", label: "A", textColor: "text-white" };
    }
    if (normalized.includes("booking")) {
      return { bg: "bg-[#003580]", icon: "/logos/booking.svg", label: "B", textColor: "text-white" };
    }
    return { bg: "bg-primary", icon: null, label: "D", textColor: "text-primary-foreground" };
  };

  // Convert reservations to calendar format
  const calendarReservations = useMemo(() => {
    return reservations.map((r) => ({
      id: r.id,
      hospede: r.guest_name,
      checkIn: r.check_in,
      checkOut: r.check_out,
      plataforma: r.booking_source || "",
      status: r.status,
      numHospedes: r.num_guests,
      telefone: r.guest_phone,
      valor: r.total_price,
    }));
  }, [reservations]);

  // Get reservations visible in this calendar view
  const visibleReservations = useMemo(() => {
    return calendarReservations.filter((reserva) => {
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);
      return (
        isWithinInterval(calendarStart, { start: checkIn, end: checkOut }) ||
        isWithinInterval(calendarEnd, { start: checkIn, end: checkOut }) ||
        isWithinInterval(checkIn, { start: calendarStart, end: calendarEnd }) ||
        isWithinInterval(checkOut, { start: calendarStart, end: calendarEnd })
      );
    });
  }, [calendarReservations, calendarStart, calendarEnd]);

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
    
    const rows: { reserva: typeof calendarReservations[0]; startCol: number; span: number; startsBeforeView: boolean; endsAfterView: boolean }[][] = [];

    weekReservations.forEach((reserva) => {
      const checkIn = parseISO(reserva.checkIn);
      const checkOut = parseISO(reserva.checkOut);

      const visibleStart = isBefore(checkIn, weekStart) ? weekStart : checkIn;
      const visibleEnd = isAfter(checkOut, weekEnd) ? weekEnd : checkOut;

      const startCol = weekDays.findIndex((d) => isSameDay(d, visibleStart) || (isAfter(d, visibleStart) && isBefore(d, visibleEnd)));
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg capitalize min-w-[180px] text-center">
            {format(calendarMonth, "MMMM yyyy", { locale: dateLocale })}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-muted/20">
          {dayLabels.map((day) => (
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
                  <div
                    key={day.toISOString()}
                    className={`relative min-h-[80px] border-r border-b p-1 transition-colors ${
                      !isCurrentMonth ? "bg-muted/30" : ""
                    } ${isWeekend ? "bg-muted/20" : ""} ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""} ${
                      blocked ? "bg-destructive/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-xs font-medium ${
                          isToday ? "text-primary" : !isCurrentMonth ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {blocked && <Lock className="h-3 w-3 text-destructive" />}
                    </div>
                    {price !== undefined && !blocked && (
                      <div className={`text-[10px] mt-0.5 font-medium ${isDynamic ? "text-amber-600" : "text-muted-foreground"}`}>
                        {formatCurrency(price)}
                        {isDynamic && <span className="ml-0.5 text-[8px]">✦</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Reservation bars for this week */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative h-full pointer-events-auto">
                  {reservationRows.map((row, rowIndex) =>
                    row.map((item) => {
                      const platform = getPlatformInfo(item.reserva.plataforma);
                      const checkIn = parseISO(item.reserva.checkIn);
                      const checkOut = parseISO(item.reserva.checkOut);

                      return (
                        <Popover key={item.reserva.id}>
                          <PopoverTrigger asChild>
                            <div
                              className={`absolute flex items-center gap-1.5 px-2 h-7 ${platform.bg} ${platform.textColor} text-xs font-medium shadow-sm hover:opacity-90 transition-all cursor-pointer z-10 ${
                                item.startsBeforeView ? "rounded-l-none" : "rounded-l-full"
                              } ${item.endsAfterView ? "rounded-r-none" : "rounded-r-full"}`}
                              style={{
                                top: `${rowIndex * 28 + 28}px`,
                                left: `${(item.startCol / 7) * 100}%`,
                                width: `${(item.span / 7) * 100}%`,
                              }}
                            >
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
                              <span className="truncate">{item.reserva.hospede}</span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-72 p-4">
                            <div>
                              <div className="flex items-start gap-3 mb-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                    {item.reserva.hospede
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground truncate">{item.reserva.hospede}</h3>
                                  {item.reserva.telefone && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {item.reserva.telefone}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Status</p>
                                  <p className="font-medium capitalize">{item.reserva.status}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
                                    {language === "pt" ? "Hóspedes" : "Guests"}
                                  </p>
                                  <p className="font-medium">{item.reserva.numHospedes || 1}</p>
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

                              {item.reserva.valor && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                                  <p className="font-bold text-lg">{formatCurrency(item.reserva.valor)}</p>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}

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
            <span>{language === "pt" ? "Direto" : "Direct"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-destructive" />
            <span>{language === "pt" ? "Bloqueado" : "Blocked"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-600 font-medium">€✦</span>
            <span>{language === "pt" ? "Preço Dinâmico" : "Dynamic Price"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
