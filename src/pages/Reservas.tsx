import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { AddReservaDialog } from "@/components/AddReservaDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperty } from "@/contexts/PropertyContext";

const mockReservas = [
  {
    id: "1",
    hospede: "João Silva",
    checkIn: "2025-11-05",
    checkOut: "2025-11-10",
    noites: 5,
    plataforma: "Airbnb",
    valor: 650,
    status: "confirmada",
    propertyId: "1",
  },
  {
    id: "2",
    hospede: "Maria Santos",
    checkIn: "2025-11-12",
    checkOut: "2025-11-15",
    noites: 3,
    plataforma: "Booking",
    valor: 420,
    status: "confirmada",
    propertyId: "1",
  },
  {
    id: "3",
    hospede: "Pedro Costa",
    checkIn: "2025-02-18",
    checkOut: "2025-02-25",
    noites: 7,
    plataforma: "Airbnb",
    valor: 890,
    status: "pendente",
    propertyId: "2",
  },
];

const Reservas = () => {
  const [reservas, setReservas] = useState(mockReservas);
  const { selectedPropertyId } = useProperty();
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterYear, setFilterYear] = useState("2025");
  const [filterMonth, setFilterMonth] = useState("all");

  const handleAddReserva = (novaReserva: any) => {
    setReservas([novaReserva, ...reservas]);
  };

  const filteredReservas = reservas.filter((reserva) => {
    const matchesProperty = selectedPropertyId === "all" || reserva.propertyId === selectedPropertyId;
    const matchesPlatform = filterPlatform === "all" || reserva.plataforma === filterPlatform;
    
    const reservaDate = new Date(reserva.checkIn);
    const matchesYear = filterYear === "all" || reservaDate.getFullYear().toString() === filterYear;
    const matchesMonth = filterMonth === "all" || (reservaDate.getMonth() + 1).toString() === filterMonth;
    
    return matchesProperty && matchesPlatform && matchesYear && matchesMonth;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Controlo de Reservas"
        description="Gerir todas as reservas da propriedade"
        actions={<AddReservaDialog onAdd={handleAddReserva} />}
      />

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
            <Card key={reserva.id} className="hover:shadow-md transition-shadow">
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
    </div>
  );
};

export default Reservas;
