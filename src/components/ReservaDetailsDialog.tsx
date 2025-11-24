import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, CreditCard, Users, Pencil, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface Guest {
  id: string;
  nome: string;
  documento: string;
  tipoDocumento: "passaporte" | "cc";
  dataNascimento: string;
  nacionalidade: string;
}

interface Reserva {
  id: string;
  hospede: string;
  checkIn: string;
  checkOut: string;
  plataforma: string;
  valor: number;
  noites: number;
  status: string;
  comissaoPlataforma?: number;
  valorBaseEstadia?: number;
  ivaEstadia?: number;
  valorBaseLimpeza?: number;
  ivaLimpeza?: number;
  taxaTuristica?: number;
  hospedes?: Guest[];
}

interface ReservaDetailsDialogProps {
  reserva: Reserva | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (reserva: Reserva) => void;
  onDelete?: (reservaId: string) => void;
}

export const ReservaDetailsDialog = ({ 
  reserva, 
  open, 
  onOpenChange,
  onEdit,
  onDelete
}: ReservaDetailsDialogProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!reserva) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(reserva);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(reserva.id);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{reserva.hospede}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {reserva.plataforma === "Airbnb" && (
                    <img src="/logos/airbnb.svg" alt="Airbnb" className="h-5 w-auto" />
                  )}
                  {reserva.plataforma === "Booking" && (
                    <img src="/logos/booking.svg" alt="Booking.com" className="h-5 w-auto" />
                  )}
                  {reserva.plataforma === "Direto" && (
                    <Badge variant="outline">Direto</Badge>
                  )}
                  <Badge variant={reserva.status === "confirmada" ? "default" : "secondary"}>
                    {reserva.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">€{reserva.valor.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{reserva.noites} noites</p>
            </div>
          </div>

          <Separator />

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {new Date(reserva.checkIn).toLocaleDateString("pt-PT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  Check-out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {new Date(reserva.checkOut).toLocaleDateString("pt-PT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Valores Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informação Financeira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Estadia */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Estadia</p>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-muted-foreground">Valor Base:</span>
                  <span className="font-medium">€{(reserva.valorBaseEstadia || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-muted-foreground">IVA:</span>
                  <span className="font-medium">€{(reserva.ivaEstadia || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pl-2 font-semibold border-t pt-1">
                  <span>Total Estadia:</span>
                  <span>€{((reserva.valorBaseEstadia || 0) + (reserva.ivaEstadia || 0)).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Limpeza */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Limpeza</p>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-muted-foreground">Valor Base:</span>
                  <span className="font-medium">€{(reserva.valorBaseLimpeza || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-muted-foreground">IVA:</span>
                  <span className="font-medium">€{(reserva.ivaLimpeza || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pl-2 font-semibold border-t pt-1">
                  <span>Total Limpeza:</span>
                  <span>€{((reserva.valorBaseLimpeza || 0) + (reserva.ivaLimpeza || 0)).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Taxa Turística */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa Turística:</span>
                <span className="font-medium">€{(reserva.taxaTuristica || 0).toFixed(2)}</span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-base bg-primary/5 p-2 rounded">
                <span className="font-semibold">Valor Total:</span>
                <span className="font-bold text-primary">€{reserva.valor.toFixed(2)}</span>
              </div>

              {reserva.comissaoPlataforma && reserva.comissaoPlataforma > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Comissão {reserva.plataforma}:</span>
                    <span className="font-semibold text-destructive">
                      -€{reserva.comissaoPlataforma.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base bg-green-500/10 p-2 rounded">
                    <span className="font-semibold">Valor Líquido:</span>
                    <span className="font-bold text-green-600">
                      €{(reserva.valor - reserva.comissaoPlataforma).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Hóspedes */}
          {reserva.hospedes && reserva.hospedes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hóspedes ({reserva.hospedes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reserva.hospedes.map((guest, index) => (
                  <div key={guest.id} className="space-y-2">
                    {index > 0 && <Separator />}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nome:</p>
                        <p className="font-medium">{guest.nome || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nacionalidade:</p>
                        <p className="font-medium">{guest.nacionalidade || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Documento:</p>
                        <p className="font-medium">
                          {guest.tipoDocumento === "cc" ? "CC" : "Passaporte"}: {guest.documento || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data de Nascimento:</p>
                        <p className="font-medium">
                          {guest.dataNascimento
                            ? new Date(guest.dataNascimento).toLocaleDateString("pt-PT")
                            : "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A reserva de <strong>{reserva.hospede}</strong> será
              permanentemente excluída do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};