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

const INE = () => {
  const { selectedPropertyId } = useProperty();
  const { reservas } = useReserva();
  const [selectedMonth, setSelectedMonth] = useState("2025-03");
  const [refresh, setRefresh] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [ineData, setIneData] = useState<Array<{ pais: string; nrHospedes: number; nrNoites: number; dormidas: number; noitesTransitadas: number }>>([]);

  // Listen for property changes
  useEffect(() => {
    const handlePropertyChange = () => setRefresh(prev => prev + 1);
    window.addEventListener('propertyChanged', handlePropertyChange);
    return () => window.removeEventListener('propertyChanged', handlePropertyChange);
  }, []);

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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="INE - Instituto Nacional de Estatística"
        description="Registo de hóspedes por país de origem"
        actions={
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Adicionar Registo</span>
          </Button>
        }
      />

      <AddINEDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        propertyId={selectedPropertyId}
        selectedMonth={selectedMonth}
      />

      <div className="mt-6 flex items-center gap-4">
        <label className="text-sm font-medium">Selecionar Mês:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-01">Janeiro 2025</SelectItem>
            <SelectItem value="2025-02">Fevereiro 2025</SelectItem>
            <SelectItem value="2025-03">Março 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estatísticas por País - {new Date(selectedMonth + "-01").toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">País</TableHead>
                  <TableHead className="text-right min-w-[100px]">Nº Hóspedes</TableHead>
                  <TableHead className="text-right min-w-[100px]">Nº Noites</TableHead>
                  <TableHead className="text-right min-w-[100px]">Dormidas</TableHead>
                  <TableHead className="text-right min-w-[120px]">Noites Transitadas</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {ineData.map((row) => (
                <TableRow key={row.pais}>
                  <TableCell className="font-medium">{row.pais}</TableCell>
                  <TableCell className="text-right">{row.nrHospedes}</TableCell>
                  <TableCell className="text-right">{row.nrNoites}</TableCell>
                  <TableCell className="text-right">{row.dormidas}</TableCell>
                  <TableCell className="text-right">
                    {row.noitesTransitadas}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totais.hospedes}</TableCell>
                <TableCell className="text-right">{totais.noites}</TableCell>
                <TableCell className="text-right">{totais.dormidas}</TableCell>
                <TableCell className="text-right">{totais.transitadas}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default INE;
