import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label: string;
  aspectRatio?: "square" | "wide" | "cover";
  guidebookId: string;
}

export const ImageUpload = ({
  currentUrl,
  onUpload,
  onRemove,
  label,
  aspectRatio = "square",
  guidebookId,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    wide: "aspect-video",
    cover: "aspect-[3/2]",
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione um ficheiro de imagem");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter menos de 5MB");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${guidebookId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("guidebook-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("guidebook-images")
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
          currentUrl ? "border-transparent" : "border-border hover:border-primary/50"
        } transition-colors ${aspectClasses[aspectRatio]}`}
      >
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Alterar"
              )}
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">Clique para carregar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};
