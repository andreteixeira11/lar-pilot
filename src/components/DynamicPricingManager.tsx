import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays, Euro, Pencil, Loader2 } from "lucide-react";
import { format, parseISO, isWithinInterval, eachDayOfInterval, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DynamicPricing {
  id: string;
  page_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  min_nights: number | null;
}

interface DynamicPricingManagerProps {
  pageId: string | undefined;
  defaultPrice: number;
}

export function DynamicPricingManager({ pageId, defaultPrice }: DynamicPricingManagerProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<DynamicPricing | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    name: "",
    price_per_night: "",
    min_nights: "1",
  });

  // Fetch dynamic pricing
  const { data: pricingRules, isLoading } = useQuery({
    queryKey: ["dynamic-pricing", pageId],
    queryFn: async () => {
      if (!pageId) return [];
      
      const { data, error } = await supabase
        .from("dynamic_pricing")
        .select("*")
        .eq("page_id", pageId)
        .order("start_date", { ascending: true });
      
      if (error) throw error;
      return data as DynamicPricing[];
    },
    enabled: !!pageId,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!pageId || !dateRange?.from || !dateRange?.to) {
        throw new Error("Dados incompletos");
      }

      const pricingData = {
        page_id: pageId,
        name: formData.name,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
        price_per_night: parseFloat(formData.price_per_night),
        min_nights: parseInt(formData.min_nights) || 1,
      };

      if (editingPricing) {
        const { error } = await supabase
          .from("dynamic_pricing")
          .update(pricingData)
          .eq("id", editingPricing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("dynamic_pricing")
          .insert(pricingData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-pricing", pageId] });
      toast.success(editingPricing ? "Preço atualizado!" : "Preço adicionado!");
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao guardar preço");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dynamic_pricing")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-pricing", pageId] });
      toast.success("Preço removido!");
    },
    onError: () => {
      toast.error("Erro ao remover preço");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", price_per_night: "", min_nights: "1" });
    setDateRange(undefined);
    setEditingPricing(null);
  };

  const handleEdit = (pricing: DynamicPricing) => {
    setEditingPricing(pricing);
    setFormData({
      name: pricing.name,
      price_per_night: pricing.price_per_night.toString(),
      min_nights: (pricing.min_nights || 1).toString(),
    });
    setDateRange({
      from: parseISO(pricing.start_date),
      to: parseISO(pricing.end_date),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price_per_night || !dateRange?.from || !dateRange?.to) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    saveMutation.mutate();
  };

  // Get all pricing dates for calendar highlighting
  const getPricingDates = () => {
    if (!pricingRules) return [];
    
    const dates: { date: Date; pricing: DynamicPricing }[] = [];
    pricingRules.forEach(pricing => {
      const interval = eachDayOfInterval({
        start: parseISO(pricing.start_date),
        end: parseISO(pricing.end_date)
      });
      interval.forEach(date => {
        dates.push({ date, pricing });
      });
    });
    return dates;
  };

  const pricingDates = getPricingDates();

  if (!pageId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Preços Dinâmicos
          </CardTitle>
          <CardDescription>
            Guarde a página primeiro para configurar preços dinâmicos
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Preços Dinâmicos
            </CardTitle>
            <CardDescription>
              Defina preços especiais para épocas ou datas específicas
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPricing ? "Editar Preço" : "Adicionar Preço Dinâmico"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Época/Período</Label>
                  <Input
                    placeholder="Ex: Época Alta, Natal, Páscoa..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "d MMM yyyy", { locale: pt })} -{" "}
                              {format(dateRange.to, "d MMM yyyy", { locale: pt })}
                            </>
                          ) : (
                            format(dateRange.from, "d MMM yyyy", { locale: pt })
                          )
                        ) : (
                          "Selecione as datas"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={pt}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço por Noite (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={defaultPrice.toString()}
                      value={formData.price_per_night}
                      onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Noites Mínimas</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.min_nights}
                      onChange={(e) => setFormData({ ...formData, min_nights: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPricing ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default price info */}
        <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Preço Base</p>
            <p className="text-xs text-muted-foreground">Aplicado quando não há preço específico</p>
          </div>
          <Badge variant="outline" className="text-base font-semibold">
            €{defaultPrice}/noite
          </Badge>
        </div>

        {/* Pricing rules list */}
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : pricingRules && pricingRules.length > 0 ? (
          <div className="space-y-2">
            {pricingRules.map((pricing) => (
              <div
                key={pricing.id}
                className="p-3 rounded-lg border flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{pricing.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(pricing.start_date), "d MMM yyyy", { locale: pt })} - {format(parseISO(pricing.end_date), "d MMM yyyy", { locale: pt })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-semibold">
                    €{pricing.price_per_night}/noite
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(pricing)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(pricing.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhum preço dinâmico definido. O preço base será aplicado a todas as datas.
          </div>
        )}

        {/* Mini calendar preview */}
        {pricingRules && pricingRules.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Pré-visualização do Calendário</p>
            <Calendar
              mode="single"
              className="rounded-lg border"
              modifiers={{
                priced: pricingDates.map(p => p.date),
              }}
              modifiersStyles={{
                priced: { 
                  backgroundColor: "hsl(var(--primary) / 0.2)",
                  color: "hsl(var(--primary))",
                  fontWeight: "600"
                },
              }}
              disabled
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span>Datas com preço especial</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}