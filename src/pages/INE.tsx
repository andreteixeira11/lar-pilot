import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddINEDialog } from "@/components/AddINEDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProperty } from "@/contexts/PropertyContext";
import { useReserva } from "@/contexts/ReservaContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

interface INERow {
  id?: string;
  pais: string;
  nrHospedes: number;
  nrNoites: number;
  dormidas: number;
  noitesTransitadas: number;
  isFromReservation?: boolean;
}

const INE = () => {
  const { selectedPropertyId } = useProperty();
  const { reservas } = useReserva();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [ineData, setIneData] = useState<INERow[]>([]);
  const [deletingRow, setDeletingRow] = useState<INERow | null>(null);

  // Get available months and years from reservations
  const { availableYears, availableMonthsByYear } = useMemo(() => {
    const yearsSet = new Set<string>();
    const monthsByYear: { [year: string]: Set<string> } = {};
    
    reservas
      .filter((r) => r.propertyId === selectedPropertyId && r.status === "confirmada")
      .forEach((r) => {
        const date = parseISO(r.checkIn);
        const year = format(date, "yyyy");
        const month = format(date, "MM");
        
        yearsSet.add(year);
        if (!monthsByYear[year]) monthsByYear[year] = new Set();
        monthsByYear[year].add(month);
      });
    
    const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    const monthsMap: { [year: string]: string[] } = {};
    Object.entries(monthsByYear).forEach(([year, months]) => {
      monthsMap[year] = Array.from(months).sort((a, b) => b.localeCompare(a));
    });
    
    return { availableYears: years, availableMonthsByYear: monthsMap };
  }, [reservas, selectedPropertyId]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return availableYears[0] || format(new Date(), "yyyy");
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const months = availableMonthsByYear[selectedYear] || [];
    return months[0] || format(new Date(), "MM");
  });

  // Update month when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const months = availableMonthsByYear[year] || [];
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  };

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

  // Update selected month when available months change
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Carregar dados INE dos hóspedes
  useEffect(() => {
    const loadINEData = async () => {
      const propertyReservas = reservas.filter((r) => {
        if (r.propertyId !== selectedPropertyId || r.status !== "confirmada") return false;
        
        const checkInDate = new Date(r.checkIn);
        return (
          checkInDate.getFullYear() === parseInt(selectedYear) &&
          checkInDate.getMonth() + 1 === parseInt(selectedMonth)
        );
      });

      const reservationIds = propertyReservas.map(r => r.id);
      if (reservationIds.length === 0) {
        setIneData([]);
        return;
      }

      const { data: guests } = await supabase
        .from('reservation_guests')
        .select('*, reservations!inner(check_in, num_nights)')
        .in('reservation_id', reservationIds);

      if (guests) {
        const countryData: { [key: string]: { nrHospedes: number; nrNoites: number; dormidas: number; noitesTransitadas: number } } = {};
        
        guests.forEach((guest: any) => {
          const pais = guest.pais_residencia;
          const noites = guest.reservations.num_nights;
          
          if (!countryData[pais]) {
            countryData[pais] = {
              nrHospedes: 0,
              nrNoites: 0,
              dormidas: 0,
              noitesTransitadas: 0,
            };
          }

          countryData[pais].nrHospedes += 1;
          countryData[pais].nrNoites += noites;
          countryData[pais].dormidas += noites; // 1 hóspede × noites
        });

        const data: INERow[] = Object.entries(countryData).map(([pais, data]) => ({
          pais,
          ...data,
          isFromReservation: true,
        }));
        setIneData(data);
      } else {
        setIneData([]);
      }
    };

    loadINEData();
  }, [reservas, selectedPropertyId, selectedMonth, selectedYear, refresh]);

  const handleDeleteRow = async (row: INERow) => {
    if (row.isFromReservation) {
      // For reservation-based data, we would need to delete the guest from reservation
      // For now, just show a message
      toast({
        title: "Dados de reserva",
        description: "Este registo foi gerado automaticamente a partir das reservas. Para remover, edite a reserva correspondente.",
        variant: "destructive",
      });
    } else if (row.id) {
      // Delete from ine_statistics table
      const { error } = await supabase
        .from('ine_statistics')
        .delete()
        .eq('id', row.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o registo",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Registo removido com sucesso",
        });
        setRefresh(prev => prev + 1);
      }
    }
    setDeletingRow(null);
  };

  const totais = ineData.reduce(
    (acc, row) => ({
      hospedes: acc.hospedes + row.nrHospedes,
      noites: acc.noites + row.nrNoites,
      dormidas: acc.dormidas + row.dormidas,
      transitadas: acc.transitadas + row.noitesTransitadas,
    }),
    { hospedes: 0, noites: 0, dormidas: 0, transitadas: 0 }
  );

  const getMonthLabel = () => {
    const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || "";
    return `${monthName} ${selectedYear}`;
  };

  const currentMonths = availableMonthsByYear[selectedYear] || [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="INE - Instituto Nacional de Estatística"
        description="Registo de hóspedes por país de origem"
        actions={
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Adicionar Registo</span>
          </Button>
        }
      />

      <AddINEDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        propertyId={selectedPropertyId}
        selectedMonth={`${selectedYear}-${selectedMonth}`}
      />

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium">Filtrar:</label>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
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
          <CardTitle className="text-base md:text-lg">
            Estatísticas por País - {getMonthLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">País</TableHead>
                  <TableHead className="text-right min-w-[80px]">Hóspedes</TableHead>
                  <TableHead className="text-right min-w-[80px]">Noites</TableHead>
                  <TableHead className="text-right min-w-[80px]">Dormidas</TableHead>
                  <TableHead className="text-right min-w-[100px]">Transitadas</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ineData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum dado encontrado para este mês
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {ineData.map((row, index) => (
                      <TableRow key={row.id || `${row.pais}-${index}`}>
                        <TableCell className="font-medium text-sm">{row.pais}</TableCell>
                        <TableCell className="text-right text-sm">{row.nrHospedes}</TableCell>
                        <TableCell className="text-right text-sm">{row.nrNoites}</TableCell>
                        <TableCell className="text-right text-sm">{row.dormidas}</TableCell>
                        <TableCell className="text-right text-sm">{row.noitesTransitadas}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingRow(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell className="text-sm">Total</TableCell>
                      <TableCell className="text-right text-sm">{totais.hospedes}</TableCell>
                      <TableCell className="text-right text-sm">{totais.noites}</TableCell>
                      <TableCell className="text-right text-sm">{totais.dormidas}</TableCell>
                      <TableCell className="text-right text-sm">{totais.transitadas}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingRow} onOpenChange={() => setDeletingRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Registo</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingRow?.isFromReservation 
                ? "Este registo foi gerado automaticamente a partir das reservas. Para remover, edite a reserva correspondente."
                : "Tem a certeza que pretende remover este registo? Esta ação não pode ser revertida."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {!deletingRow?.isFromReservation && (
              <AlertDialogAction
                onClick={() => deletingRow && handleDeleteRow(deletingRow)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default INE;
