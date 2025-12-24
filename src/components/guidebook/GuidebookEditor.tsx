import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SortableSection } from "./SortableSection";
import { GuidebookPreview } from "./GuidebookPreview";
import { ImageUpload } from "./ImageUpload";
import { UpsellManager } from "./UpsellManager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Eye,
  Settings,
  Palette,
  Languages,
  ArrowLeft,
  Smartphone,
  Monitor,
  Info,
  Wifi,
  Key,
  Car,
  Coffee,
  MapPin,
  Globe,
  QrCode,
  ShoppingBag,
} from "lucide-react";

interface GuidebookEditorProps {
  guidebookId: string;
  onBack: () => void;
}

const LANGUAGES = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const SECTION_TYPES = [
  { type: "welcome", icon: Info, label: "Boas-vindas", defaultTitle: { pt: "Boas-vindas", en: "Welcome" } },
  { type: "wifi", icon: Wifi, label: "WiFi", defaultTitle: { pt: "WiFi", en: "WiFi" } },
  { type: "checkin", icon: Key, label: "Check-in", defaultTitle: { pt: "Check-in", en: "Check-in" } },
  { type: "checkout", icon: Key, label: "Check-out", defaultTitle: { pt: "Check-out", en: "Check-out" } },
  { type: "parking", icon: Car, label: "Estacionamento", defaultTitle: { pt: "Estacionamento", en: "Parking" } },
  { type: "amenities", icon: Coffee, label: "Comodidades", defaultTitle: { pt: "Comodidades", en: "Amenities" } },
  { type: "location", icon: MapPin, label: "Localização", defaultTitle: { pt: "Localização", en: "Location" } },
  { type: "rules", icon: Info, label: "Regras da Casa", defaultTitle: { pt: "Regras da Casa", en: "House Rules" } },
  { type: "emergency", icon: Info, label: "Emergência", defaultTitle: { pt: "Emergência", en: "Emergency" } },
  { type: "tours", icon: Globe, label: "Tours & Experiências", defaultTitle: { pt: "Tours & Experiências", en: "Tours & Experiences" } },
];

interface Section {
  id: string;
  section_type: string;
  title: Record<string, string>;
  content: Record<string, string>;
  icon: string | null;
  is_visible: boolean;
  order_index: number;
}

export const GuidebookEditor = ({ guidebookId, onBack }: GuidebookEditorProps) => {
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState("pt");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [activeTab, setActiveTab] = useState("sections");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch guidebook
  const { data: guidebook, isLoading: loadingGuidebook } = useQuery({
    queryKey: ["guidebook", guidebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebooks")
        .select("*")
        .eq("id", guidebookId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch sections
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["guidebook-sections", guidebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebook_sections")
        .select("*")
        .eq("guidebook_id", guidebookId)
        .order("order_index");
      if (error) throw error;
      return data as Section[];
    },
  });

  // Update guidebook mutation
  const updateGuidebook = useMutation({
    mutationFn: async (updates: Partial<typeof guidebook>) => {
      const { error } = await supabase
        .from("guidebooks")
        .update(updates)
        .eq("id", guidebookId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook", guidebookId] });
      toast.success("Guidebook atualizado!");
    },
  });

  // Add section mutation
  const addSection = useMutation({
    mutationFn: async (sectionType: string) => {
      const sectionTemplate = SECTION_TYPES.find((s) => s.type === sectionType);
      const maxOrder = Math.max(0, ...sections.map((s) => s.order_index));
      
      const { error } = await supabase.from("guidebook_sections").insert({
        guidebook_id: guidebookId,
        section_type: sectionType,
        title: sectionTemplate?.defaultTitle || { pt: sectionType, en: sectionType },
        content: { pt: "", en: "" },
        icon: sectionType,
        order_index: maxOrder + 1,
        is_visible: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-sections", guidebookId] });
      toast.success("Secção adicionada!");
    },
  });

  // Update section mutation
  const updateSection = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Section> }) => {
      const { error } = await supabase
        .from("guidebook_sections")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-sections", guidebookId] });
    },
  });

  // Delete section mutation
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("guidebook_sections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-sections", guidebookId] });
      toast.success("Secção removida!");
    },
  });

  // Reorder sections mutation
  const reorderSections = useMutation({
    mutationFn: async (newOrder: { id: string; order_index: number }[]) => {
      for (const item of newOrder) {
        await supabase
          .from("guidebook_sections")
          .update({ order_index: item.order_index })
          .eq("id", item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidebook-sections", guidebookId] });
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);

      const newOrder = newSections.map((s, i) => ({ id: s.id, order_index: i }));
      reorderSections.mutate(newOrder);
    },
    [sections, reorderSections]
  );

  const handleSectionUpdate = (id: string, field: string, value: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    if (field === "title" || field === "content") {
      updateSection.mutate({
        id,
        updates: {
          [field]: { ...section[field], [selectedLanguage]: value },
        },
      });
    } else {
      updateSection.mutate({ id, updates: { [field]: value } });
    }
  };

  if (loadingGuidebook) {
    return <div className="p-8 text-center text-muted-foreground">A carregar...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{guidebook?.title}</h1>
            <p className="text-sm text-muted-foreground">Editor de Guidebook</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedLanguage(lang.code)}
                className="px-2"
              >
                {lang.flag}
              </Button>
            ))}
          </div>

          {/* Preview mode toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="icon"
              onClick={() => setPreviewMode("mobile")}
              className="h-8 w-8"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="icon"
              onClick={() => setPreviewMode("desktop")}
              className="h-8 w-8"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() =>
              updateGuidebook.mutate({ is_published: !guidebook?.is_published })
            }
            variant={guidebook?.is_published ? "secondary" : "default"}
          >
            {guidebook?.is_published ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="w-1/2 border-r overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b px-4 pt-2">
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Secções
              </TabsTrigger>
              <TabsTrigger value="upsells" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Upsells
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Definições
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Add section buttons */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Adicionar Secção</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-2">
                        {SECTION_TYPES.map((section) => {
                          const Icon = section.icon;
                          const exists = sections.some((s) => s.section_type === section.type);
                          return (
                            <Button
                              key={section.type}
                              variant="outline"
                              size="sm"
                              className="flex flex-col h-auto py-2 gap-1"
                              onClick={() => addSection.mutate(section.type)}
                              disabled={exists}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-[10px]">{section.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sortable sections */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sections.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          selectedLanguage={selectedLanguage}
                          onUpdate={handleSectionUpdate}
                          onDelete={() => deleteSection.mutate(section.id)}
                          onToggleVisibility={() =>
                            updateSection.mutate({
                              id: section.id,
                              updates: { is_visible: !section.is_visible },
                            })
                          }
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {sections.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Adicione secções ao seu guidebook</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="upsells" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <UpsellManager 
                    guidebookId={guidebookId} 
                    selectedLanguage={selectedLanguage} 
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Título do Guidebook</Label>
                    <Input
                      value={guidebook?.title || ""}
                      onChange={(e) => updateGuidebook.mutate({ title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mensagem de Boas-vindas</Label>
                    <Textarea
                      value={guidebook?.welcome_message || ""}
                      onChange={(e) =>
                        updateGuidebook.mutate({ welcome_message: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <ImageUpload
                    currentUrl={guidebook?.logo_url || null}
                    onUpload={(url) => updateGuidebook.mutate({ logo_url: url })}
                    onRemove={() => updateGuidebook.mutate({ logo_url: null })}
                    label="Logo"
                    aspectRatio="square"
                    guidebookId={guidebookId}
                  />

                  <ImageUpload
                    currentUrl={guidebook?.cover_image_url || null}
                    onUpload={(url) => updateGuidebook.mutate({ cover_image_url: url })}
                    onRemove={() => updateGuidebook.mutate({ cover_image_url: null })}
                    label="Imagem de Capa"
                    aspectRatio="wide"
                    guidebookId={guidebookId}
                  />

                  <div className="space-y-2">
                    <Label>Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={guidebook?.primary_color || "#1a7a6e"}
                        onChange={(e) =>
                          updateGuidebook.mutate({ primary_color: e.target.value })
                        }
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={guidebook?.primary_color || "#1a7a6e"}
                        onChange={(e) =>
                          updateGuidebook.mutate({ primary_color: e.target.value })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Idiomas Disponíveis</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((lang) => {
                        const isActive = (guidebook?.languages as string[] || []).includes(
                          lang.code
                        );
                        return (
                          <Badge
                            key={lang.code}
                            variant={isActive ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = (guidebook?.languages as string[]) || [];
                              const updated = isActive
                                ? current.filter((l) => l !== lang.code)
                                : [...current, lang.code];
                              updateGuidebook.mutate({ languages: updated });
                            }}
                          >
                            {lang.flag} {lang.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="qrcode" className="flex-1 m-0 p-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Partilhe este QR Code com os seus hóspedes para acederem ao guidebook
                    </p>
                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                      {/* QR Code will be shown in preview */}
                      <div className="w-48 h-48 bg-muted flex items-center justify-center">
                        <QrCode className="h-24 w-24 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      URL: /guidebook/{guidebookId}
                    </p>
                    <Button variant="outline" className="mt-4">
                      Descarregar QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview panel */}
        <div className="w-1/2 bg-muted/50 p-4 overflow-hidden">
          <GuidebookPreview
            guidebook={guidebook}
            sections={sections}
            selectedLanguage={selectedLanguage}
            previewMode={previewMode}
          />
        </div>
      </div>
    </div>
  );
};
