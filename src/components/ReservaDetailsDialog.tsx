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
import { Calendar, User, CreditCard, Users, Pencil, Trash2, Download, Send, Link2, Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Guest {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  localNascimento: string;
  nacionalidade: string;
  localResidencia: string;
  paisResidencia: string;
  tipoDocumento: "cc" | "passaporte";
  numeroDocumento: string;
  paisEmissor: string;
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
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSendingCheckin, setIsSendingCheckin] = useState(false);
  const [portalCopied, setPortalCopied] = useState(false);

  const copyPortalLink = async () => {
    try {
      // Get the checkin_token for this reservation
      const { data } = await supabase
        .from("reservations")
        .select("checkin_token")
        .eq("id", reserva.id)
        .single();
      
      if (data?.checkin_token) {
        const link = `${window.location.origin}/guest/${data.checkin_token}`;
        await navigator.clipboard.writeText(link);
        setPortalCopied(true);
        toast({ title: "Link do portal copiado!" });
        setTimeout(() => setPortalCopied(false), 2000);
      } else {
        toast({ title: "Token não encontrado", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao copiar link", variant: "destructive" });
    }
  };

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

  const handleSendCheckin = async () => {
    setIsSendingCheckin(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-checkin-link", {
        body: { reservationId: reserva.id },
      });

      if (error) throw error;

      toast({
        title: "Link enviado!",
        description: "O link de check-in foi enviado com sucesso para o hóspede",
      });
    } catch (error: any) {
      console.error("Error sending check-in link:", error);
      toast({
        title: "Erro ao enviar link",
        description: error.message || "Não foi possível enviar o link de check-in",
        variant: "destructive",
      });
    } finally {
      setIsSendingCheckin(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Detalhes da Reserva", 14, 20);
    
    // Informações do Hóspede
    doc.setFontSize(12);
    doc.text(`Hóspede: ${reserva.hospede}`, 14, 35);
    doc.text(`Plataforma: ${reserva.plataforma}`, 14, 42);
    doc.text(`Status: ${reserva.status}`, 14, 49);
    
    // Datas
    doc.text("Check-in:", 14, 60);
    doc.text(new Date(reserva.checkIn).toLocaleDateString("pt-PT", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }), 40, 60);
    
    doc.text("Check-out:", 14, 67);
    doc.text(new Date(reserva.checkOut).toLocaleDateString("pt-PT", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }), 40, 67);
    
    doc.text(`Noites: ${reserva.noites}`, 14, 74);
    
    // Informação Financeira
    const financialData = [
      ["Descrição", "Valor"],
      ["Valor Base Estadia", `€${(reserva.valorBaseEstadia || 0).toFixed(2)}`],
      ["IVA Estadia", `€${(reserva.ivaEstadia || 0).toFixed(2)}`],
      ["Total Estadia", `€${((reserva.valorBaseEstadia || 0) + (reserva.ivaEstadia || 0)).toFixed(2)}`],
      ["", ""],
      ["Valor Base Limpeza", `€${(reserva.valorBaseLimpeza || 0).toFixed(2)}`],
      ["IVA Limpeza", `€${(reserva.ivaLimpeza || 0).toFixed(2)}`],
      ["Total Limpeza", `€${((reserva.valorBaseLimpeza || 0) + (reserva.ivaLimpeza || 0)).toFixed(2)}`],
      ["", ""],
      ["Taxa Turística", `€${(reserva.taxaTuristica || 0).toFixed(2)}`],
      ["Valor Total", `€${reserva.valor.toFixed(2)}`],
    ];
    
    if (reserva.comissaoPlataforma && reserva.comissaoPlataforma > 0) {
      financialData.push(
        ["", ""],
        [`Comissão ${reserva.plataforma}`, `-€${reserva.comissaoPlataforma.toFixed(2)}`],
        ["Valor Líquido", `€${(reserva.valor - reserva.comissaoPlataforma).toFixed(2)}`]
      );
    }
    
    autoTable(doc, {
      startY: 85,
      head: [financialData[0]],
      body: financialData.slice(1),
      theme: "grid",
    });
    
    // Hóspedes
    if (reserva.hospedes && reserva.hospedes.length > 0) {
      const lastY = (doc as any).lastAutoTable.finalY || 85;
      doc.text("Hóspedes:", 14, lastY + 15);
      
      const guestsData = reserva.hospedes.map((guest) => [
        guest.nomeCompleto || "Não informado",
        guest.dataNascimento 
          ? new Date(guest.dataNascimento).toLocaleDateString("pt-PT")
          : "Não informado",
        guest.localNascimento || "Não informado",
        guest.nacionalidade || "Não informado",
        guest.localResidencia || "Não informado",
        guest.paisResidencia || "Não informado",
        guest.tipoDocumento === "cc" ? "CC" : "Passaporte",
        guest.numeroDocumento || "Não informado",
        guest.paisEmissor || "Não informado",
      ]);
      
      autoTable(doc, {
        startY: lastY + 20,
        head: [["Nome", "Data Nasc.", "Local Nasc.", "Nacionalidade", "Local Res.", "País Res.", "Tipo Doc.", "Nº Doc.", "País Emissor"]],
        body: guestsData,
        theme: "grid",
        styles: { fontSize: 8 },
      });
    }
    
    doc.save(`reserva-${reserva.hospede}-${reserva.checkIn}.pdf`);
  };

  // Calculate values from total if not provided
  const valorTotalEstadia = reserva.valorBaseEstadia && reserva.ivaEstadia 
    ? (reserva.valorBaseEstadia + reserva.ivaEstadia) 
    : reserva.valor - (reserva.taxaTuristica || 0) - ((reserva.valorBaseLimpeza || 0) + (reserva.ivaLimpeza || 0));
  
  const valorTotalLimpeza = (reserva.valorBaseLimpeza || 0) + (reserva.ivaLimpeza || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSendCheckin}
              disabled={isSendingCheckin}
              className="h-7 text-xs px-2"
            >
              <Send className="h-3 w-3 mr-1" />
              {isSendingCheckin ? "..." : "Check-in"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-7 text-xs px-2"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-7 text-xs px-2"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-7 text-xs px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
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
                {reserva.valorBaseEstadia ? (
                  <>
                    <div className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">Valor Base:</span>
                      <span className="font-medium">€{reserva.valorBaseEstadia.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">IVA:</span>
                      <span className="font-medium">€{(reserva.ivaEstadia || 0).toFixed(2)}</span>
                    </div>
                  </>
                ) : null}
                <div className="flex justify-between text-sm pl-2 font-semibold border-t pt-1">
                  <span>Total Estadia:</span>
                  <span>€{valorTotalEstadia.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Limpeza */}
              {valorTotalLimpeza > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Limpeza</p>
                  {reserva.valorBaseLimpeza ? (
                    <>
                      <div className="flex justify-between text-sm pl-2">
                        <span className="text-muted-foreground">Valor Base:</span>
                        <span className="font-medium">€{reserva.valorBaseLimpeza.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pl-2">
                        <span className="text-muted-foreground">IVA:</span>
                        <span className="font-medium">€{(reserva.ivaLimpeza || 0).toFixed(2)}</span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex justify-between text-sm pl-2 font-semibold border-t pt-1">
                    <span>Total Limpeza:</span>
                    <span>€{valorTotalLimpeza.toFixed(2)}</span>
                  </div>
                </div>
              )}

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
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nome Completo:</p>
                        <p className="font-medium">{guest.nomeCompleto || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data de Nascimento:</p>
                        <p className="font-medium">
                          {guest.dataNascimento
                            ? new Date(guest.dataNascimento).toLocaleDateString("pt-PT")
                            : "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Local de Nascimento:</p>
                        <p className="font-medium">{guest.localNascimento || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nacionalidade:</p>
                        <p className="font-medium">{guest.nacionalidade || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Local de Residência:</p>
                        <p className="font-medium">{guest.localResidencia || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">País de Residência:</p>
                        <p className="font-medium">{guest.paisResidencia || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tipo de Documento:</p>
                        <p className="font-medium">{guest.tipoDocumento === "cc" ? "Cartão de Cidadão" : "Passaporte"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Número do Documento:</p>
                        <p className="font-medium">{guest.numeroDocumento || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">País Emissor:</p>
                        <p className="font-medium">{guest.paisEmissor || "Não informado"}</p>
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