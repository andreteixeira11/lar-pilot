import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Info,
  Wifi,
  Key,
  Car,
  Coffee,
  MapPin,
  Globe,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  ShoppingCart,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  section_type: string;
  title: Record<string, string>;
  content: Record<string, string>;
  icon: string | null;
  is_visible: boolean;
  order_index: number;
}

interface Upsell {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category: string | null;
}

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  welcome: Info,
  wifi: Wifi,
  checkin: Key,
  checkout: Key,
  parking: Car,
  amenities: Coffee,
  location: MapPin,
  rules: Info,
  emergency: Info,
  tours: Globe,
};

const LANGUAGES = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const PublicGuidebook = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedLanguage, setSelectedLanguage] = useState("pt");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [copied, setCopied] = useState(false);

  // Detect browser language
  useEffect(() => {
    const browserLang = navigator.language.split("-")[0];
    if (["pt", "en", "de", "es", "fr"].includes(browserLang)) {
      setSelectedLanguage(browserLang);
    }
  }, []);

  // Fetch guidebook
  const { data: guidebook, isLoading: loadingGuidebook, error } = useQuery({
    queryKey: ["public-guidebook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebooks")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch sections
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["public-guidebook-sections", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebook_sections")
        .select("*")
        .eq("guidebook_id", id)
        .eq("is_visible", true)
        .order("order_index");
      if (error) throw error;
      return data as Section[];
    },
    enabled: !!id,
  });

  // Fetch upsells
  const { data: upsells = [] } = useQuery({
    queryKey: ["public-guidebook-upsells", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidebook_upsells")
        .select("*")
        .eq("guidebook_id", id)
        .eq("is_available", true);
      if (error) throw error;
      return data as Upsell[];
    },
    enabled: !!id,
  });

  const handleCopyWifi = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingGuidebook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-lg p-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !guidebook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Guidebook não encontrado</h2>
            <p className="text-muted-foreground">
              Este guidebook não existe ou não está publicado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryColor = guidebook.primary_color || "#1a7a6e";
  const availableLanguages = (guidebook.languages as string[]) || ["pt", "en"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="relative h-56 flex items-end"
        style={{ backgroundColor: primaryColor }}
      >
        {guidebook.cover_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${guidebook.cover_image_url})` }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${primaryColor}, transparent)`,
              }}
            />
          </div>
        )}

        <div className="relative z-10 p-6 w-full">
          {guidebook.logo_url && (
            <img
              src={guidebook.logo_url}
              alt="Logo"
              className="h-12 w-auto mb-3"
            />
          )}
          <h1 className="text-3xl font-bold text-white">{guidebook.title}</h1>
        </div>
      </div>

      {/* Language selector */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="flex justify-center gap-2 p-3">
          {availableLanguages.map((langCode) => {
            const lang = LANGUAGES.find((l) => l.code === langCode);
            return (
              <Button
                key={langCode}
                variant={selectedLanguage === langCode ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(langCode)}
                style={
                  selectedLanguage === langCode
                    ? { backgroundColor: primaryColor }
                    : undefined
                }
              >
                {lang?.flag} {lang?.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Welcome message */}
      {guidebook.welcome_message && (
        <div className="p-6 border-b">
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            {guidebook.welcome_message}
          </p>
        </div>
      )}

      {/* Sections */}
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.section_type] || Info;
          const title =
            section.title?.[selectedLanguage] ||
            section.title?.pt ||
            section.section_type;

          return (
            <button
              key={section.id}
              className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors text-left"
              onClick={() => setSelectedSection(section)}
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{title}</p>
                {section.content?.[selectedLanguage] && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {section.content[selectedLanguage]}
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}

        {/* Upsells */}
        {upsells.length > 0 && (
          <div className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" style={{ color: primaryColor }} />
              {selectedLanguage === "pt"
                ? "Serviços Adicionais"
                : "Additional Services"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {upsells.map((upsell) => (
                <Card key={upsell.id} className="overflow-hidden">
                  {upsell.image_url && (
                    <div
                      className="h-32 bg-cover bg-center"
                      style={{ backgroundImage: `url(${upsell.image_url})` }}
                    />
                  )}
                  <CardContent className="pt-4">
                    <h3 className="font-medium">
                      {upsell.name?.[selectedLanguage] || upsell.name?.pt}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {upsell.description?.[selectedLanguage] ||
                        upsell.description?.pt}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className="text-lg font-bold"
                        style={{ color: primaryColor }}
                      >
                        €{upsell.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {selectedLanguage === "pt" ? "Reservar" : "Book"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-muted-foreground border-t mt-8">
        <p>Powered by Monumenta</p>
      </div>

      {/* Section Detail Dialog */}
      <Dialog
        open={!!selectedSection}
        onOpenChange={() => setSelectedSection(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedSection && (
                <>
                  {(() => {
                    const Icon =
                      SECTION_ICONS[selectedSection.section_type] || Info;
                    return (
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: primaryColor }}
                        />
                      </div>
                    );
                  })()}
                  {selectedSection.title?.[selectedLanguage] ||
                    selectedSection.title?.pt}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSection && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">
                  {selectedSection.content?.[selectedLanguage] ||
                    selectedSection.content?.pt ||
                    "Sem conteúdo"}
                </p>
              </div>

              {/* WiFi special action */}
              {selectedSection.section_type === "wifi" &&
                selectedSection.content?.[selectedLanguage] && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handleCopyWifi(
                        selectedSection.content[selectedLanguage] || ""
                      )
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied
                      ? selectedLanguage === "pt"
                        ? "Copiado!"
                        : "Copied!"
                      : selectedLanguage === "pt"
                      ? "Copiar Password"
                      : "Copy Password"}
                  </Button>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicGuidebook;
