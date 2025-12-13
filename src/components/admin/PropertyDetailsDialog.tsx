import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Users, Bed, Bath, Calendar, Euro, Clock, Wifi, Car } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          </div>

          <Separator />

          {/* Capacity */}
          <div>
            <h4 className="font-medium mb-3">Capacidade</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Hóspedes</p>
                  <p className="font-medium">{property.capacity || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Bed className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="font-medium">{property.bedrooms || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Bath className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Casas de banho</p>
                  <p className="font-medium">{property.bathrooms || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Check-in/out Times */}
          <div>
            <h4 className="font-medium mb-3">Horários</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{property.check_in_time || "15:00"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{property.check_out_time || "11:00"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h4 className="font-medium mb-3">Comodidades</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> WiFi Password
                </p>
                <p>{property.wifi_password || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" /> Estacionamento
                </p>
                <p>{property.parking_info || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <h4 className="font-medium mb-3">Estatísticas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold text-primary">{stats?.count || 0}</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">€{(stats?.revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estado Plataforma</p>
              {getStatusBadge(property.platform_status)}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Região</p>
              <p className="capitalize">{property.region || "Continental"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Validade Seguro</p>
              <p>{property.insurance_validity ? format(new Date(property.insurance_validity), "dd/MM/yyyy", { locale: pt }) : "-"}</p>
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
