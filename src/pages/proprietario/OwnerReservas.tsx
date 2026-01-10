import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, Users, Moon, Euro, LayoutGrid, List } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { OwnerReservationCalendar } from "@/components/proprietario/OwnerReservationCalendar";

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

export default function OwnerReservas() {
  const { owner } = useOwnerAuth();
  const { t, language, formatCurrency } = useOwnerLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [availableYears, setAvailableYears] = useState<string[]>([new Date().getFullYear().toString()]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

  const dateLocale = language === "pt" ? pt : enUS;

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmada: { label: t("reservations.confirmed"), variant: "default" },
    concluida: { label: t("reservations.completed"), variant: "secondary" },
    cancelada: { label: t("reservations.cancelled"), variant: "destructive" },
    pendente: { label: t("reservations.pending"), variant: "outline" },
  };

  const months = language === "pt" 
    ? ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    if (owner?.propertyId) {
      loadAvailableYears();
    }
  }, [owner?.propertyId]);

  useEffect(() => {
    if (owner?.propertyId) {
      loadReservations();
    }
  }, [owner?.propertyId, selectedYear, selectedMonth]);

  const loadAvailableYears = async () => {
    if (!owner?.propertyId) return;
    
    const { data: reservationsData } = await supabase
      .from("reservations")
      .select("check_in")
      .eq("property_id", owner.propertyId);
    
    if (reservationsData && reservationsData.length > 0) {
      const yearsSet = new Set<string>();
      reservationsData.forEach(r => {
        const year = new Date(r.check_in).getFullYear().toString();
        yearsSet.add(year);
      });
      // Always include current year
      yearsSet.add(new Date().getFullYear().toString());
      const sortedYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(sortedYears);
    }
  };

  const getDateRange = () => {
    const year = parseInt(selectedYear);
    
    if (selectedMonth === "all") {
      return {
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
      };
    }
    
    const month = parseInt(selectedMonth) - 1;
    return {
      startDate: startOfMonth(new Date(year, month)),
      endDate: endOfMonth(new Date(year, month)),
    };
  };

  const loadReservations = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const { startDate, endDate } = getDateRange();

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", owner.propertyId)
        .gte("check_in", startDate.toISOString().split("T")[0])
        .lte("check_in", endDate.toISOString().split("T")[0])
        .order("check_in", { ascending: false });

      if (error) {
        console.error("Error loading reservations:", error);
        return;
      }

      setReservations(data || []);
    } catch (err) {
      console.error("Reservations error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: dateLocale });
  };

  // Summary stats
  const totalReservations = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status === "confirmada" || r.status === "concluida").length;
  const totalNights = reservations.reduce((sum, r) => sum + (r.num_nights || 0), 0);
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_price || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("reservations.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("reservations.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* View mode toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === "calendar" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder={language === "pt" ? "Ano" : "Year"} />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={language === "pt" ? "Mês" : "Month"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "pt" ? "Todos" : "All"}</SelectItem>
              {months.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t("reservations.title")}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalReservations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t("reservations.confirmed")}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t("reservations.nights")}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalNights}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t("dashboard.revenue")}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && owner?.propertyId && (
        <OwnerReservationCalendar
          propertyId={owner.propertyId}
          reservations={reservations}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>{language === "pt" ? "Lista de Reservas" : "Reservation List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : reservations.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("reservations.noReservations")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reservations.checkIn")}</TableHead>
                      <TableHead>{t("reservations.checkOut")}</TableHead>
                      <TableHead className="text-center">{t("reservations.nights")}</TableHead>
                      <TableHead className="text-center">{t("reservations.guest")}</TableHead>
                      <TableHead className="text-right">{t("reservations.value")}</TableHead>
                      <TableHead>{t("reservations.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => {
                      const status = statusLabels[reservation.status] || statusLabels.pendente;
                      return (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {formatDate(reservation.check_in)}
                          </TableCell>
                          <TableCell>{formatDate(reservation.check_out)}</TableCell>
                          <TableCell className="text-center">
                            {reservation.num_nights}
                          </TableCell>
                          <TableCell className="text-center">
                            {reservation.num_guests}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(reservation.total_price || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
