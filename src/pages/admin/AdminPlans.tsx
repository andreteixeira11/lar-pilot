import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Home, Building2, Crown, Check } from "lucide-react";
import { toast } from "sonner";

interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeature[];
  max_properties: number | null;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

// Default plans (will be used if no plans in DB)
const defaultPlans: Omit<Plan, "id" | "created_at">[] = [
  {
    name: "Basic",
    description: "Para começar",
    price_monthly: 7,
    price_yearly: 79,
    max_properties: 1,
    is_popular: false,
    is_active: true,
    features: [
      { name: "1 propriedade", description: "Gerir uma única propriedade", included: true },
      { name: "Gestão básica de reservas", description: "Controlo de reservas", included: true },
      { name: "Resumo mensal básico", description: "Resumos financeiros simples", included: true },
      { name: "Suporte por email", description: "Resposta em até 48h", included: true },
    ],
  },
  {
    name: "Pro",
    description: "Para quem está a crescer",
    price_monthly: 19,
    price_yearly: 199,
    max_properties: 5,
    is_popular: true,
    is_active: true,
    features: [
      { name: "Até 5 propriedades", description: "Gerir múltiplas propriedades", included: true },
      { name: "Formulários de check-in", description: "Envio automático aos hóspedes", included: true },
      { name: "Taxa turística automática", description: "Cálculo automático", included: true },
      { name: "Calendário Fiscal", description: "Notificações automáticas", included: true },
      { name: "Suporte prioritário", description: "Resposta em até 24h", included: true },
    ],
  },
  {
    name: "Premium",
    description: "Para gestores profissionais",
    price_monthly: 49,
    price_yearly: 499,
    max_properties: null,
    is_popular: false,
    is_active: true,
    features: [
      { name: "Propriedades ilimitadas", description: "Sem limite de propriedades", included: true },
      { name: "Check-in automatizado completo", description: "Sistema completo", included: true },
      { name: "Taxa turística + SIBA (INE)", description: "Envio automático", included: true },
      { name: "Calendário Fiscal completo", description: "Alertas personalizados", included: true },
      { name: "Relatórios personalizados", description: "Análises detalhadas", included: true },
      { name: "Gestor de conta dedicado", description: "Suporte VIP", included: true },
      { name: "API de acesso", description: "Integração avançada", included: true },
    ],
  },
];

const AdminPlans = () => {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: "", description: "" });

  // For now, use local state with default plans since we don't have a plans table
  const [plans, setPlans] = useState<Plan[]>(
    defaultPlans.map((p, i) => ({
      ...p,
      id: `plan-${i}`,
      created_at: new Date().toISOString(),
    }))
  );

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "basic":
        return <Home className="h-5 w-5" />;
      case "pro":
        return <Building2 className="h-5 w-5" />;
      case "premium":
        return <Crown className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setIsDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (!editingPlan) return;

    setPlans((prev) =>
      prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    );
    toast.success("Plano atualizado com sucesso");
    setIsDialogOpen(false);
    setEditingPlan(null);
  };

  const handleAddFeature = () => {
    if (!editingPlan || !newFeature.name) return;
    
    setEditingPlan({
      ...editingPlan,
      features: [
        ...editingPlan.features,
        { ...newFeature, included: true },
      ],
    });
    setNewFeature({ name: "", description: "" });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index),
    });
  };

  const handleToggleActive = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, is_active: !p.is_active } : p
      )
    );
    toast.success("Estado do plano atualizado");
  };

  const handleTogglePopular = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, is_popular: !p.is_popular }
          : { ...p, is_popular: false }
      )
    );
    toast.success("Plano destacado atualizado");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Gestão de Planos"
        description="Configure os planos de subscrição da plataforma"
      />

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative border-2 transition-all ${
              plan.is_popular ? "border-primary shadow-lg" : ""
            } ${!plan.is_active ? "opacity-60" : ""}`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Mais Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                {getIcon(plan.name)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{plan.price_monthly}€</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ou {plan.price_yearly}€/ano
                </p>
              </div>

              <div className="space-y-2">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature.name}</span>
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{plan.features.length - 4} mais funcionalidades
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant={plan.is_active ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleToggleActive(plan.id)}
                >
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Detalhes dos Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Preço Mensal</TableHead>
                <TableHead>Preço Anual</TableHead>
                <TableHead>Max. Propriedades</TableHead>
                <TableHead>Funcionalidades</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.price_monthly}€</TableCell>
                  <TableCell>{plan.price_yearly}€</TableCell>
                  <TableCell>
                    {plan.max_properties ? plan.max_properties : "Ilimitadas"}
                  </TableCell>
                  <TableCell>{plan.features.length}</TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.is_popular}
                      onCheckedChange={() => handleTogglePopular(plan.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano - {editingPlan?.name}</DialogTitle>
          </DialogHeader>

          {editingPlan && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Plano</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={editingPlan.description}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço Mensal (€)</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_monthly}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        price_monthly: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Anual (€)</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_yearly}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        price_yearly: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. Propriedades</Label>
                  <Input
                    type="number"
                    placeholder="Deixe vazio para ilimitado"
                    value={editingPlan.max_properties || ""}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        max_properties: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <Label>Funcionalidades</Label>
                <div className="space-y-2">
                  {editingPlan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add new feature */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da funcionalidade"
                    value={newFeature.name}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Descrição"
                    value={newFeature.description}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, description: e.target.value })
                    }
                  />
                  <Button variant="outline" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>Guardar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlans;
