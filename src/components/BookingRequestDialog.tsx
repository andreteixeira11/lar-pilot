import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MessageSquare,
  Euro,
  CheckCircle,
  XCircle,
  Loader2 
} from "lucide-react";

interface BookingRequest {
  id: string;
  page_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  message: string | null;
  total_price: number | null;
  status: string;
  created_at: string;
}

interface BookingRequestDialogProps {
  request: BookingRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
}

export function BookingRequestDialog({
  request,
  open,
  onOpenChange,
  propertyId
}: BookingRequestDialogProps) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: "accepted" | "rejected") => {
      if (!request) return;

      const { error } = await supabase
        .from("direct_booking_requests")
        .update({ status: newStatus })
        .eq("id", request.id);

      if (error) throw error;

      // If accepted, create a reservation
      if (newStatus === "accepted" && propertyId) {
        const nights = Math.ceil(
          (new Date(request.check_out).getTime() - new Date(request.check_in).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        const { error: reservationError } = await supabase
          .from("reservations")
          .insert({
            property_id: propertyId,
            guest_name: request.guest_name,
            guest_email: request.guest_email,
            guest_phone: request.guest_phone,
            check_in: request.check_in,
            check_out: request.check_out,
            num_guests: request.num_guests,
            num_nights: nights,
            total_price: request.total_price,
            country_origin: "Portugal",
            booking_source: "Direto",
            status: "confirmada",
            notes: request.message,
          });

        if (reservationError) throw reservationError;
      }

      return newStatus;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success(
        status === "accepted" 
          ? "Reserva aceite e criada com sucesso!" 
          : "Pedido de reserva rejeitado."
      );
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating booking request:", error);
      toast.error("Erro ao processar pedido.");
    },
  });

  const handleAccept = () => {
    updateStatusMutation.mutate("accepted");
  };

  const handleReject = () => {
    updateStatusMutation.mutate("rejected");
  };

  if (!request) return null;

  const checkIn = new Date(request.check_in);
  const checkOut = new Date(request.check_out);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Pedido de Reserva
            <Badge variant={
              request.status === "pending" ? "secondary" : 
              request.status === "accepted" ? "default" : "destructive"
            }>
              {request.status === "pending" ? "Pendente" : 
               request.status === "accepted" ? "Aceite" : "Rejeitado"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Recebido em {format(new Date(request.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Dados do Hóspede</h4>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{request.guest_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${request.guest_email}`} className="text-primary hover:underline">
                  {request.guest_email}
                </a>
              </div>
              {request.guest_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${request.guest_phone}`} className="text-primary hover:underline">
                    {request.guest_phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{request.num_guests} {request.num_guests === 1 ? "hóspede" : "hóspedes"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Datas da Estadia</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Check-in</span>
                </div>
                <p className="font-semibold">
                  {format(checkIn, "d MMM yyyy", { locale: pt })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Check-out</span>
                </div>
                <p className="font-semibold">
                  {format(checkOut, "d MMM yyyy", { locale: pt })}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {nights} {nights === 1 ? "noite" : "noites"}
            </p>
          </div>

          <Separator />

          {/* Price */}
          {request.total_price && (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Total</span>
                </div>
                <span className="text-xl font-bold">€{request.total_price.toFixed(2)}</span>
              </div>
              <Separator />
            </>
          )}

          {/* Message */}
          {request.message && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagem do Hóspede
              </h4>
              <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-line">
                {request.message}
              </p>
            </div>
          )}
        </div>

        {request.status === "pending" && (
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-full"
              onClick={handleReject}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rejeitar
            </Button>
            <Button
              className="w-full sm:w-auto rounded-full"
              onClick={handleAccept}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aceitar Reserva
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}