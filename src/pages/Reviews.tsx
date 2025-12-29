import { useState, useEffect } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Star, Plus, MessageSquare, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Review {
  id: string;
  property_id: string;
  platform: string;
  guest_name: string;
  rating: number;
  review_text: string | null;
  review_date: string;
  response_text: string | null;
  response_date: string | null;
}

const platformOptions = [
  { value: "airbnb", label: "Airbnb", color: "#FF5A5F" },
  { value: "booking", label: "Booking.com", color: "#003580" },
  { value: "direct", label: "Reserva Direta", color: "hsl(var(--primary))" },
  { value: "other", label: "Outra", color: "#6B7280" },
];

export default function Reviews() {
  const { properties, selectedPropertyId } = useProperty();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    platform: "airbnb",
    guest_name: "",
    rating: 5,
    review_text: "",
    review_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    loadReviews();
  }, [selectedPropertyId]);

  const loadReviews = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from("property_reviews")
      .select("*")
      .order("review_date", { ascending: false });

    if (selectedPropertyId) {
      query = query.eq("property_id", selectedPropertyId);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setReviews(data);
    }
    setIsLoading(false);
  };

  const handleAddReview = async () => {
    if (!selectedPropertyId || !newReview.guest_name) {
      toast({
        title: "Erro",
        description: "Selecione uma propriedade e preencha o nome do hóspede.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("property_reviews").insert({
      property_id: selectedPropertyId,
      platform: newReview.platform,
      guest_name: newReview.guest_name,
      rating: newReview.rating,
      review_text: newReview.review_text || null,
      review_date: newReview.review_date,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a review.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Review adicionada" });
    setNewReview({
      platform: "airbnb",
      guest_name: "",
      rating: 5,
      review_text: "",
      review_date: format(new Date(), "yyyy-MM-dd"),
    });
    setAddDialogOpen(false);
    loadReviews();
  };

  const handleAddResponse = async () => {
    if (!selectedReview || !responseText) return;

    const { error } = await supabase
      .from("property_reviews")
      .update({
        response_text: responseText,
        response_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", selectedReview.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resposta.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Resposta adicionada" });
    setResponseText("");
    setResponseDialogOpen(false);
    setSelectedReview(null);
    loadReviews();
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("property_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a review.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Review removida" });
    loadReviews();
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.floor(Number(r.rating)) === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => Math.floor(Number(r.rating)) === rating).length / reviews.length) * 100
      : 0,
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
      />
    ));
  };

  const getPlatformInfo = (platform: string) => {
    return platformOptions.find((p) => p.value === platform) || platformOptions[3];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Reviews"
          description="Gerir avaliações das propriedades"
        />
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedPropertyId}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Review</DialogTitle>
              <DialogDescription>
                Adicione uma nova avaliação manualmente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select
                  value={newReview.platform}
                  onValueChange={(value) => setNewReview({ ...newReview, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome do Hóspede</Label>
                <Input
                  value={newReview.guest_name}
                  onChange={(e) => setNewReview({ ...newReview, guest_name: e.target.value })}
                  placeholder="Nome do hóspede"
                />
              </div>

              <div className="space-y-2">
                <Label>Classificação</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${rating <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data da Review</Label>
                <Input
                  type="date"
                  value={newReview.review_date}
                  onChange={(e) => setNewReview({ ...newReview, review_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Comentário</Label>
                <Textarea
                  value={newReview.review_text}
                  onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                  placeholder="Comentário do hóspede (opcional)"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddReview}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">5 Estrelas</p>
                <p className="text-2xl font-bold">{ratingDistribution[0].count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Distribuição</p>
              {ratingDistribution.map(({ rating, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs w-3">{rating}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
          <CardDescription>
            Lista de todas as reviews das propriedades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">A carregar...</div>
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Sem reviews registadas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead className="hidden md:table-cell">Comentário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const platformInfo = getPlatformInfo(review.platform);
                  return (
                    <TableRow key={review.id}>
                      <TableCell>
                        {format(new Date(review.review_date), "dd/MM/yyyy", { locale: pt })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: platformInfo.color, color: "#fff" }}
                        >
                          {platformInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{review.guest_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {renderStars(Number(review.rating))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {review.review_text || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setResponseText(review.response_text || "");
                              setResponseDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder à Review</DialogTitle>
            <DialogDescription>
              Adicionar ou editar resposta à avaliação de {selectedReview?.guest_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="flex gap-0.5 mb-2">
                {selectedReview && renderStars(Number(selectedReview.rating))}
              </div>
              <p className="text-sm">{selectedReview?.review_text || "Sem comentário"}</p>
            </div>
            
            <Label>Sua Resposta</Label>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Escreva a sua resposta..."
              rows={4}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddResponse}>Guardar Resposta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
