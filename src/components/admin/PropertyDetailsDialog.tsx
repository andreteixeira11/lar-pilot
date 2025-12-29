import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Users, Calendar, Euro, TrendingUp, BarChart3, CalendarCheck } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    name: string;
    address: string;
    rnal?: string | null;
    capacity?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    wifi_password?: string | null;
    parking_info?: string | null;
    region?: string | null;
    platform_status?: string | null;
    insurance_validity?: string | null;
    created_at: string;
  } | null;
  stats?: {
    count: number;
    revenue: number;
  } | null;
}

export const PropertyDetailsDialog = ({
  open,
  onOpenChange,
  property,
  stats,
}: PropertyDetailsDialogProps) => {
  // Fetch detailed statistics for this property
  const { data: detailedStats } = useQuery({
    queryKey: ["admin-property-detailed-stats", property?.id],
    queryFn: async () => {
      if (!property?.id) return null;

      // Get all reservations for this property
      const { data: reservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", property.id);

      if (!reservations) return null;

      // Calculate stats
      const totalReservations = reservations.length;
      const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
      const totalNights = reservations.reduce((sum, r) => sum + (r.num_nights || 0), 0);
      const totalGuests = reservations.reduce((sum, r) => sum + (r.num_guests || 0), 0);
      const avgNightsPerReservation = totalReservations > 0 ? Math.round(totalNights / totalReservations * 10) / 10 : 0;
      const avgRevenuePerReservation = totalReservations > 0 ? totalRevenue / totalReservations : 0;
      const avgRevenuePerNight = totalNights > 0 ? totalRevenue / totalNights : 0;

      // Bookings by source
      const bySource: Record<string, { count: number; revenue: number }> = {};
      reservations.forEach((r) => {
        const source = (r.booking_source || "Direto").toLowerCase();
        let normalizedSource = "Direto";
        if (source.includes("airbnb")) normalizedSource = "Airbnb";
        else if (source.includes("booking")) normalizedSource = "Booking";
        
        if (!bySource[normalizedSource]) {
          bySource[normalizedSource] = { count: 0, revenue: 0 };
        }
        bySource[normalizedSource].count++;
        bySource[normalizedSource].revenue += r.total_price || 0;
      });

      // Monthly stats (last 6 months)
      const now = new Date();
      const monthlyStats: { month: string; reservations: number; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthReservations = reservations.filter((r) => {
          const checkIn = new Date(r.check_in);
          return checkIn >= monthStart && checkIn <= monthEnd;
        });

        monthlyStats.push({
          month: format(monthDate, "MMM", { locale: pt }),
          reservations: monthReservations.length,
          revenue: monthReservations.reduce((sum, r) => sum + (r.total_price || 0), 0),
        });
      }

      // Status breakdown
      const statusCounts: Record<string, number> = {};
      reservations.forEach((r) => {
        const status = r.status || "pendente";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return {
        totalReservations,
        totalRevenue,
        totalNights,
        totalGuests,
        avgNightsPerReservation,
        avgRevenuePerReservation,
        avgRevenuePerNight,
        bySource,
        monthlyStats,
        statusCounts,
      };
    },
    enabled: open && !!property?.id,
  });

  if (!property) return null;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case "submetido":
        return <Badge className="bg-yellow-500">Submetido</Badge>;
      default:
        return <Badge variant="outline">Não submetido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {property.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Localização</p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {property.address}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">RNAL</p>
              <p>{property.rnal || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Capacidade</p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {property.capacity || 0} hóspedes
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estado</p>
              {getStatusBadge(property.platform_status)}
            </div>
          </div>

          <Separator />

          {/* Main Statistics */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Estatísticas Gerais
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold text-primary">{detailedStats?.totalReservations || stats?.count || 0}</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-950 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(detailedStats?.totalRevenue || stats?.revenue || 0)}</p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-950 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Noites</p>
                <p className="text-2xl font-bold text-blue-600">{detailedStats?.totalNights || 0}</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-950 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Hóspedes</p>
                <p className="text-2xl font-bold text-purple-600">{detailedStats?.totalGuests || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Average Statistics */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Médias
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Média Noites/Reserva</p>
                <p className="text-lg font-bold">{detailedStats?.avgNightsPerReservation || 0}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Média €/Reserva</p>
                <p className="text-lg font-bold">{formatCurrency(detailedStats?.avgRevenuePerReservation || 0)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Média €/Noite</p>
                <p className="text-lg font-bold">{formatCurrency(detailedStats?.avgRevenuePerNight || 0)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bookings by Platform */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Reservas por Plataforma
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {detailedStats?.bySource && Object.entries(detailedStats.bySource).map(([source, data]) => (
                <div 
                  key={source} 
                  className={`p-3 rounded-lg text-center ${
                    source === "Airbnb" ? "bg-rose-100 dark:bg-rose-950" :
                    source === "Booking" ? "bg-blue-100 dark:bg-blue-950" :
                    "bg-primary/10"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {source === "Airbnb" && <img src="/logos/airbnb.svg" alt="Airbnb" className="h-4" />}
                    {source === "Booking" && <img src="/logos/booking.svg" alt="Booking" className="h-4" />}
                    <span className="text-sm font-medium">{source}</span>
                  </div>
                  <p className="text-lg font-bold">{data.count} reservas</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(data.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Monthly Performance (last 6 months) */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Desempenho Últimos 6 Meses
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {detailedStats?.monthlyStats?.map((month) => (
                <div key={month.month} className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{month.month}</p>
                  <p className="text-sm font-bold">{month.reservations}</p>
                  <p className="text-xs text-green-600">{formatCurrency(month.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Breakdown */}
          <div>
            <h4 className="font-medium mb-3">Estado das Reservas</h4>
            <div className="flex flex-wrap gap-2">
              {detailedStats?.statusCounts && Object.entries(detailedStats.statusCounts).map(([status, count]) => (
                <Badge 
                  key={status} 
                  variant={status === "confirmada" ? "default" : status === "concluida" ? "secondary" : "outline"}
                >
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Região</p>
              <p className="capitalize">{property.region || "Continental"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Criação</p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(property.created_at), "dd/MM/yyyy", { locale: pt })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
