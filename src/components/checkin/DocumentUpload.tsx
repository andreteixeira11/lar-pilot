import * as React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, FileCheck } from "lucide-react";

interface DocumentUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  uploadLabel: string;
  photoLabel: string;
  uploadedLabel: string;
  removeLabel: string;
}

export function DocumentUpload({
  value,
  onChange,
  uploadLabel,
  photoLabel,
  uploadedLabel,
  removeLabel,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <FileCheck className="h-5 w-5 text-primary" />
        <span className="flex-1 text-sm">{uploadedLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(undefined)}
          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-1" />
          {removeLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploadLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => cameraInputRef.current?.click()}
        className="flex-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Camera className="h-4 w-4 mr-2" />
        {photoLabel}
      </Button>
    </div>
  );
}
