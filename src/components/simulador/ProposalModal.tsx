import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  totalCommission: number;
  selectedServices: string[];
  onSuccess: () => void;
}

export const ProposalModal = ({
  isOpen,
  onClose,
  packageName,
  totalCommission,
  selectedServices,
  onSuccess,
}: ProposalModalProps) => {
  const handleConfirm = () => {
    // Here you would typically send the proposal to the backend
    onClose();
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Confirmar Proposta
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes da sua proposta antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Package Summary */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground">Pacote</span>
              <span className="font-semibold">{packageName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Comissão Total</span>
              <span className="text-2xl font-bold text-primary">
                {totalCommission}%
              </span>
            </div>
          </div>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Serviços Adicionais</h4>
              <ul className="space-y-1">
                {selectedServices.map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms */}
          <p className="text-xs text-muted-foreground">
            Ao confirmar, concorda com os nossos termos e condições. A nossa
            equipa entrará em contacto consigo dentro de 24-48 horas.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Confirmar Proposta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
