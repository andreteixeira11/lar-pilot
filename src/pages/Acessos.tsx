import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Save, Plus, X, Copy, Eye, EyeOff } from "lucide-react";
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
    // Airbnb
    airbnbUser: "",
    airbnbPassword: "",
    // Booking
    bookingUser: "",
    bookingPassword: "",
    // Taxa Turística
    taxaTuristicaUser: "",
    taxaTuristicaPassword: "",
    // SIBA
    sibaUnidadeHoteleira: "",
    sibaEstabelecimento: "",
    sibaChaveAtivacao: "",
    // INE
    ineCodigoIdentificador: "",
    ineChaveMestre: "",
    ineCodigo: "",
    inePassword: "",
    // Livro de Reclamações Online
    livroReclamacoesUser: "",
    livroReclamacoesPassword: "",
    // Portal das Finanças
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

      if (data) {
        const newFormData = { ...formData };
        const customAccessList: CustomAccess[] = [];

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

        setFormData(newFormData);
        setCustomAccess(customAccessList);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedProperty) return;

    try {
      // Delete existing credentials
      await supabase
        .from('property_access_credentials')
        .delete()
        .eq('property_id', selectedProperty.id);

      // Save platform credentials
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

      // Save custom access
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
      {
        id: Date.now().toString(),
        name: "",
        user: "",
        password: "",
      },
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

      <div className="grid gap-6 max-w-4xl mt-6">
        {/* Airbnb */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/logos/airbnb.svg" alt="Airbnb" className="h-6 w-auto" />
              Airbnb
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airbnbUser">User</Label>
              <div className="flex gap-2">
                <Input
                  id="airbnbUser"
                  type="email"
                  value={formData.airbnbUser}
                  onChange={(e) => setFormData({ ...formData, airbnbUser: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.airbnbUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.airbnbUser, "User")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="airbnbPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="airbnbPassword"
                  type={showPasswords.airbnbPassword ? "text" : "password"}
                  value={formData.airbnbPassword}
                  onChange={(e) => setFormData({ ...formData, airbnbPassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.airbnbPassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('airbnbPassword')}
                    >
                      {showPasswords.airbnbPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.airbnbPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
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
            <div>
              <Label htmlFor="bookingUser">User</Label>
              <div className="flex gap-2">
                <Input
                  id="bookingUser"
                  type="email"
                  value={formData.bookingUser}
                  onChange={(e) => setFormData({ ...formData, bookingUser: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.bookingUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.bookingUser, "User")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="bookingPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="bookingPassword"
                  type={showPasswords.bookingPassword ? "text" : "password"}
                  value={formData.bookingPassword}
                  onChange={(e) => setFormData({ ...formData, bookingPassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.bookingPassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('bookingPassword')}
                    >
                      {showPasswords.bookingPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.bookingPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Turística */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa Turística</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxaTuristicaUser">User</Label>
              <div className="flex gap-2">
                <Input
                  id="taxaTuristicaUser"
                  value={formData.taxaTuristicaUser}
                  onChange={(e) => setFormData({ ...formData, taxaTuristicaUser: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.taxaTuristicaUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.taxaTuristicaUser, "User")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="taxaTuristicaPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="taxaTuristicaPassword"
                  type={showPasswords.taxaTuristicaPassword ? "text" : "password"}
                  value={formData.taxaTuristicaPassword}
                  onChange={(e) => setFormData({ ...formData, taxaTuristicaPassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.taxaTuristicaPassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('taxaTuristicaPassword')}
                    >
                      {showPasswords.taxaTuristicaPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.taxaTuristicaPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SIBA */}
        <Card>
          <CardHeader>
            <CardTitle>SIBA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sibaUnidadeHoteleira">Unidade Hoteleira</Label>
              <div className="flex gap-2">
                <Input
                  id="sibaUnidadeHoteleira"
                  value={formData.sibaUnidadeHoteleira}
                  onChange={(e) => setFormData({ ...formData, sibaUnidadeHoteleira: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.sibaUnidadeHoteleira && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.sibaUnidadeHoteleira, "Unidade Hoteleira")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="sibaEstabelecimento">Estabelecimento</Label>
              <div className="flex gap-2">
                <Input
                  id="sibaEstabelecimento"
                  value={formData.sibaEstabelecimento}
                  onChange={(e) => setFormData({ ...formData, sibaEstabelecimento: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.sibaEstabelecimento && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.sibaEstabelecimento, "Estabelecimento")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="sibaChaveAtivacao">Chave de Ativação</Label>
              <div className="flex gap-2">
                <Input
                  id="sibaChaveAtivacao"
                  value={formData.sibaChaveAtivacao}
                  onChange={(e) => setFormData({ ...formData, sibaChaveAtivacao: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.sibaChaveAtivacao && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.sibaChaveAtivacao, "Chave de Ativação")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INE */}
        <Card>
          <CardHeader>
            <CardTitle>INE</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ineCodigoIdentificador">Código Identificador</Label>
              <div className="flex gap-2">
                <Input
                  id="ineCodigoIdentificador"
                  value={formData.ineCodigoIdentificador}
                  onChange={(e) => setFormData({ ...formData, ineCodigoIdentificador: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.ineCodigoIdentificador && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.ineCodigoIdentificador, "Código Identificador")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="ineChaveMestre">Chave Mestre</Label>
              <div className="flex gap-2">
                <Input
                  id="ineChaveMestre"
                  value={formData.ineChaveMestre}
                  onChange={(e) => setFormData({ ...formData, ineChaveMestre: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.ineChaveMestre && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.ineChaveMestre, "Chave Mestre")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="ineCodigo">Código</Label>
              <div className="flex gap-2">
                <Input
                  id="ineCodigo"
                  value={formData.ineCodigo}
                  onChange={(e) => setFormData({ ...formData, ineCodigo: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.ineCodigo && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.ineCodigo, "Código")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="inePassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="inePassword"
                  type={showPasswords.inePassword ? "text" : "password"}
                  value={formData.inePassword}
                  onChange={(e) => setFormData({ ...formData, inePassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.inePassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('inePassword')}
                    >
                      {showPasswords.inePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.inePassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Livro de Reclamações Online */}
        <Card>
          <CardHeader>
            <CardTitle>Livro de Reclamações Online</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="livroReclamacoesUser">Utilizador</Label>
              <div className="flex gap-2">
                <Input
                  id="livroReclamacoesUser"
                  value={formData.livroReclamacoesUser}
                  onChange={(e) => setFormData({ ...formData, livroReclamacoesUser: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.livroReclamacoesUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.livroReclamacoesUser, "Utilizador")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="livroReclamacoesPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="livroReclamacoesPassword"
                  type={showPasswords.livroReclamacoesPassword ? "text" : "password"}
                  value={formData.livroReclamacoesPassword}
                  onChange={(e) => setFormData({ ...formData, livroReclamacoesPassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.livroReclamacoesPassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('livroReclamacoesPassword')}
                    >
                      {showPasswords.livroReclamacoesPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.livroReclamacoesPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portal das Finanças */}
        <Card>
          <CardHeader>
            <CardTitle>Portal das Finanças</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="portalFinancasNif">NIF</Label>
              <div className="flex gap-2">
                <Input
                  id="portalFinancasNif"
                  value={formData.portalFinancasNif}
                  onChange={(e) => setFormData({ ...formData, portalFinancasNif: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.portalFinancasNif && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.portalFinancasNif, "NIF")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="portalFinancasPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="portalFinancasPassword"
                  type={showPasswords.portalFinancasPassword ? "text" : "password"}
                  value={formData.portalFinancasPassword}
                  onChange={(e) => setFormData({ ...formData, portalFinancasPassword: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {formData.portalFinancasPassword && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility('portalFinancasPassword')}
                    >
                      {showPasswords.portalFinancasPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(formData.portalFinancasPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Access */}
        {customAccess.map((access) => (
          <Card key={access.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {access.name || "Outro Acesso"}
                </CardTitle>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomAccess(access.id)}
                  >
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(access.name, "Nome")}
                    >
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(access.user, "User")}
                      >
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
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => togglePasswordVisibility(`custom_${access.id}`)}
                        >
                          {showPasswords[`custom_${access.id}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(access.password, "Password")}
                        >
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
          <Button
            onClick={addCustomAccess}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Outros Acessos
          </Button>
        )}
      </div>
    </div>
  );
};

export default Acessos;