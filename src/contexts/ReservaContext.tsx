import { createContext, useContext, useState, ReactNode } from "react";

export interface Reserva {
  id: string;
  hospede: string;
  checkIn: string;
  checkOut: string;
  noites: number;
  plataforma: string;
  valor: number;
  status: string;
  propertyId: string;
  nrHospedes: number;
  paisOrigem: string;
}

interface ReservaContextType {
  reservas: Reserva[];
  addReserva: (reserva: Reserva) => void;
  getReservasByProperty: (propertyId: string) => Reserva[];
}

const ReservaContext = createContext<ReservaContextType | undefined>(undefined);

const mockReservas: Reserva[] = [
  {
    id: "1",
    hospede: "João Silva",
    checkIn: "2025-01-15",
    checkOut: "2025-01-20",
    noites: 5,
    plataforma: "Airbnb",
    valor: 650,
    status: "confirmada",
    propertyId: "1",
    nrHospedes: 2,
    paisOrigem: "Portugal",
  },
  {
    id: "2",
    hospede: "Maria Santos",
    checkIn: "2025-01-22",
    checkOut: "2025-01-25",
    noites: 3,
    plataforma: "Booking",
    valor: 420,
    status: "confirmada",
    propertyId: "1",
    nrHospedes: 4,
    paisOrigem: "Espanha",
  },
  {
    id: "3",
    hospede: "Pedro Costa",
    checkIn: "2025-02-18",
    checkOut: "2025-02-25",
    noites: 7,
    plataforma: "Airbnb",
    valor: 890,
    status: "confirmada",
    propertyId: "1",
    nrHospedes: 3,
    paisOrigem: "França",
  },
  {
    id: "4",
    hospede: "Ana Ferreira",
    checkIn: "2025-03-05",
    checkOut: "2025-03-12",
    noites: 7,
    plataforma: "Booking",
    valor: 980,
    status: "confirmada",
    propertyId: "1",
    nrHospedes: 2,
    paisOrigem: "Alemanha",
  },
];

export const ReservaProvider = ({ children }: { children: ReactNode }) => {
  const [reservas, setReservas] = useState<Reserva[]>(() => {
    const stored = localStorage.getItem("reservas");
    return stored ? JSON.parse(stored) : mockReservas;
  });

  const addReserva = (reserva: Reserva) => {
    const updated = [reserva, ...reservas];
    setReservas(updated);
    localStorage.setItem("reservas", JSON.stringify(updated));
  };

  const getReservasByProperty = (propertyId: string) => {
    return reservas.filter((r) => r.propertyId === propertyId);
  };

  return (
    <ReservaContext.Provider
      value={{
        reservas,
        addReserva,
        getReservasByProperty,
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
};

export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error("useReserva must be used within ReservaProvider");
  }
  return context;
};
