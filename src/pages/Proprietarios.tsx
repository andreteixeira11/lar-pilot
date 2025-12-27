import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Users,
  Trash2,
  Edit,
  Mail,
  Percent,
  FileUp,
  FolderOpen,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  ShowerHead,
  Wrench,
  Sparkles,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PropertyOwner {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string | null;
  commission_rate: number;
  created_at: string;
  property?: {
    name: string;
  };
}

interface OwnerDocument {
  id: string;
  document_type: string;
  name: string;
  file_url: string;
  created_at: string;
}

interface OwnerCost {
  id: string;
  cost_type: string;
  description: string | null;
  amount: number;
  month: string;
}

const documentTypeOptions = [
  { value: "contrato", label: "Contrato de Gestão" },
  { value: "fatura", label: "Fatura" },
  { value: "relatorio", label: "Relatório" },
  { value: "outros", label: "Outros" },
];

const costTypeOptions = [
  { value: "limpeza", label: "Limpeza", icon: ShowerHead },
  { value: "manutencao", label: "Manutenção", icon: Wrench },
  { value: "outros", label: "Outros", icon: Sparkles },
];

export default function Proprietarios() {
  const { user } = useAuth();
  const { properties, selectedPropertyId } = useProperty();
  const { toast } = useToast();

  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [ownerDocuments, setOwnerDocuments] = useState<OwnerDocument[]>([]);
  const [ownerCosts, setOwnerCosts] = useState<OwnerCost[]>([]);

  // Add owner dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newOwner, setNewOwner] = useState({
    property_id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    commission_rate: 15,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit owner dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<PropertyOwner | null>(null);

  // Add document dialog
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    document_type: "outros",
    name: "",
    file: null as File | null,
  });
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Add cost dialog
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [newCost, setNewCost] = useState({
    cost_type: "limpeza",
    description: "",
    amount: 0,
    month: format(new Date(), "yyyy-MM"),
  });

  useEffect(() => {
    loadOwners();
  }, [user]);

  useEffect(() => {
    if (selectedOwner) {
      loadOwnerDocuments(selectedOwner.id);
      loadOwnerCosts(selectedOwner.property_id);
    }
  }, [selectedOwner]);

  const loadOwners = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("property_owners")
      .select(`
        *,
        property:properties(name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOwners(data as PropertyOwner[]);
    }
    setIsLoading(false);
  };

  const loadOwnerDocuments = async (ownerId: string) => {
    const { data } = await supabase
      .from("owner_documents")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    setOwnerDocuments(data || []);
  };

  const loadOwnerCosts = async (propertyId: string) => {
    const { data } = await supabase
      .from("owner_costs")
      .select("*")
      .eq("property_id", propertyId)
      .order("month", { ascending: false });

    setOwnerCosts(data || []);
  };

  const handleAddOwner = async () => {
    if (!newOwner.property_id || !newOwner.name || !newOwner.email || !newOwner.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("property_owners").insert({
      property_id: newOwner.property_id,
      name: newOwner.name,
      email: newOwner.email,
      phone: newOwner.phone || null,
      password_hash: newOwner.password, // Will be hashed by trigger
      commission_rate: newOwner.commission_rate,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message.includes("unique")
          ? "Já existe um proprietário com este email."
          : "Não foi possível adicionar o proprietário.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Proprietário adicionado",
      description: "O proprietário pode agora aceder ao portal.",
    });

    setNewOwner({
      property_id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      commission_rate: 15,
    });
    setAddDialogOpen(false);
    loadOwners();
  };

  const handleUpdateOwner = async () => {
    if (!editOwner) return;

    const { error } = await supabase
      .from("property_owners")
      .update({
        name: editOwner.name,
        email: editOwner.email,
        phone: editOwner.phone,
        commission_rate: editOwner.commission_rate,
      })
      .eq("id", editOwner.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o proprietário.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Proprietário atualizado" });
    setEditDialogOpen(false);
    setEditOwner(null);
    loadOwners();
  };

  const handleDeleteOwner = async (ownerId: string) => {
    const { error } = await supabase
      .from("property_owners")
      .delete()
      .eq("id", ownerId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o proprietário.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Proprietário removido" });
    if (selectedOwner?.id === ownerId) {
      setSelectedOwner(null);
    }
    loadOwners();
  };

  const handleUploadDocument = async () => {
    if (!selectedOwner || !newDoc.file || !newDoc.name) {
      toast({
        title: "Erro",
        description: "Selecione um ficheiro e dê-lhe um nome.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingDoc(true);

    try {
      // Upload file
      const fileExt = newDoc.file.name.split(".").pop();
      const filePath = `${selectedOwner.property_id}/${selectedOwner.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("insurance-documents")
        .upload(filePath, newDoc.file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("insurance-documents")
        .getPublicUrl(filePath);

      // Create document record
      const { error: dbError } = await supabase.from("owner_documents").insert({
        property_id: selectedOwner.property_id,
        owner_id: selectedOwner.id,
        document_type: newDoc.document_type,
        name: newDoc.name,
        file_url: urlData.publicUrl,
        file_size: newDoc.file.size,
        uploaded_by: user?.id,
      });

      if (dbError) throw dbError;

      toast({ title: "Documento enviado" });
      setNewDoc({ document_type: "outros", name: "", file: null });
      setDocDialogOpen(false);
      loadOwnerDocuments(selectedOwner.id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleAddCost = async () => {
    if (!selectedOwner || newCost.amount <= 0) {
      toast({
        title: "Erro",
        description: "Introduza um valor válido.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("owner_costs").insert({
      property_id: selectedOwner.property_id,
      cost_type: newCost.cost_type,
      description: newCost.description || null,
      amount: newCost.amount,
      month: newCost.month,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registar o custo.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Custo registado" });
    setNewCost({
      cost_type: "limpeza",
      description: "",
      amount: 0,
      month: format(new Date(), "yyyy-MM"),
    });
    setCostDialogOpen(false);
    loadOwnerCosts(selectedOwner.property_id);
  };

  const handleDeleteCost = async (costId: string) => {
    const { error } = await supabase
      .from("owner_costs")
      .delete()
      .eq("id", costId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o custo.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Custo removido" });
    if (selectedOwner) {
      loadOwnerCosts(selectedOwner.property_id);
    }
  };

  const copyPortalLink = () => {
    const link = `${window.location.origin}/proprietario/login`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Proprietários"
        description="Gerir proprietários e acesso ao portal"
      />

      <div className="mt-6 space-y-6">
        {/* Portal Link Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium">Link do Portal do Proprietário</h3>
                <p className="text-sm text-muted-foreground">
                  Partilhe este link com os proprietários para acederem ao portal.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-muted rounded-lg text-sm">
                  {window.location.origin}/proprietario/login
                </code>
                <Button variant="outline" size="icon" onClick={copyPortalLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Owners List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Proprietários
                </CardTitle>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Proprietário</DialogTitle>
                      <DialogDescription>
                        Crie credenciais de acesso ao portal para o proprietário.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Propriedade *</Label>
                        <Select
                          value={newOwner.property_id}
                          onValueChange={(v) =>
                            setNewOwner({ ...newOwner, property_id: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar propriedade" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input
                          value={newOwner.name}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, name: e.target.value })
                          }
                          placeholder="Nome do proprietário"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={newOwner.email}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, email: e.target.value })
                          }
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={newOwner.phone}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, phone: e.target.value })
                          }
                          placeholder="+351 912 345 678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password *</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={newOwner.password}
                            onChange={(e) =>
                              setNewOwner({ ...newOwner, password: e.target.value })
                            }
                            placeholder="Password de acesso"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Comissão de Gestão (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={newOwner.commission_rate}
                          onChange={(e) =>
                            setNewOwner({
                              ...newOwner,
                              commission_rate: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddOwner} disabled={isSubmitting}>
                        {isSubmitting ? "A adicionar..." : "Adicionar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  A carregar...
                </div>
              ) : owners.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sem proprietários registados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {owners.map((owner) => (
                    <div
                      key={owner.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedOwner?.id === owner.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedOwner(owner)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(owner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{owner.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {owner.property?.name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <Percent className="h-3 w-3 mr-1" />
                        {owner.commission_rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Details */}
          <Card className="lg:col-span-2">
            {!selectedOwner ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um proprietário para ver os detalhes</p>
                </div>
              </div>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(selectedOwner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedOwner.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {selectedOwner.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditOwner(selectedOwner)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Proprietário</DialogTitle>
                          </DialogHeader>
                          {editOwner && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                  value={editOwner.name}
                                  onChange={(e) =>
                                    setEditOwner({ ...editOwner, name: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={editOwner.email}
                                  onChange={(e) =>
                                    setEditOwner({ ...editOwner, email: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                  value={editOwner.phone || ""}
                                  onChange={(e) =>
                                    setEditOwner({ ...editOwner, phone: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Comissão (%)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editOwner.commission_rate}
                                  onChange={(e) =>
                                    setEditOwner({
                                      ...editOwner,
                                      commission_rate: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={handleUpdateOwner}>Guardar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover proprietário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação remove o acesso do proprietário ao portal.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteOwner(selectedOwner.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="documents" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="documents">Documentos</TabsTrigger>
                      <TabsTrigger value="costs">Custos</TabsTrigger>
                    </TabsList>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4">
                      <div className="flex justify-end">
                        <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <FileUp className="h-4 w-4 mr-2" />
                              Enviar Documento
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enviar Documento</DialogTitle>
                              <DialogDescription>
                                O documento ficará disponível para o proprietário no portal.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Tipo de Documento</Label>
                                <Select
                                  value={newDoc.document_type}
                                  onValueChange={(v) =>
                                    setNewDoc({ ...newDoc, document_type: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {documentTypeOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Nome do Documento</Label>
                                <Input
                                  value={newDoc.name}
                                  onChange={(e) =>
                                    setNewDoc({ ...newDoc, name: e.target.value })
                                  }
                                  placeholder="Ex: Contrato 2024"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ficheiro</Label>
                                <Input
                                  type="file"
                                  onChange={(e) =>
                                    setNewDoc({
                                      ...newDoc,
                                      file: e.target.files?.[0] || null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleUploadDocument}
                                disabled={isUploadingDoc}
                              >
                                {isUploadingDoc ? "A enviar..." : "Enviar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {ownerDocuments.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Sem documentos</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Documento</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ownerDocuments.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell>
                                  {documentTypeOptions.find((o) => o.value === doc.document_type)
                                    ?.label || doc.document_type}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(doc.created_at), "dd MMM yyyy", {
                                    locale: pt,
                                  })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(doc.file_url, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>

                    {/* Costs Tab */}
                    <TabsContent value="costs" className="space-y-4">
                      <div className="flex justify-end">
                        <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Registar Custo
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Registar Custo</DialogTitle>
                              <DialogDescription>
                                Os custos aparecem no financeiro do proprietário.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Tipo de Custo</Label>
                                <Select
                                  value={newCost.cost_type}
                                  onValueChange={(v) =>
                                    setNewCost({ ...newCost, cost_type: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {costTypeOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                          <opt.icon className="h-4 w-4" />
                                          {opt.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Input
                                  value={newCost.description}
                                  onChange={(e) =>
                                    setNewCost({ ...newCost, description: e.target.value })
                                  }
                                  placeholder="Ex: Reparação torneira"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Valor (€)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={newCost.amount}
                                  onChange={(e) =>
                                    setNewCost({
                                      ...newCost,
                                      amount: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Mês</Label>
                                <Input
                                  type="month"
                                  value={newCost.month}
                                  onChange={(e) =>
                                    setNewCost({ ...newCost, month: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddCost}>Registar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {ownerCosts.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Sem custos registados</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Mês</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ownerCosts.map((cost) => {
                              const costType = costTypeOptions.find(
                                (o) => o.value === cost.cost_type
                              );
                              return (
                                <TableRow key={cost.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {costType && <costType.icon className="h-4 w-4" />}
                                      {costType?.label || cost.cost_type}
                                    </div>
                                  </TableCell>
                                  <TableCell>{cost.description || "-"}</TableCell>
                                  <TableCell>{cost.month}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    €{cost.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remover custo?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteCost(cost.id)}
                                            className="bg-destructive text-destructive-foreground"
                                          >
                                            Remover
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
