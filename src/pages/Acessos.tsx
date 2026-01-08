import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Save, Plus, X, Copy, Eye, EyeOff, Globe, Building, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomAccess {
  id: string;
  name: string;
  user: string;
  password: string;
}

const Acessos = () => {
  const { selectedProperty } = useProperty();
  const [isEditing, setIsEditing] = useState(false);
  const [customAccess, setCustomAccess] = useState<CustomAccess[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    airbnbUser: "",
    airbnbPassword: "",
    bookingUser: "",
    bookingPassword: "",
    taxaTuristicaUser: "",
    taxaTuristicaPassword: "",
    sibaUnidadeHoteleira: "",
    sibaEstabelecimento: "",
    sibaChaveAtivacao: "",
    ineCodigoIdentificador: "",
    ineChaveMestre: "",
    ineCodigo: "",
    inePassword: "",
    livroReclamacoesUser: "",
    livroReclamacoesPassword: "",
    portalFinancasNif: "",
    portalFinancasPassword: "",
  });

  useEffect(() => {
    loadCredentials();
  }, [selectedProperty]);

  const loadCredentials = async () => {
    if (!selectedProperty) return;

    try {
      const { data, error } = await supabase
        .from('property_access_credentials')
        .select('*')
        .eq('property_id', selectedProperty.id);

      if (error) throw error;

      const newFormData = {
        airbnbUser: "",
        airbnbPassword: "",
        bookingUser: "",
        bookingPassword: "",
        taxaTuristicaUser: "",
        taxaTuristicaPassword: "",
        sibaUnidadeHoteleira: "",
        sibaEstabelecimento: "",
        sibaChaveAtivacao: "",
        ineCodigoIdentificador: "",
        ineChaveMestre: "",
        ineCodigo: "",
        inePassword: "",
        livroReclamacoesUser: "",
        livroReclamacoesPassword: "",
        portalFinancasNif: "",
        portalFinancasPassword: "",
      };
      const customAccessList: CustomAccess[] = [];

      if (data) {
        data.forEach((credential) => {
          if (credential.platform === 'custom') {
            const creds = credential.credentials as any;
            customAccessList.push({
              id: credential.id,
              name: creds.name || '',
              user: creds.user || '',
              password: creds.password || ''
            });
          } else {
            Object.keys(credential.credentials).forEach((key) => {
              (newFormData as any)[key] = (credential.credentials as any)[key];
            });
          }
        });
      }

      setFormData(newFormData);
      setCustomAccess(customAccessList);
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedProperty) return;

    try {
      await supabase
        .from('property_access_credentials')
        .delete()
        .eq('property_id', selectedProperty.id);

      const platforms = [
        { platform: 'airbnb', credentials: { airbnbUser: formData.airbnbUser, airbnbPassword: formData.airbnbPassword } },
        { platform: 'booking', credentials: { bookingUser: formData.bookingUser, bookingPassword: formData.bookingPassword } },
        { platform: 'taxa_turistica', credentials: { taxaTuristicaUser: formData.taxaTuristicaUser, taxaTuristicaPassword: formData.taxaTuristicaPassword } },
        { platform: 'siba', credentials: { sibaUnidadeHoteleira: formData.sibaUnidadeHoteleira, sibaEstabelecimento: formData.sibaEstabelecimento, sibaChaveAtivacao: formData.sibaChaveAtivacao } },
        { platform: 'ine', credentials: { ineCodigoIdentificador: formData.ineCodigoIdentificador, ineChaveMestre: formData.ineChaveMestre, ineCodigo: formData.ineCodigo, inePassword: formData.inePassword } },
        { platform: 'livro_reclamacoes', credentials: { livroReclamacoesUser: formData.livroReclamacoesUser, livroReclamacoesPassword: formData.livroReclamacoesPassword } },
        { platform: 'portal_financas', credentials: { portalFinancasNif: formData.portalFinancasNif, portalFinancasPassword: formData.portalFinancasPassword } },
      ];

      for (const platformData of platforms) {
        await supabase
          .from('property_access_credentials')
          .insert({
            property_id: selectedProperty.id,
            platform: platformData.platform,
            credentials: platformData.credentials,
          });
      }

      for (const custom of customAccess) {
        await supabase
          .from('property_access_credentials')
          .insert({
            property_id: selectedProperty.id,
            platform: 'custom',
            credentials: { name: custom.name, user: custom.user, password: custom.password },
          });
      }

      setIsEditing(false);
      toast.success("Acessos guardados com sucesso!");
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error("Erro ao guardar acessos");
    }
  };

  const addCustomAccess = () => {
    setCustomAccess([
      ...customAccess,
      { id: Date.now().toString(), name: "", user: "", password: "" },
    ]);
  };

  const removeCustomAccess = (id: string) => {
    setCustomAccess(customAccess.filter((access) => access.id !== id));
  };

  const updateCustomAccess = (id: string, field: keyof Omit<CustomAccess, 'id'>, value: string) => {
    setCustomAccess(
      customAccess.map((access) =>
        access.id === id ? { ...access, [field]: value } : access
      )
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado!`);
    }).catch(() => {
      toast.error("Erro ao copiar");
    });
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const renderPasswordField = (id: string, label: string, value: string, onChange: (val: string) => void) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={showPasswords[id] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditing}
          className="flex-1"
        />
        {value && (
          <>
            <Button type="button" variant="outline" size="icon" onClick={() => togglePasswordVisibility(id)}>
              {showPasswords[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(value, label)}>
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const renderTextField = (id: string, label: string, value: string, onChange: (val: string) => void, type: string = "text") => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditing}
          className="flex-1"
        />
        {value && (
          <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(value, label)}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (!selectedProperty) {
    return (
      <div className="p-8">
        <PageHeader title="Acessos" />
        <p className="text-muted-foreground">Nenhuma propriedade selecionada.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Acessos"
        description="Gerir credenciais de acesso às plataformas"
        actions={
          isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Editar</Button>
          )
        }
      />

      <Tabs defaultValue="plataformas" className="mt-6 max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plataformas" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:block" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <Building className="h-4 w-4 hidden sm:block" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="outros" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Outros
          </TabsTrigger>
        </TabsList>

        {/* Plataformas Tab */}
        <TabsContent value="plataformas" className="space-y-6 mt-6">
          {/* Airbnb */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/logos/airbnb.svg" alt="Airbnb" className="h-6 w-auto" />
                Airbnb
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("airbnbUser", "User", formData.airbnbUser, (val) => setFormData({ ...formData, airbnbUser: val }), "email")}
              {renderPasswordField("airbnbPassword", "Password", formData.airbnbPassword, (val) => setFormData({ ...formData, airbnbPassword: val }))}
            </CardContent>
          </Card>

          {/* Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/logos/booking.svg" alt="Booking" className="h-6 w-auto" />
                Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("bookingUser", "User", formData.bookingUser, (val) => setFormData({ ...formData, bookingUser: val }), "email")}
              {renderPasswordField("bookingPassword", "Password", formData.bookingPassword, (val) => setFormData({ ...formData, bookingPassword: val }))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal Tab */}
        <TabsContent value="fiscal" className="space-y-6 mt-6">
          {/* Taxa Turística */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa Turística</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("taxaTuristicaUser", "User", formData.taxaTuristicaUser, (val) => setFormData({ ...formData, taxaTuristicaUser: val }))}
              {renderPasswordField("taxaTuristicaPassword", "Password", formData.taxaTuristicaPassword, (val) => setFormData({ ...formData, taxaTuristicaPassword: val }))}
            </CardContent>
          </Card>

          {/* SIBA */}
          <Card>
            <CardHeader>
              <CardTitle>SIBA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderTextField("sibaUnidadeHoteleira", "Unidade Hoteleira", formData.sibaUnidadeHoteleira, (val) => setFormData({ ...formData, sibaUnidadeHoteleira: val }))}
              {renderTextField("sibaEstabelecimento", "Estabelecimento", formData.sibaEstabelecimento, (val) => setFormData({ ...formData, sibaEstabelecimento: val }))}
              {renderTextField("sibaChaveAtivacao", "Chave de Ativação", formData.sibaChaveAtivacao, (val) => setFormData({ ...formData, sibaChaveAtivacao: val }))}
            </CardContent>
          </Card>

          {/* INE */}
          <Card>
            <CardHeader>
              <CardTitle>INE</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("ineCodigoIdentificador", "Código Identificador", formData.ineCodigoIdentificador, (val) => setFormData({ ...formData, ineCodigoIdentificador: val }))}
              {renderTextField("ineChaveMestre", "Chave Mestre", formData.ineChaveMestre, (val) => setFormData({ ...formData, ineChaveMestre: val }))}
              {renderTextField("ineCodigo", "Código", formData.ineCodigo, (val) => setFormData({ ...formData, ineCodigo: val }))}
              {renderPasswordField("inePassword", "Password", formData.inePassword, (val) => setFormData({ ...formData, inePassword: val }))}
            </CardContent>
          </Card>

          {/* Portal das Finanças */}
          <Card>
            <CardHeader>
              <CardTitle>Portal das Finanças</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("portalFinancasNif", "NIF", formData.portalFinancasNif, (val) => setFormData({ ...formData, portalFinancasNif: val }))}
              {renderPasswordField("portalFinancasPassword", "Password", formData.portalFinancasPassword, (val) => setFormData({ ...formData, portalFinancasPassword: val }))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outros Tab */}
        <TabsContent value="outros" className="space-y-6 mt-6">
          {/* Livro de Reclamações Online */}
          <Card>
            <CardHeader>
              <CardTitle>Livro de Reclamações Online</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("livroReclamacoesUser", "Utilizador", formData.livroReclamacoesUser, (val) => setFormData({ ...formData, livroReclamacoesUser: val }))}
              {renderPasswordField("livroReclamacoesPassword", "Password", formData.livroReclamacoesPassword, (val) => setFormData({ ...formData, livroReclamacoesPassword: val }))}
            </CardContent>
          </Card>

          {/* Custom Access */}
          {customAccess.map((access) => (
            <Card key={access.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{access.name || "Outro Acesso"}</CardTitle>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => removeCustomAccess(access.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Plataforma</Label>
                  <div className="flex gap-2">
                    <Input
                      value={access.name}
                      onChange={(e) => updateCustomAccess(access.id, "name", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ex: Outra plataforma"
                      className="flex-1"
                    />
                    {access.name && (
                      <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(access.name, "Nome")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>User</Label>
                    <div className="flex gap-2">
                      <Input
                        value={access.user}
                        onChange={(e) => updateCustomAccess(access.id, "user", e.target.value)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {access.user && (
                        <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(access.user, "User")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showPasswords[`custom_${access.id}`] ? "text" : "password"}
                        value={access.password}
                        onChange={(e) => updateCustomAccess(access.id, "password", e.target.value)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {access.password && (
                        <>
                          <Button type="button" variant="outline" size="icon" onClick={() => togglePasswordVisibility(`custom_${access.id}`)}>
                            {showPasswords[`custom_${access.id}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(access.password, "Password")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {isEditing && (
            <Button onClick={addCustomAccess} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Outros Acessos
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Acessos;
