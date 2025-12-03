import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Minus } from "lucide-react";

interface AdditionalService {
  id: string;
  name: string;
  commission: number;
  description: string;
}

const additionalServices: AdditionalService[] = [
  {
    id: "maintenance",
    name: "Manutenção Premium",
    commission: 2,
    description: "Coordenação de reparações urgentes 24/7",
  },
  {
    id: "concierge",
    name: "Serviço Concierge",
    commission: 1.5,
    description: "Experiências personalizadas para hóspedes",
  },
  {
    id: "interior",
    name: "Design de Interiores",
    commission: 1,
    description: "Consultoria de decoração especializada",
  },
  {
    id: "marketing",
    name: "Marketing Premium",
    commission: 1.5,
    description: "Promoção em redes sociais e influencers",
  },
];

interface SimulatorSectionProps {
  baseCommission: number;
  packageName: string;
  onAdvance: (commission: number, services: string[]) => void;
  onBack: () => void;
}

export const SimulatorSection = ({
  baseCommission,
  packageName,
  onAdvance,
  onBack,
}: SimulatorSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const totalCommission = selectedServices.reduce((total, serviceId) => {
    const service = additionalServices.find((s) => s.id === serviceId);
    return total + (service?.commission || 0);
  }, baseCommission);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAdvance = () => {
    const serviceNames = selectedServices.map(
      (id) => additionalServices.find((s) => s.id === id)?.name || ""
    );
    onAdvance(totalCommission, serviceNames);
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <CardTitle className="text-xl md:text-2xl">
              Personalizar Pacote {packageName}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Adicione serviços extras ao seu pacote
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Commission Display */}
        <div className="text-center p-6 bg-primary/5 rounded-xl">
          <span className="text-muted-foreground">Comissão Total</span>
          <div className="text-4xl md:text-5xl font-bold text-primary mt-2">
            {totalCommission}%
          </div>
          <span className="text-sm text-muted-foreground">
            Base: {baseCommission}% + Extras: {totalCommission - baseCommission}%
          </span>
        </div>

        {/* Additional Services */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Serviços Adicionais</h3>
          {additionalServices.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      className="mt-1"
                    />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-semibold">
                    <Plus className="w-4 h-4" />
                    {service.commission}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={handleAdvance} className="w-full" size="lg">
          CONTINUAR
        </Button>
      </CardContent>
    </Card>
  );
};
