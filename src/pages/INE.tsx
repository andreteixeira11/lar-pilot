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
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const INE = () => {
  const { selectedPropertyId } = useProperty();
  const { reservas } = useReserva();
  const [refresh, setRefresh] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [ineData, setIneData] = useState<Array<{ pais: string; nrHospedes: number; nrNoites: number; dormidas: number; noitesTransitadas: number }>>([]);

  // Get available months from reservations
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    reservas
      .filter((r) => r.propertyId === selectedPropertyId && r.status === "confirmada")
      .forEach((r) => {
        const date = parseISO(r.checkIn);
        const monthKey = format(date, "yyyy-MM");
        months.add(monthKey);
      });
    
    // Sort months from newest to oldest
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [reservas, selectedPropertyId]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths[0] || format(new Date(), "yyyy-MM");
  });

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

  // Update selected month when available months change
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // Carregar dados INE dos hóspedes
  useEffect(() => {
    const loadINEData = async () => {
      const [year, month] = selectedMonth.split("-");
      const propertyReservas = reservas.filter((r) => {
        if (r.propertyId !== selectedPropertyId || r.status !== "confirmada") return false;
        
        const checkInDate = new Date(r.checkIn);
        return (
          checkInDate.getFullYear() === parseInt(year) &&
          checkInDate.getMonth() + 1 === parseInt(month)
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

        const data = Object.entries(countryData).map(([pais, data]) => ({
          pais,
          ...data,
        }));
        setIneData(data);
      } else {
        setIneData([]);
      }
    };

    loadINEData();
  }, [reservas, selectedPropertyId, selectedMonth]);

  const totais = ineData.reduce(
    (acc, row) => ({
      hospedes: acc.hospedes + row.nrHospedes,
      noites: acc.noites + row.nrNoites,
      dormidas: acc.dormidas + row.dormidas,
      transitadas: acc.transitadas + row.noitesTransitadas,
    }),
    { hospedes: 0, noites: 0, dormidas: 0, transitadas: 0 }
  );

  const getMonthLabel = (monthKey: string) => {
    const date = new Date(monthKey + "-01");
    return format(date, "MMMM yyyy", { locale: pt });
  };

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
        selectedMonth={selectedMonth}
      />

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium">Selecionar Mês:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.length > 0 ? (
              availableMonths.map((monthKey) => (
                <SelectItem key={monthKey} value={monthKey}>
                  {getMonthLabel(monthKey)}
                </SelectItem>
              ))
            ) : (
              <SelectItem value={format(new Date(), "yyyy-MM")} disabled>
                Sem dados disponíveis
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">
            Estatísticas por País - {getMonthLabel(selectedMonth)}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {ineData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum dado encontrado para este mês
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {ineData.map((row) => (
                      <TableRow key={row.pais}>
                        <TableCell className="font-medium text-sm">{row.pais}</TableCell>
                        <TableCell className="text-right text-sm">{row.nrHospedes}</TableCell>
                        <TableCell className="text-right text-sm">{row.nrNoites}</TableCell>
                        <TableCell className="text-right text-sm">{row.dormidas}</TableCell>
                        <TableCell className="text-right text-sm">{row.noitesTransitadas}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell className="text-sm">Total</TableCell>
                      <TableCell className="text-right text-sm">{totais.hospedes}</TableCell>
                      <TableCell className="text-right text-sm">{totais.noites}</TableCell>
                      <TableCell className="text-right text-sm">{totais.dormidas}</TableCell>
                      <TableCell className="text-right text-sm">{totais.transitadas}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default INE;
