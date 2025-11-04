import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";

const TaxaTuristica = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [refresh, setRefresh] = useState(0);

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

  // Calcular dados da taxa turística automaticamente das reservas
  const taxaData = useMemo(() => {
    const propertyReservas = reservas.filter(
      (r) => r.propertyId === selectedPropertyId && r.status === "confirmada"
    );

    const dataByMonth: { [key: string]: { totalHospedes: number; totalNoites: number; taxaPorNoite: number; totalTaxa: number; pago: boolean } } = {};

    propertyReservas.forEach((reserva) => {
      const date = new Date(reserva.checkIn);
      const mesAno = `${date.toLocaleString("pt-PT", { month: "long" })} ${date.getFullYear()}`;
      const mesKey = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);

      if (!dataByMonth[mesKey]) {
        dataByMonth[mesKey] = {
          totalHospedes: 0,
          totalNoites: 0,
          taxaPorNoite: 2,
          totalTaxa: 0,
          pago: false,
        };
      }

      dataByMonth[mesKey].totalHospedes += reserva.nrHospedes;
      dataByMonth[mesKey].totalNoites += reserva.noites;
    });

    // Calcular total taxa
    Object.keys(dataByMonth).forEach((mes) => {
      dataByMonth[mes].totalTaxa = dataByMonth[mes].totalNoites * dataByMonth[mes].taxaPorNoite;
    });

    return Object.entries(dataByMonth).map(([mes, data]) => ({
      mes,
      ...data,
    }));
  }, [reservas, selectedPropertyId]);

  const filteredData = selectedMonth === "all" 
    ? taxaData 
    : taxaData.filter(row => row.mes === selectedMonth);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Taxa Turística"
        description={`Controlo mensal da taxa turística - ${selectedProperty?.name || 'Todas as propriedades'}`}
        actions={
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Adicionar Formulário</span>
          </Button>
        }
      />

      <div className="mt-6 flex items-center gap-4">
        <label className="text-sm font-medium">Filtrar por Mês:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {taxaData.map((row) => (
              <SelectItem key={row.mes} value={row.mes}>
                {row.mes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumo por Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Mês</TableHead>
                  <TableHead className="text-right min-w-[100px]">Total Hóspedes</TableHead>
                  <TableHead className="text-right min-w-[100px]">Total Noites</TableHead>
                  <TableHead className="text-right min-w-[90px]">Taxa/Noite</TableHead>
                  <TableHead className="text-right min-w-[100px]">Total Taxa</TableHead>
                  <TableHead className="text-right min-w-[90px]">Estado</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum dado encontrado para esta propriedade
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.mes}>
                    <TableCell className="font-medium">{row.mes}</TableCell>
                    <TableCell className="text-right">{row.totalHospedes}</TableCell>
                    <TableCell className="text-right">{row.totalNoites}</TableCell>
                    <TableCell className="text-right">€{row.taxaPorNoite}</TableCell>
                    <TableCell className="text-right font-semibold">
                      €{row.totalTaxa}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.pago ? "default" : "secondary"}>
                        {row.pago ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxaTuristica;
