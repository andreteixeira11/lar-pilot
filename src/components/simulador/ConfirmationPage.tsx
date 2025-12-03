import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmationPageProps {
  packageName: string;
  totalCommission: number;
  onBackToHome: () => void;
}

export const ConfirmationPage = ({
  packageName,
  totalCommission,
  onBackToHome,
}: ConfirmationPageProps) => {
  return (
    <div className="max-w-xl mx-auto text-center">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-12 pb-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Proposta Enviada com Sucesso!
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Obrigado pelo seu interesse no nosso serviço de gestão de alojamento local.
            A nossa equipa irá analisar a sua proposta e entraremos em contacto consigo
            dentro de 24 a 48 horas.
          </p>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-4">Resumo da Proposta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pacote Selecionado</span>
                <span className="font-medium">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comissão Total</span>
                <span className="font-medium text-primary">{totalCommission}%</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left bg-primary/5 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-3">Próximos Passos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>A nossa equipa irá rever os detalhes da sua propriedade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Receberá uma proposta detalhada por email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Agendaremos uma visita à propriedade se necessário</span>
              </li>
            </ul>
          </div>

          <Button onClick={onBackToHome} size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
