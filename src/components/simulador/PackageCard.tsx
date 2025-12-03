import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Service {
  icon: LucideIcon;
  title: string;
}

interface PackageCardProps {
  name: string;
  commission: number;
  services: Service[];
  onAdvance: () => void;
  buttonText: string;
}

export const PackageCard = ({
  name,
  commission,
  services,
  onAdvance,
  buttonText,
}: PackageCardProps) => {
  return (
    <Card className="max-w-2xl mx-auto border-primary/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
          Pacote {name}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl md:text-5xl font-bold text-accent">{commission}%</span>
          <span className="text-muted-foreground ml-2">de comissão</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid gap-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground">{service.title}</span>
              </div>
            );
          })}
        </div>
        
        <Button
          onClick={onAdvance}
          className="w-full mt-8"
          size="lg"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
