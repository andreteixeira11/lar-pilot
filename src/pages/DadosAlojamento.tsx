import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { 
  Save, 
  Upload, 
  FileText, 
  AlertTriangle, 
  Trash2, 
  Building2, 
  Shield, 
  Users, 
  Link2,
  Unlink,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChannelConfig {
  id: string;
  property_id: string;
  channel: string;
  is_connected: boolean;
  ical_url?: string;
  last_sync?: string;
  sync_enabled: boolean;
}

const CHANNELS = [
  {
    id: "booking",
    name: "Booking.com",
    logo: "/logos/booking.svg",
    description: "Sincronize reservas via iCal",
    color: "bg-blue-500",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "/logos/airbnb.svg",
    description: "Conecte a sua conta Airbnb",
    color: "bg-rose-500",
  },
  {
    id: "expedia",
    name: "Expedia",
    logo: null,
    description: "Integração com Expedia Group",
    color: "bg-yellow-500",
  },
  {
    id: "vrbo",
    name: "VRBO",
    logo: null,
    description: "Conecte o seu alojamento VRBO",
    color: "bg-indigo-500",
  },
];

const DadosAlojamento = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedProperty, updateProperty, deleteProperty } = useProperty();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [insuranceAlert, setInsuranceAlert] = useState<{ type: 'warning' | 'error'; message: string } | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
  const [icalUrl, setIcalUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [formData, setFormData] = useState(
    selectedProperty || {
      name: "",
      address: "",
      capacity: 0,
      bedrooms: 0,
      bathrooms: 0,
      wifiPassword: "",
      parkingInfo: "",
      region: "continental" as "continental" | "madeira",
      rnal: "",
      insuranceValidity: "",
      insuranceFileUrl: "",
      platformStatus: "nao_submetido" as "nao_submetido" | "submetido" | "aprovado",
    }
  );

  // Fetch channel configurations
  const { data: channelConfigs } = useQuery({
    queryKey: ["channel-configs", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      
      const { data, error } = await supabase
        .from("direct_booking_pages")
        .select("*")
        .eq("property_id", selectedProperty.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

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

  const saveChannelConfig = async () => {
    if (!selectedChannel || !selectedProperty?.id) return;

    try {
      const updateData: Record<string, string> = {};
      
      if (selectedChannel.id === "airbnb") {
        updateData.ical_airbnb_url = icalUrl;
      } else if (selectedChannel.id === "booking") {
        updateData.ical_booking_url = icalUrl;
      }

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

  useEffect(() => {
    if (formData.insuranceValidity) {
      const validityDate = new Date(formData.insuranceValidity);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((validityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        setInsuranceAlert({
          type: 'error',
          message: 'O seguro de responsabilidade civil expirou! Atualize urgentemente.'
        });
      } else if (daysUntilExpiry <= 30) {
        setInsuranceAlert({
          type: 'warning',
          message: `O seguro expira em ${daysUntilExpiry} dias. Renove o seguro em breve.`
        });
      } else {
        setInsuranceAlert(null);
      }
    }
  }, [formData.insuranceValidity]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProperty) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProperty.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('insurance-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('insurance-documents')
        .createSignedUrl(fileName, 31536000);
      
      if (signedError) throw signedError;
      const publicUrl = signedUrlData.signedUrl;

      setFormData({ ...formData, insuranceFileUrl: publicUrl });
      toast.success("Ficheiro carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ficheiro");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!selectedProperty) return;
    updateProperty(selectedProperty.id, formData);
    setIsEditing(false);
    toast.success("Dados atualizados com sucesso!");
  };

  const handleDelete = () => {
    if (!selectedProperty) return;
    deleteProperty(selectedProperty.id);
    toast.success("Propriedade eliminada com sucesso!");
    navigate("/overview");
  };

  if (!selectedProperty) {
    return (
      <div className="p-8">
        <PageHeader title="Dados do Alojamento" />
        <p className="text-muted-foreground">Nenhuma propriedade selecionada.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Dados do Alojamento"
        description={selectedProperty.name}
        actions={
          <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Editar</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar Propriedade</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem a certeza que pretende eliminar a propriedade "{selectedProperty.name}"? 
                        Esta ação é irreversível e irá apagar todas as reservas, check-ins e dados associados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        }
      />

      <Tabs defaultValue="geral" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="geral" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Informações</span>
          </TabsTrigger>
          <TabsTrigger value="seguro" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguro</span>
          </TabsTrigger>
          <TabsTrigger value="capacidade" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Capacidade</span>
          </TabsTrigger>
          <TabsTrigger value="canais" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Canais</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Propriedade</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="address">Morada</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="region">Região</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value: "continental" | "madeira") =>
                    setFormData({ ...formData, region: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continental">Portugal Continental</SelectItem>
                    <SelectItem value="madeira">Madeira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rnal">RNAL</Label>
                <Input
                  id="rnal"
                  value={formData.rnal}
                  onChange={(e) =>
                    setFormData({ ...formData, rnal: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Número de registo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações para Hóspedes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wifiPassword">Senha Wi-Fi</Label>
                <Input
                  id="wifiPassword"
                  value={formData.wifiPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, wifiPassword: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="parkingInfo">Informação de Estacionamento</Label>
                <Input
                  id="parkingInfo"
                  value={formData.parkingInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, parkingInfo: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguro de Responsabilidade Civil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insuranceAlert && (
                <Alert variant={insuranceAlert.type === 'error' ? 'destructive' : 'default'} className={insuranceAlert.type === 'warning' ? 'border-yellow-500 text-yellow-700' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{insuranceAlert.message}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="insuranceValidity">Validade do Seguro</Label>
                <DatePicker
                  date={formData.insuranceValidity ? new Date(formData.insuranceValidity) : undefined}
                  onDateChange={(date) =>
                    setFormData({ ...formData, insuranceValidity: date ? format(date, "yyyy-MM-dd") : "" })
                  }
                  placeholder="Selecione a data"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="insuranceFile">Ficheiro do Seguro</Label>
                {formData.insuranceFileUrl && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                    <a 
                      href={formData.insuranceFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex-1 truncate"
                    >
                      Ver ficheiro atual
                    </a>
                  </div>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      id="insuranceFile"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {uploading && <span className="text-sm text-muted-foreground">A carregar...</span>}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="platformStatus">Estado da Submissão</Label>
                <Select
                  value={formData.platformStatus}
                  onValueChange={(value: "nao_submetido" | "submetido" | "aprovado") =>
                    setFormData({ ...formData, platformStatus: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger id="platformStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_submetido">Não Submetido</SelectItem>
                    <SelectItem value="submetido">Submetido</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacidade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacidade do Alojamento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Casas de Banho</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bathrooms: parseInt(e.target.value) })
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canais" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHANNELS.map((channel) => {
              const isConnected = getChannelStatus(channel.id);
              const config = getChannelConfig(channel.id);

              return (
                <Card key={channel.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${channel.color}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {channel.logo ? (
                          <img src={channel.logo} alt={channel.name} className="h-8 w-8 object-contain" />
                        ) : (
                          <div className={`h-8 w-8 rounded-lg ${channel.color} flex items-center justify-center text-white font-bold text-sm`}>
                            {channel.name[0]}
                          </div>
                        )}
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                      </div>
                      <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
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
                    <CardDescription className="text-xs">{channel.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isConnected && config?.last_sync && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        Última sync: {new Date(config.last_sync).toLocaleString("pt-PT")}
                      </div>
                    )}

                    <div className="flex gap-2">
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
                          size="sm"
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

          <Card>
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Input
                  readOnly
                  value={`${window.location.origin}/api/ical/${selectedProperty.id}`}
                  className="font-mono text-sm flex-1"
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
        </TabsContent>
      </Tabs>

      {/* Channel Configuration Dialog */}
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

export default DadosAlojamento;
