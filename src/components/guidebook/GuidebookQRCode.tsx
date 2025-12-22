import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface GuidebookQRCodeProps {
  guidebookId: string;
  title: string;
  primaryColor?: string;
}

export const GuidebookQRCode = ({
  guidebookId,
  title,
  primaryColor = "#1a7a6e",
}: GuidebookQRCodeProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${window.location.origin}/guidebook/${guidebookId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      
      if (ctx) {
        // White background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success("QR Code descarregado!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <p className="text-muted-foreground">
            Partilhe este QR Code com os seus hóspedes para acederem ao guidebook
          </p>

          <div
            ref={qrRef}
            className="inline-block p-6 bg-white rounded-2xl shadow-lg"
          >
            <QRCodeSVG
              value={publicUrl}
              size={200}
              level="H"
              includeMargin={false}
              fgColor={primaryColor}
              style={{
                height: "auto",
                maxWidth: "100%",
                width: "100%",
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground break-all">{publicUrl}</p>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descarregar QR
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
