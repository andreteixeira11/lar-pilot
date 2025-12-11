import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, MapPin, Users, Calendar, Euro } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const AdminProperties = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reservationsStats } = useQuery({
    queryKey: ["admin-reservations-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("property_id, total_price")
        .eq("status", "confirmada");
      if (error) throw error;

      const stats: Record<string, { count: number; revenue: number }> = {};
      data?.forEach((r) => {
        if (!stats[r.property_id]) {
          stats[r.property_id] = { count: 0, revenue: 0 };
        }
        stats[r.property_id].count++;
        stats[r.property_id].revenue += Number(r.total_price) || 0;
      });

      return stats;
    },
  });

  const filteredProperties = properties?.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.rnal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by revenue
  const sortedProperties = filteredProperties?.sort((a, b) => {
    const revenueA = reservationsStats?.[a.id]?.revenue || 0;
    const revenueB = reservationsStats?.[b.id]?.revenue || 0;
    return revenueB - revenueA;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Gestão de Propriedades"
        description="Ver todas as propriedades e o seu desempenho"
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Propriedades ({sortedProperties?.length || 0})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriedade</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>RNAL</TableHead>
                    <TableHead className="text-center">Reservas</TableHead>
                    <TableHead className="text-right">Receita Total</TableHead>
                    <TableHead>Criada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProperties?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma propriedade encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProperties?.map((property) => {
                      const stats = reservationsStats?.[property.id];
                      return (
                        <TableRow key={property.id} className="hover:bg-primary/10 transition-colors cursor-pointer">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p>{property.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {property.capacity} hóspedes • {property.bedrooms} quartos
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{property.address}</span>
                            </div>
                          </TableCell>
                          <TableCell>{property.rnal || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{stats?.count || 0}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-600">
                              €{(stats?.revenue || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(property.created_at), "dd/MM/yyyy", { locale: pt })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProperties;
