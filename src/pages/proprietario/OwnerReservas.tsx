import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
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
import { pt } from "date-fns/locale";

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

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmada: { label: "Confirmada", variant: "default" },
  concluida: { label: "Concluída", variant: "secondary" },
  cancelada: { label: "Cancelada", variant: "destructive" },
  pendente: { label: "Pendente", variant: "outline" },
};

export default function OwnerReservas() {
  const { owner } = useOwnerAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: pt });
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as reservas da sua propriedade
          </p>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="current">Mês Atual</SelectItem>
            <SelectItem value="last">Mês Anterior</SelectItem>
            <SelectItem value="last3">Últimos 3 Meses</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Reservas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalReservations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Confirmadas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Noites</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalNights}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Receita</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              A carregar...
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sem reservas neste período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-center">Noites</TableHead>
                    <TableHead className="text-center">Hóspedes</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Estado</TableHead>
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
