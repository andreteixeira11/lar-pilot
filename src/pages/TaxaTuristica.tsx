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

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const TaxaTuristica = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const { reservas } = useReserva();
  const [refresh, setRefresh] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

  // Get available months and years from reservations
  const { availableYears, availableMonthsByYear, taxaDataByMonthYear } = useMemo(() => {
    const yearsSet = new Set<string>();
    const monthsByYear: { [year: string]: Set<string> } = {};
    const dataByMonthYear: { [key: string]: { totalHospedes: number; totalNoites: number; taxaPorNoite: number; totalTaxa: number; pago: boolean } } = {};
    
    const propertyReservas = reservas.filter(
      (r) => r.propertyId === selectedPropertyId && r.status === "confirmada"
    );

    propertyReservas.forEach((reserva) => {
      const date = parseISO(reserva.checkIn);
      const year = format(date, "yyyy");
      const month = format(date, "MM");
      const key = `${year}-${month}`;
      
      yearsSet.add(year);
      if (!monthsByYear[year]) monthsByYear[year] = new Set();
      monthsByYear[year].add(month);

      if (!dataByMonthYear[key]) {
        dataByMonthYear[key] = {
          totalHospedes: 0,
          totalNoites: 0,
          taxaPorNoite: 2,
          totalTaxa: 0,
          pago: false,
        };
      }

      dataByMonthYear[key].totalHospedes += reserva.nrHospedes;
      dataByMonthYear[key].totalNoites += reserva.noites;
    });

    // Calcular total taxa: hóspedes × noites × taxa por noite
    Object.keys(dataByMonthYear).forEach((key) => {
      dataByMonthYear[key].totalTaxa = dataByMonthYear[key].totalHospedes * dataByMonthYear[key].totalNoites * dataByMonthYear[key].taxaPorNoite;
    });
    
    const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    const monthsMap: { [year: string]: string[] } = {};
    Object.entries(monthsByYear).forEach(([year, months]) => {
      monthsMap[year] = Array.from(months).sort((a, b) => b.localeCompare(a));
    });
    
    return { availableYears: years, availableMonthsByYear: monthsMap, taxaDataByMonthYear: dataByMonthYear };
  }, [reservas, selectedPropertyId]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || format(new Date(), "yyyy");
  });

  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Update month when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth("all");
  };

  // Get filtered data
  const filteredData = useMemo(() => {
    const currentMonths = availableMonthsByYear[selectedYear] || [];
    const monthsToShow = selectedMonth === "all" ? currentMonths : [selectedMonth];
    
    return monthsToShow.map((month) => {
      const key = `${selectedYear}-${month}`;
      const data = taxaDataByMonthYear[key];
      const monthLabel = MONTHS.find(m => m.value === month)?.label || "";
      
      return {
        mes: `${monthLabel} ${selectedYear}`,
        monthKey: key,
        ...(data || { totalHospedes: 0, totalNoites: 0, taxaPorNoite: 2, totalTaxa: 0, pago: false }),
      };
    }).filter(item => item.totalHospedes > 0 || item.totalNoites > 0);
  }, [selectedYear, selectedMonth, availableMonthsByYear, taxaDataByMonthYear]);

  const currentMonths = availableMonthsByYear[selectedYear] || [];

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
        <label className="text-sm font-medium">Filtrar:</label>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {currentMonths.length > 0 ? (
                currentMonths.map((monthValue) => {
                  const month = MONTHS.find(m => m.value === monthValue);
                  return month ? (
                    <SelectItem key={monthValue} value={monthValue}>
                      {month.label}
                    </SelectItem>
                  ) : null;
                })
              ) : (
                MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={format(new Date(), "yyyy")}>
                  {format(new Date(), "yyyy")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
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
                    <TableRow key={row.monthKey}>
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