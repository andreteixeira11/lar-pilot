import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CalendarDays, Users, Moon, Euro } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt, enUS } from "date-fns/locale";

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
}

export default function OwnerReservas() {
  const { owner } = useOwnerAuth();
  const { t, language } = useOwnerLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const dateLocale = language === "pt" ? pt : enUS;

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmada: { label: t("reservations.confirmed"), variant: "default" },
    concluida: { label: t("reservations.completed"), variant: "secondary" },
    cancelada: { label: t("reservations.cancelled"), variant: "destructive" },
    pendente: { label: t("reservations.pending"), variant: "outline" },
  };

  useEffect(() => {
    if (owner?.propertyId) {
      loadReservations();
    }
  }, [owner?.propertyId, selectedPeriod]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (selectedPeriod) {
      case "current":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "last3":
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = endOfMonth(now);
        break;
      default: // all
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  const loadReservations = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const { startDate, endDate } = getDateRange();

      let query = supabase
        .from("reservations")
        .select("*")
        .eq("property_id", owner.propertyId)
        .order("check_in", { ascending: false });

      if (startDate && endDate) {
        query = query
          .gte("check_in", startDate.toISOString().split("T")[0])
          .lte("check_in", endDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

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

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat(language === "pt" ? "pt-PT" : "en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
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

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("dashboard.period")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "pt" ? "Todas" : "All"}</SelectItem>
            <SelectItem value="current">{t("dashboard.currentMonth")}</SelectItem>
            <SelectItem value="last">{t("dashboard.lastMonth")}</SelectItem>
            <SelectItem value="last3">{t("dashboard.last3Months")}</SelectItem>
            <SelectItem value="year">{t("dashboard.thisYear")}</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Reservations Table */}
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
                          {formatCurrency(reservation.total_price)}
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
    </div>
  );
}
