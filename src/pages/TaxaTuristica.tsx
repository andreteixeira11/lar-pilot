import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTaxaTuristicaDialog } from "@/components/AddTaxaTuristicaDialog";
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
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const TaxaTuristica = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

    const dataByMonth: { [key: string]: { monthKey: string; totalHospedes: number; totalNoites: number; taxaPorNoite: number; totalTaxa: number; pago: boolean } } = {};

    propertyReservas.forEach((reserva) => {
      const date = parseISO(reserva.checkIn);
      const monthKey = format(date, "yyyy-MM");
      const mesLabel = format(date, "MMMM yyyy", { locale: pt });
      const mesCapitalized = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

      if (!dataByMonth[mesCapitalized]) {
        dataByMonth[mesCapitalized] = {
          monthKey,
          totalHospedes: 0,
          totalNoites: 0,
          taxaPorNoite: 2,
          totalTaxa: 0,
          pago: false,
        };
      }

      dataByMonth[mesCapitalized].totalHospedes += reserva.nrHospedes;
      dataByMonth[mesCapitalized].totalNoites += reserva.noites;
    });

    // Calcular total taxa: hóspedes × noites × taxa por noite
    Object.keys(dataByMonth).forEach((mes) => {
      dataByMonth[mes].totalTaxa = dataByMonth[mes].totalHospedes * dataByMonth[mes].totalNoites * dataByMonth[mes].taxaPorNoite;
    });

    // Sort by monthKey (newest first)
    return Object.entries(dataByMonth)
      .map(([mes, data]) => ({ mes, ...data }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
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
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Adicionar Formulário</span>
          </Button>
        }
      />

      <AddTaxaTuristicaDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        propertyId={selectedPropertyId}
      />

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium">Filtrar por Mês:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-48">
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Resumo por Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Mês</TableHead>
                  <TableHead className="text-right min-w-[80px]">Hóspedes</TableHead>
                  <TableHead className="text-right min-w-[80px]">Noites</TableHead>
                  <TableHead className="text-right min-w-[70px]">Taxa/Noite</TableHead>
                  <TableHead className="text-right min-w-[90px]">Total</TableHead>
                  <TableHead className="text-right min-w-[80px]">Estado</TableHead>
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
                      <TableCell className="font-medium text-sm">{row.mes}</TableCell>
                      <TableCell className="text-right text-sm">{row.totalHospedes}</TableCell>
                      <TableCell className="text-right text-sm">{row.totalNoites}</TableCell>
                      <TableCell className="text-right text-sm">€{row.taxaPorNoite}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        €{row.totalTaxa.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.pago ? "default" : "secondary"} className="text-xs">
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
