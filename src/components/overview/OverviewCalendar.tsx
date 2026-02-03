import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isWithinInterval } from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Property {
  id: string;
  name: string;
}

interface Reserva {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  hospede: string;
  status: string;
}

interface OverviewCalendarProps {
  properties: Property[];
  reservas: Reserva[];
}

const PROPERTY_COLORS = [
  "bg-primary",
  "bg-[#FF5A5F]",
  "bg-[#003580]",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export function OverviewCalendar({ properties, reservas }: OverviewCalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const confirmedReservations = reservas.filter(r => r.status === "confirmada");

  const getReservationsForDay = (day: Date) => {
    return confirmedReservations.filter((r) => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      return isWithinInterval(day, { start: checkIn, end: checkOut }) || isSameDay(day, checkIn);
    });
  };

  const getPropertyColor = (propertyId: string) => {
    const index = properties.findIndex(p => p.id === propertyId);
    return PROPERTY_COLORS[index % PROPERTY_COLORS.length];
  };

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || "Propriedade";
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg capitalize min-w-[180px] text-center flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {format(calendarMonth, "MMMM yyyy", { locale: pt })}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {properties.map((property, index) => (
            <div key={property.id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${PROPERTY_COLORS[index % PROPERTY_COLORS.length]}`} />
              <span className="text-xs text-muted-foreground">{property.name}</span>
            </div>
          ))}
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: adjustedStartDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 bg-muted/20 rounded" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const dayReservations = getReservationsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`h-20 border rounded p-1 ${
                  isToday ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5 overflow-hidden max-h-[52px]">
                  <TooltipProvider>
                    {dayReservations.slice(0, 3).map((reservation) => (
                      <Tooltip key={reservation.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`text-[10px] text-white px-1 py-0.5 rounded truncate cursor-pointer ${getPropertyColor(reservation.propertyId)}`}
                          >
                            {reservation.hospede.split(" ")[0]}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <div className="text-xs">
                            <p className="font-semibold">{reservation.hospede}</p>
                            <p className="text-muted-foreground">{getPropertyName(reservation.propertyId)}</p>
                            <p className="text-muted-foreground">
                              {format(new Date(reservation.checkIn), "dd/MM")} - {format(new Date(reservation.checkOut), "dd/MM")}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {dayReservations.length > 3 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 cursor-pointer">
                            +{dayReservations.length - 3}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px]">
                          <div className="space-y-1">
                            {dayReservations.slice(3).map((reservation) => (
                              <div key={reservation.id} className="text-xs">
                                <span className="font-semibold">{reservation.hospede}</span>
                                <span className="text-muted-foreground"> - {getPropertyName(reservation.propertyId)}</span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
