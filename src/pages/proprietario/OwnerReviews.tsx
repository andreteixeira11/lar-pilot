import { useState, useEffect } from "react";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";

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

export default function OwnerReviews() {
  const { owner } = useOwnerAuth();
  const { t, language } = useOwnerLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dateLocale = language === "pt" ? pt : enUS;

  useEffect(() => {
    if (owner?.propertyId) {
      loadReviews();
    }
  }, [owner?.propertyId]);

  const loadReviews = async () => {
    if (!owner?.propertyId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("property_reviews")
      .select("*")
      .eq("property_id", owner.propertyId)
      .order("review_date", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setIsLoading(false);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {language === "pt" ? "Avaliações" : "Reviews"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === "pt" ? "Avaliações da sua propriedade" : "Reviews for your property"}
        </p>
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
                <p className="text-sm text-muted-foreground">
                  {language === "pt" ? "Média Geral" : "Average Rating"}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {language === "pt" ? "Total Reviews" : "Total Reviews"}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {language === "pt" ? "5 Estrelas" : "5 Stars"}
                </p>
                <p className="text-2xl font-bold">{ratingDistribution[0].count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === "pt" ? "Distribuição" : "Distribution"}
              </p>
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

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "pt" ? "Avaliações" : "Reviews"}</CardTitle>
          <CardDescription>
            {language === "pt"
              ? "Lista de todas as avaliações da sua propriedade"
              : "List of all reviews for your property"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {language === "pt" ? "Sem avaliações registadas" : "No reviews yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const platformInfo = getPlatformInfo(review.platform);
                return (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          style={{ backgroundColor: platformInfo.color, color: "#fff" }}
                        >
                          {platformInfo.label}
                        </Badge>
                        <span className="font-medium">{review.guest_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {renderStars(Number(review.rating))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.review_date), "dd/MM/yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                    </div>

                    {review.review_text && (
                      <p className="text-sm text-foreground">{review.review_text}</p>
                    )}

                    {review.response_text && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {language === "pt" ? "Resposta do gestor" : "Manager response"} -{" "}
                          {review.response_date &&
                            format(new Date(review.response_date), "dd/MM/yyyy", { locale: dateLocale })}
                        </p>
                        <p className="text-sm">{review.response_text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
