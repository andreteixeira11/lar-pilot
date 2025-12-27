import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  FileCheck,
  FileWarning,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";

interface Document {
  id: string;
  document_type: string;
  name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

export default function OwnerDocumentos() {
  const { owner } = useOwnerAuth();
  const { t, language } = useOwnerLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const dateLocale = language === "pt" ? pt : enUS;

  const documentTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    contrato: {
      label: t("documents.contract"),
      icon: <FileCheck className="w-4 h-4" />,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    fatura: {
      label: t("documents.invoice"),
      icon: <FileText className="w-4 h-4" />,
      color: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    relatorio: {
      label: t("documents.report"),
      icon: <FileWarning className="w-4 h-4" />,
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    outros: {
      label: t("documents.other"),
      icon: <FolderOpen className="w-4 h-4" />,
      color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    },
  };

  useEffect(() => {
    if (owner?.propertyId) {
      loadDocuments();
    }
  }, [owner?.propertyId]);

  const loadDocuments = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("owner_documents")
        .select("*")
        .eq("owner_id", owner.ownerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading documents:", error);
        return;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error("Documents error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: dateLocale });
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    link.click();
  };

  // Filter documents
  const filteredDocuments = selectedType
    ? documents.filter((d) => d.document_type === selectedType)
    : documents;

  // Group by type for summary
  const groupedByType = documents.reduce(
    (acc, doc) => {
      const type = doc.document_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("documents.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("documents.subtitle")}
        </p>
      </div>

      {/* Type Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${
            selectedType === null ? "ring-2 ring-primary" : "hover:bg-muted/50"
          }`}
          onClick={() => setSelectedType(null)}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{language === "pt" ? "Todos" : "All"}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{documents.length}</p>
          </CardContent>
        </Card>

        {Object.entries(documentTypeLabels).map(([type, config]) => (
          <Card
            key={type}
            className={`cursor-pointer transition-colors ${
              selectedType === type ? "ring-2 ring-primary" : "hover:bg-muted/50"
            }`}
            onClick={() => setSelectedType(type === selectedType ? null : type)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                {config.icon}
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{groupedByType[type] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "pt" ? "Lista de Documentos" : "Document List"}</CardTitle>
          <CardDescription>
            {selectedType
              ? `${language === "pt" ? "A mostrar:" : "Showing:"} ${documentTypeLabels[selectedType]?.label || selectedType}`
              : language === "pt" ? "Todos os documentos disponíveis" : "All available documents"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t("documents.noDocuments")}</p>
              <p className="text-sm mt-1">
                {selectedType
                  ? (language === "pt" ? "Não existem documentos deste tipo" : "No documents of this type")
                  : (language === "pt" ? "O seu gestor ainda não partilhou documentos consigo" : "Your manager hasn't shared any documents yet")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "pt" ? "Documento" : "Document"}</TableHead>
                    <TableHead>{t("documents.type")}</TableHead>
                    <TableHead>{t("documents.date")}</TableHead>
                    <TableHead>{language === "pt" ? "Tamanho" : "Size"}</TableHead>
                    <TableHead className="text-right">{t("documents.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const typeConfig = documentTypeLabels[doc.document_type] || documentTypeLabels.outros;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeConfig.color}>
                            {typeConfig.icon}
                            <span className="ml-1">{typeConfig.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.file_url, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc.file_url, doc.name)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {t("common.download")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
