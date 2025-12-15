import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Palette, 
  Type, 
  Image, 
  LayoutGrid, 
  Upload, 
  X, 
  RotateCcw,
  Loader2,
  Plus
} from "lucide-react";

interface CustomizationData {
  primary_color: string;
  secondary_color: string;
  button_color: string;
  button_hover_color: string;
  logo_url: string | null;
  hero_image_url: string | null;
  font_family: string;
  short_description: string | null;
  description: string | null;
  gallery_images: string[];
  amenities: string[];
  house_rules: string | null;
  cancellation_policy: string | null;
  show_gallery: boolean;
  show_amenities: boolean;
  show_rules: boolean;
  show_cancellation_policy: boolean;
  book_button_text: string;
  contact_button_text: string;
}

interface DirectBookingCustomizationProps {
  data: Partial<CustomizationData>;
  onChange: (data: Partial<CustomizationData>) => void;
  userId: string;
  propertyId: string;
}

const FONT_OPTIONS = [
  { value: "Lato", label: "Lato (Padrão)" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
  { value: "Inter", label: "Inter" },
  { value: "Merriweather", label: "Merriweather" },
];

const DEFAULT_AMENITIES = [
  "Wi-Fi", "Ar Condicionado", "Aquecimento", "Cozinha", "Máquina de Lavar",
  "TV", "Estacionamento", "Piscina", "Terraço", "Vista Mar", "Churrasqueira",
  "Jacuzzi", "Ginásio", "Pet Friendly"
];

export function DirectBookingCustomization({
  data,
  onChange,
  userId,
  propertyId
}: DirectBookingCustomizationProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    file: File,
    type: "logo" | "hero" | "gallery"
  ): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${propertyId}/${type}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error } = await supabase.storage
      .from("direct-booking-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload da imagem.");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("direct-booking-images")
      .getPublicUrl(uploadData.path);

    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const url = await handleImageUpload(file, "logo");
    if (url) {
      onChange({ ...data, logo_url: url });
      toast.success("Logótipo carregado!");
    }
    setUploadingLogo(false);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const url = await handleImageUpload(file, "hero");
    if (url) {
      onChange({ ...data, hero_image_url: url });
      toast.success("Imagem de capa carregada!");
    }
    setUploadingHero(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const currentGallery = data.gallery_images || [];
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const url = await handleImageUpload(file, "gallery");
      if (url) newImages.push(url);
    }

    onChange({ ...data, gallery_images: [...currentGallery, ...newImages] });
    toast.success(`${newImages.length} imagem(ns) adicionada(s)!`);
    setUploadingGallery(false);
  };

  const removeGalleryImage = (index: number) => {
    const gallery = data.gallery_images || [];
    const updated = gallery.filter((_, i) => i !== index);
    onChange({ ...data, gallery_images: updated });
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    const amenities = data.amenities || [];
    if (!amenities.includes(newAmenity.trim())) {
      onChange({ ...data, amenities: [...amenities, newAmenity.trim()] });
    }
    setNewAmenity("");
  };

  const toggleAmenity = (amenity: string) => {
    const amenities = data.amenities || [];
    if (amenities.includes(amenity)) {
      onChange({ ...data, amenities: amenities.filter(a => a !== amenity) });
    } else {
      onChange({ ...data, amenities: [...amenities, amenity] });
    }
  };

  const resetToDefaults = () => {
    onChange({
      ...data,
      primary_color: "#247d7f",
      secondary_color: "#1e293b",
      button_color: "#247d7f",
      button_hover_color: "#1d6466",
      font_family: "Lato",
      show_gallery: true,
      show_amenities: true,
      show_rules: true,
      show_cancellation_policy: true,
      book_button_text: "Reservar Agora",
      contact_button_text: "Pedir Informações",
    });
    toast.success("Valores predefinidos restaurados!");
  };

  return (
    <div className="space-y-6">
      {/* Visual Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores e Estilo
          </CardTitle>
          <CardDescription>
            Personalize as cores da sua página de reservas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  value={data.primary_color || "#247d7f"}
                  onChange={(e) => onChange({ ...data, primary_color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.primary_color || "#247d7f"}
                  onChange={(e) => onChange({ ...data, primary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="secondaryColor"
                  value={data.secondary_color || "#1e293b"}
                  onChange={(e) => onChange({ ...data, secondary_color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.secondary_color || "#1e293b"}
                  onChange={(e) => onChange({ ...data, secondary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonColor">Cor dos Botões</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="buttonColor"
                  value={data.button_color || "#247d7f"}
                  onChange={(e) => onChange({ ...data, button_color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.button_color || "#247d7f"}
                  onChange={(e) => onChange({ ...data, button_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonHoverColor">Cor Hover dos Botões</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="buttonHoverColor"
                  value={data.button_hover_color || "#1d6466"}
                  onChange={(e) => onChange({ ...data, button_hover_color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.button_hover_color || "#1d6466"}
                  onChange={(e) => onChange({ ...data, button_hover_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Tipografia</Label>
            <Select
              value={data.font_family || "Lato"}
              onValueChange={(value) => onChange({ ...data, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <Button variant="outline" className="rounded-full" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Predefinições
          </Button>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagens
          </CardTitle>
          <CardDescription>
            Carregue o logótipo, imagem de capa e galeria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logótipo (opcional)</Label>
            <div className="flex items-center gap-4">
              {data.logo_url ? (
                <div className="relative">
                  <img
                    src={data.logo_url}
                    alt="Logo"
                    className="h-16 w-auto object-contain rounded border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => onChange({ ...data, logo_url: null })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {!data.logo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  Carregar Logótipo
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Hero Image */}
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <div className="space-y-3">
              {data.hero_image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={data.hero_image_url}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => onChange({ ...data, hero_image_url: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => heroInputRef.current?.click()}
                >
                  {uploadingHero ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Clique para carregar a imagem de capa
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
              />
            </div>
          </div>

          <Separator />

          {/* Gallery */}
          <div className="space-y-2">
            <Label>Galeria de Imagens</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {(data.gallery_images || []).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => removeGalleryImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div
                className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => galleryInputRef.current?.click()}
              >
                {uploadingGallery ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Conteúdo
          </CardTitle>
          <CardDescription>
            Personalize os textos e descrições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shortDesc">Descrição Curta</Label>
            <Textarea
              id="shortDesc"
              value={data.short_description || ""}
              onChange={(e) => onChange({ ...data, short_description: e.target.value })}
              placeholder="Uma breve descrição do alojamento (aparece no topo da página)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDesc">Descrição Completa</Label>
            <Textarea
              id="longDesc"
              value={data.description || ""}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="Descrição detalhada do alojamento..."
              rows={4}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Comodidades</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_AMENITIES.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={(data.amenities || []).includes(amenity) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar comodidade personalizada..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Button variant="outline" size="icon" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(data.amenities || []).filter(a => !DEFAULT_AMENITIES.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(data.amenities || [])
                  .filter(a => !DEFAULT_AMENITIES.includes(a))
                  .map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="rules">Regras da Casa</Label>
            <Textarea
              id="rules"
              value={data.house_rules || ""}
              onChange={(e) => onChange({ ...data, house_rules: e.target.value })}
              placeholder="Regras e políticas do alojamento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancelPolicy">Política de Cancelamento</Label>
            <Textarea
              id="cancelPolicy"
              value={data.cancellation_policy || ""}
              onChange={(e) => onChange({ ...data, cancellation_policy: e.target.value })}
              placeholder="Descreva a política de cancelamento..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bookBtn">Texto do Botão Reservar</Label>
              <Input
                id="bookBtn"
                value={data.book_button_text || "Reservar Agora"}
                onChange={(e) => onChange({ ...data, book_button_text: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactBtn">Texto do Botão Contacto</Label>
              <Input
                id="contactBtn"
                value={data.contact_button_text || "Pedir Informações"}
                onChange={(e) => onChange({ ...data, contact_button_text: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Secções da Página
          </CardTitle>
          <CardDescription>
            Ative ou desative as secções que pretende mostrar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Galeria de Imagens</Label>
              <p className="text-sm text-muted-foreground">Mostrar galeria de fotos</p>
            </div>
            <Switch
              checked={data.show_gallery !== false}
              onCheckedChange={(checked) => onChange({ ...data, show_gallery: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Comodidades</Label>
              <p className="text-sm text-muted-foreground">Mostrar lista de comodidades</p>
            </div>
            <Switch
              checked={data.show_amenities !== false}
              onCheckedChange={(checked) => onChange({ ...data, show_amenities: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Regras da Casa</Label>
              <p className="text-sm text-muted-foreground">Mostrar regras do alojamento</p>
            </div>
            <Switch
              checked={data.show_rules !== false}
              onCheckedChange={(checked) => onChange({ ...data, show_rules: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Política de Cancelamento</Label>
              <p className="text-sm text-muted-foreground">Mostrar política de cancelamento</p>
            </div>
            <Switch
              checked={data.show_cancellation_policy !== false}
              onCheckedChange={(checked) => onChange({ ...data, show_cancellation_policy: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}