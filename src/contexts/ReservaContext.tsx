import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

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
  valorBaseEstadia?: number;
  ivaEstadia?: number;
  valorBaseLimpeza?: number;
  ivaLimpeza?: number;
  taxaTuristica?: number;
  comissaoPlataforma?: number;
  hospedes?: any[];
}

interface ReservaContextType {
  reservas: Reserva[];
  addReserva: (reserva: Reserva & { hospedes?: any[] }) => void;
  updateReserva: (id: string, reserva: Partial<Reserva>) => void;
  deleteReserva: (id: string) => void;
  getReservasByProperty: (propertyId: string) => Reserva[];
}

const ReservaContext = createContext<ReservaContextType | undefined>(undefined);

// Dados de exemplo removidos - agora usa dados do Supabase

export const ReservaProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar reservas do Supabase quando user muda
  useEffect(() => {
    if (user) {
      loadReservas();
    } else {
      setReservas([]);
      setLoading(false);
    }
  }, [user]);

  const loadReservas = async () => {
    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user?.id);

      if (!properties) return;

      const propertyIds = properties.map(p => p.id);

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .in('property_id', propertyIds);

      if (error) throw error;

      if (data) {
        const formattedReservas: Reserva[] = data.map(r => ({
          id: r.id,
          hospede: r.guest_name,
          checkIn: r.check_in,
          checkOut: r.check_out,
          noites: r.num_nights,
          plataforma: r.booking_source || 'Direto',
          valor: Number(r.total_price) || 0,
          status: r.status,
          propertyId: r.property_id,
          nrHospedes: r.num_guests,
          paisOrigem: r.country_origin,
        }));
        setReservas(formattedReservas);
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReserva = async (reserva: Reserva & { hospedes?: any[]; guest_email?: string; checkin_token?: string }) => {
    try {
      // Generate token if not provided
      const checkinToken = reserva.checkin_token || crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          property_id: reserva.propertyId,
          guest_name: reserva.hospede,
          guest_email: reserva.guest_email || 'email@example.com',
          check_in: reserva.checkIn,
          check_out: reserva.checkOut,
          num_nights: reserva.noites,
          num_guests: reserva.nrHospedes,
          booking_source: reserva.plataforma,
          country_origin: reserva.paisOrigem,
          total_price: reserva.valor,
          status: reserva.status,
          checkin_token: checkinToken,
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar dados dos hóspedes se existirem
      if (data && reserva.hospedes && reserva.hospedes.length > 0) {
        const guestsData = reserva.hospedes.map(guest => ({
          reservation_id: data.id,
          nome_completo: guest.nomeCompleto || '',
          data_nascimento: guest.dataNascimento || null,
          local_nascimento: guest.localNascimento || null,
          nacionalidade: guest.nacionalidade || null,
          local_residencia: guest.localResidencia || null,
          pais_residencia: guest.paisResidencia || 'Portugal',
          tipo_documento: guest.tipoDocumento || null,
          numero_documento: guest.numeroDocumento || null,
          pais_emissor: guest.paisEmissor || null,
        }));

        const { error: guestsError } = await supabase
          .from('reservation_guests')
          .insert(guestsData);

        if (guestsError) {
          console.error('Erro ao salvar hóspedes:', guestsError);
        }
      }

      if (data) {
        const newReserva: Reserva = {
          id: data.id,
          hospede: data.guest_name,
          checkIn: data.check_in,
          checkOut: data.check_out,
          noites: data.num_nights,
          plataforma: data.booking_source || 'Direto',
          valor: Number(data.total_price) || 0,
          status: data.status,
          propertyId: data.property_id,
          nrHospedes: data.num_guests,
          paisOrigem: data.country_origin,
        };
        setReservas([newReserva, ...reservas]);
        toast.success('Reserva adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      toast.error('Erro ao adicionar reserva');
    }
  };

  const updateReserva = async (id: string, updatedReserva: Partial<Reserva>) => {
    try {
      const updateData: any = {};
      if (updatedReserva.hospede) updateData.guest_name = updatedReserva.hospede;
      if (updatedReserva.checkIn) updateData.check_in = updatedReserva.checkIn;
      if (updatedReserva.checkOut) updateData.check_out = updatedReserva.checkOut;
      if (updatedReserva.noites) updateData.num_nights = updatedReserva.noites;
      if (updatedReserva.nrHospedes) updateData.num_guests = updatedReserva.nrHospedes;
      if (updatedReserva.plataforma) updateData.booking_source = updatedReserva.plataforma;
      if (updatedReserva.paisOrigem) updateData.country_origin = updatedReserva.paisOrigem;
      if (updatedReserva.valor) updateData.total_price = updatedReserva.valor;
      if (updatedReserva.status) updateData.status = updatedReserva.status;

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setReservas(reservas.map((r) =>
        r.id === id ? { ...r, ...updatedReserva } : r
      ));
      toast.success('Reserva atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      toast.error('Erro ao atualizar reserva');
    }
  };

  const deleteReserva = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservas(reservas.filter((r) => r.id !== id));
      toast.success('Reserva excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast.error('Erro ao excluir reserva');
    }
  };

  const getReservasByProperty = (propertyId: string) => {
    return reservas.filter((r) => r.propertyId === propertyId);
  };

  return (
    <ReservaContext.Provider
      value={{
        reservas,
        addReserva,
        updateReserva,
        deleteReserva,
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
