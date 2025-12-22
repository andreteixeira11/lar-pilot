import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Wifi,
  Key,
  Car,
  Coffee,
  MapPin,
  Globe,
  ChevronRight,
} from "lucide-react";

interface Section {
  id: string;
  section_type: string;
  title: Record<string, string>;
  content: Record<string, string>;
  icon: string | null;
  is_visible: boolean;
  order_index: number;
}

interface GuidebookPreviewProps {
  guidebook: {
    id: string;
    title: string;
    welcome_message: string | null;
    primary_color: string | null;
    cover_image_url: string | null;
    logo_url: string | null;
    languages: unknown;
  } | null | undefined;
  sections: Section[];
  selectedLanguage: string;
  previewMode: "mobile" | "desktop";
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

export const GuidebookPreview = ({
  guidebook,
  sections,
  selectedLanguage,
  previewMode,
}: GuidebookPreviewProps) => {
  if (!guidebook) return null;

  const primaryColor = guidebook.primary_color || "#1a7a6e";
  const visibleSections = sections.filter((s) => s.is_visible);

  const containerClass =
    previewMode === "mobile"
      ? "w-[375px] h-[667px] mx-auto"
      : "w-full h-full";

  return (
    <div className="h-full flex items-center justify-center">
      <div
        className={`bg-background rounded-2xl shadow-2xl overflow-hidden ${containerClass}`}
        style={{
          boxShadow:
            previewMode === "mobile"
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              : undefined,
        }}
      >
        <ScrollArea className="h-full">
          {/* Header */}
          <div
            className="relative h-48 flex items-end p-6"
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

            <div className="relative z-10">
              {guidebook.logo_url && (
                <img
                  src={guidebook.logo_url}
                  alt="Logo"
                  className="h-12 w-auto mb-2"
                />
              )}
              <h1 className="text-2xl font-bold text-white">{guidebook.title}</h1>
            </div>
          </div>

          {/* Welcome message */}
          {guidebook.welcome_message && (
            <div className="p-6 border-b">
              <p className="text-muted-foreground">{guidebook.welcome_message}</p>
            </div>
          )}

          {/* Language selector preview */}
          <div className="p-4 border-b">
            <div className="flex gap-2 justify-center">
              {((guidebook.languages as string[]) || ["pt", "en"]).map((lang) => (
                <Badge
                  key={lang}
                  variant={lang === selectedLanguage ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    lang === selectedLanguage
                      ? { backgroundColor: primaryColor }
                      : undefined
                  }
                >
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="p-4 space-y-3">
            {visibleSections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma secção visível</p>
                <p className="text-sm">Adicione secções no editor</p>
              </div>
            ) : (
              visibleSections.map((section) => {
                const Icon = SECTION_ICONS[section.section_type] || Info;
                const title =
                  section.title?.[selectedLanguage] ||
                  section.title?.pt ||
                  section.section_type;

                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{title}</p>
                      {section.content?.[selectedLanguage] && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {section.content[selectedLanguage]}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 text-center text-xs text-muted-foreground border-t mt-4">
            <p>Powered by Monumenta</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
