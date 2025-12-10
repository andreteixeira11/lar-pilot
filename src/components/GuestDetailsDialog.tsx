import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Guest {
  id: string;
  nome_completo: string;
  data_nascimento: string | null;
  local_nascimento: string | null;
  nacionalidade: string | null;
  local_residencia: string | null;
  pais_residencia: string;
  tipo_documento: string | null;
  numero_documento: string | null;
  pais_emissor: string | null;
}

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  reservation_guests: Guest[];
}

interface GuestDetailsDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestDetailsDialog = ({
  reservation,
  open,
  onOpenChange,
}: GuestDetailsDialogProps) => {
  if (!reservation) return null;

  const guests = reservation.reservation_guests || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes dos Hóspedes - {reservation.guest_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reservation Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(reservation.check_in).toLocaleDateString("pt-PT")} -{" "}
                {new Date(reservation.check_out).toLocaleDateString("pt-PT")}
              </span>
            </div>
            <Badge variant="outline">
              {reservation.num_guests} hóspede{reservation.num_guests !== 1 ? "s" : ""}
            </Badge>
          </div>

          <Separator />

          {/* Guests List */}
          {guests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum hóspede registado ainda</p>
              <p className="text-sm">Os dados serão preenchidos após o check-in online</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <Card key={guest.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{guest.nome_completo || "Nome não informado"}</p>
                          <p className="text-sm text-muted-foreground">Hóspede {index + 1}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">Data de Nascimento</p>
                          <p className="font-medium">
                            {guest.data_nascimento
                              ? new Date(guest.data_nascimento).toLocaleDateString("pt-PT")
                              : "Não informado"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">Local de Nascimento</p>
                          <p className="font-medium">{guest.local_nascimento || "Não informado"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Nacionalidade</p>
                        <p className="font-medium">{guest.nacionalidade || "Não informado"}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">País de Residência</p>
                        <p className="font-medium">{guest.pais_residencia || "Não informado"}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Local de Residência</p>
                        <p className="font-medium">{guest.local_residencia || "Não informado"}</p>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">Documento</p>
                          <p className="font-medium">
                            {guest.tipo_documento === "cc"
                              ? "CC"
                              : guest.tipo_documento === "passaporte"
                              ? "Passaporte"
                              : guest.tipo_documento || "Não informado"}
                            {guest.numero_documento && ` - ${guest.numero_documento}`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">País Emissor</p>
                        <p className="font-medium">{guest.pais_emissor || "Não informado"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
