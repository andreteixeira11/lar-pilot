import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  Wifi,
  Key,
  Car,
  Coffee,
  MapPin,
  Globe,
} from "lucide-react";
import { useState } from "react";

interface Section {
  id: string;
  section_type: string;
  title: Record<string, string>;
  content: Record<string, string>;
  icon: string | null;
  is_visible: boolean;
  order_index: number;
}

interface SortableSectionProps {
  section: Section;
  selectedLanguage: string;
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
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

export const SortableSection = ({
  section,
  selectedLanguage,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: SortableSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = SECTION_ICONS[section.section_type] || Info;
  const title = section.title?.[selectedLanguage] || section.title?.pt || section.section_type;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${!section.is_visible ? "opacity-60" : ""}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="p-3">
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab hover:bg-muted rounded p-1"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {section.section_type}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleVisibility}
              >
                {section.is_visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Título ({selectedLanguage.toUpperCase()})</Label>
                <Input
                  value={section.title?.[selectedLanguage] || ""}
                  onChange={(e) => onUpdate(section.id, "title", e.target.value)}
                  placeholder={`Título em ${selectedLanguage}`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Conteúdo ({selectedLanguage.toUpperCase()})</Label>
                <Textarea
                  value={section.content?.[selectedLanguage] || ""}
                  onChange={(e) => onUpdate(section.id, "content", e.target.value)}
                  placeholder={`Conteúdo em ${selectedLanguage}`}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Visível</Label>
                <Switch
                  checked={section.is_visible}
                  onCheckedChange={onToggleVisibility}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
