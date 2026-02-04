import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useProperty } from "@/contexts/PropertyContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Link2,
  Unlink,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface ChannelConfig {
  id: string;
  property_id: string;
  channel: string;
  is_connected: boolean;
  ical_url?: string;
  api_key?: string;
  last_sync?: string;
  sync_enabled: boolean;
}

const CHANNELS = [
  {
    id: "booking",
    name: "Booking.com",
    logo: "/logos/booking.svg",
    description: "Sincronize reservas via iCal ou API",
    features: ["Sincronização de calendário", "Importação de reservas", "Atualização de preços"],
    color: "bg-blue-500",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "/logos/airbnb.svg",
    description: "Conecte a sua conta Airbnb",
    features: ["Sincronização de calendário", "Importação de reservas", "Mensagens automáticas"],
    color: "bg-rose-500",
  },
  {
    id: "expedia",
    name: "Expedia",
    logo: null,
    description: "Integração com Expedia Group",
    features: ["Sincronização de calendário", "Gestão de tarifas"],
    color: "bg-yellow-500",
  },
  {
    id: "vrbo",
    name: "VRBO",
    logo: null,
    description: "Conecte o seu alojamento VRBO",
    features: ["Sincronização iCal", "Bloqueio de datas"],
    color: "bg-indigo-500",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    logo: null,
    description: "Sincronize com TripAdvisor Rentals",
    features: ["Sincronização de calendário", "Reviews"],
    color: "bg-green-500",
  },
];

const GestorCanais = () => {
  const { selectedProperty } = useProperty();
  const queryClient = useQueryClient();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
  const [icalUrl, setIcalUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Fetch channel configurations for selected property
  const { data: channelConfigs, isLoading } = useQuery({
    queryKey: ["channel-configs", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      
      // For now, we'll use direct_booking_pages as a proxy for channel config
      const { data, error } = await supabase
        .from("direct_booking_pages")
        .select("*")
        .eq("property_id", selectedProperty.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      // Build channel configs from existing data
      const configs: ChannelConfig[] = [];
      
      if (data?.ical_airbnb_url) {
        configs.push({
          id: `${selectedProperty.id}-airbnb`,
          property_id: selectedProperty.id,
          channel: "airbnb",
          is_connected: true,
          ical_url: data.ical_airbnb_url,
          last_sync: data.ical_last_sync,
          sync_enabled: true,
        });
      }
      
      if (data?.ical_booking_url) {
        configs.push({
          id: `${selectedProperty.id}-booking`,
          property_id: selectedProperty.id,
          channel: "booking",
          is_connected: true,
          ical_url: data.ical_booking_url,
          last_sync: data.ical_last_sync,
          sync_enabled: true,
        });
      }

      return configs;
    },
    enabled: !!selectedProperty?.id,
  });

  const syncMutation = useMutation({
    mutationFn: async (channelId: string) => {
      setIsSyncing(channelId);
      
      // Get the direct booking page for this property
      const { data: page } = await supabase
        .from("direct_booking_pages")
        .select("id")
        .eq("property_id", selectedProperty?.id)
        .single();

      if (!page) throw new Error("Página de reservas não encontrada");

      const { error } = await supabase.functions.invoke("sync-ical", {
        body: { pageId: page.id },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Calendário sincronizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["channel-configs"] });
    },
    onError: (error) => {
      toast.error("Erro ao sincronizar: " + error.message);
    },
    onSettled: () => {
      setIsSyncing(null);
    },
  });

  const saveChannelConfig = async () => {
    if (!selectedChannel || !selectedProperty?.id) return;

    try {
      const updateData: Record<string, string> = {};
      
      if (selectedChannel.id === "airbnb") {
        updateData.ical_airbnb_url = icalUrl;
      } else if (selectedChannel.id === "booking") {
        updateData.ical_booking_url = icalUrl;
      }

      // Check if direct_booking_pages exists for this property
      const { data: existingPage } = await supabase
        .from("direct_booking_pages")
        .select("id")
        .eq("property_id", selectedProperty.id)
        .single();

      if (existingPage) {
        await supabase
          .from("direct_booking_pages")
          .update(updateData)
          .eq("property_id", selectedProperty.id);
      } else {
        await supabase
          .from("direct_booking_pages")
          .insert({
            property_id: selectedProperty.id,
            slug: `prop-${selectedProperty.id.slice(0, 8)}`,
            ...updateData,
          });
      }

      toast.success(`${selectedChannel.name} configurado com sucesso!`);
      setConfigDialogOpen(false);
      setIcalUrl("");
      queryClient.invalidateQueries({ queryKey: ["channel-configs"] });
    } catch (error: any) {
      toast.error("Erro ao guardar configuração: " + error.message);
    }
  };

  const disconnectChannel = async (channelId: string) => {
    if (!selectedProperty?.id) return;

    try {
      const updateData: Record<string, null> = {};
      
      if (channelId === "airbnb") {
        updateData.ical_airbnb_url = null;
      } else if (channelId === "booking") {
        updateData.ical_booking_url = null;
      }

      await supabase
        .from("direct_booking_pages")
        .update(updateData)
        .eq("property_id", selectedProperty.id);

      toast.success("Canal desconectado");
      queryClient.invalidateQueries({ queryKey: ["channel-configs"] });
    } catch (error: any) {
      toast.error("Erro ao desconectar: " + error.message);
    }
  };

  const getChannelStatus = (channelId: string) => {
    const config = channelConfigs?.find((c) => c.channel === channelId);
    return config?.is_connected ?? false;
  };

  const getChannelConfig = (channelId: string) => {
    return channelConfigs?.find((c) => c.channel === channelId);
  };

  const openConfigDialog = (channel: typeof CHANNELS[0]) => {
    setSelectedChannel(channel);
    const existingConfig = getChannelConfig(channel.id);
    setIcalUrl(existingConfig?.ical_url || "");
    setConfigDialogOpen(true);
  };

  if (!selectedProperty) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Gestor de Canais"
          description="Selecione uma propriedade para gerir os canais"
        />
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecione uma propriedade no menu superior para configurar os canais
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Gestor de Canais"
        description={`Configure as integrações com plataformas de reservas para ${selectedProperty.name}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {CHANNELS.map((channel) => {
          const isConnected = getChannelStatus(channel.id);
          const config = getChannelConfig(channel.id);

          return (
            <Card key={channel.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${channel.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img src={channel.logo} alt={channel.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <div className={`h-8 w-8 rounded-lg ${channel.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {channel.name[0]}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Funcionalidades:</p>
                  <ul className="text-sm space-y-1">
                    {channel.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {isConnected && config?.last_sync && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Última sync: {new Date(config.last_sync).toLocaleString("pt-PT")}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => syncMutation.mutate(channel.id)}
                        disabled={isSyncing === channel.id}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing === channel.id ? "animate-spin" : ""}`} />
                        Sincronizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConfigDialog(channel)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectChannel(channel.id)}
                      >
                        <Unlink className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => openConfigDialog(channel)}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export iCal Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Exportar Calendário
          </CardTitle>
          <CardDescription>
            Use este link para sincronizar o calendário desta propriedade com outras plataformas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              readOnly
              value={`${window.location.origin}/api/ical/${selectedProperty.id}`}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/api/ical/${selectedProperty.id}`);
                toast.success("Link copiado para a área de transferência");
              }}
            >
              Copiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedChannel?.logo ? (
                <img src={selectedChannel.logo} alt={selectedChannel.name} className="h-6 w-6" />
              ) : (
                <div className={`h-6 w-6 rounded ${selectedChannel?.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {selectedChannel?.name[0]}
                </div>
              )}
              Configurar {selectedChannel?.name}
            </DialogTitle>
            <DialogDescription>
              Configure a sincronização com {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ical-url">URL do Calendário iCal</Label>
              <Input
                id="ical-url"
                placeholder="https://..."
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole o link iCal exportado da plataforma {selectedChannel?.name}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Sincronização Automática</p>
                <p className="text-xs text-muted-foreground">Sincronizar a cada hora</p>
              </div>
              <Switch defaultChecked />
            </div>

            {selectedChannel?.id === "booking" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Dica:</strong> No Booking.com, vá a Calendário → Sincronização → Exportar Calendário para obter o link iCal.
                </p>
              </div>
            )}

            {selectedChannel?.id === "airbnb" && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-800">
                  <strong>Dica:</strong> No Airbnb, vá a Calendário → Disponibilidade → Exportar Calendário para obter o link iCal.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveChannelConfig} disabled={!icalUrl}>
              Guardar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestorCanais;
