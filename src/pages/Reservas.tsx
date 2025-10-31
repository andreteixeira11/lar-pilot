import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { AddReservaDialog } from "@/components/AddReservaDialog";

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
  },
  {
    id: "3",
    hospede: "Pedro Costa",
    checkIn: "2025-11-18",
    checkOut: "2025-11-25",
    noites: 7,
    plataforma: "Airbnb",
    valor: 890,
    status: "pendente",
  },
];

const Reservas = () => {
  const [reservas, setReservas] = useState(mockReservas);

  const handleAddReserva = (novaReserva: any) => {
    setReservas([novaReserva, ...reservas]);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Controlo de Reservas"
        description="Gerir todas as reservas da propriedade"
        actions={<AddReservaDialog onAdd={handleAddReserva} />}
      />

      <div className="grid gap-4">
        {reservas.map((reserva) => (
          <Card key={reserva.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{reserva.hospede}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{reserva.plataforma}</Badge>
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
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    €{reserva.valor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reserva.noites} noites
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-medium">
                    {new Date(reserva.checkIn).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">
                    {new Date(reserva.checkOut).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reservas;
