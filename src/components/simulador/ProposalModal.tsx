import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AccommodationFormData } from "./AccommodationInfo";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  totalCommission: number;
  selectedServices: string[];
  formData: AccommodationFormData | null;
  onSuccess: () => void;
}

export const ProposalModal = ({
  isOpen,
  onClose,
  packageName,
  totalCommission,
  selectedServices,
  formData,
  onSuccess,
}: ProposalModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("simulator_leads").insert({
        package_name: packageName,
        total_commission: totalCommission,
        selected_services: selectedServices,
        property_name: formData.propertyName,
        property_type: formData.propertyType,
        address: formData.address,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        owner_name: formData.ownerName,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success("Proposta enviada com sucesso!");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Erro ao enviar proposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A enviar...
              </>
            ) : (
              "Confirmar Proposta"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
