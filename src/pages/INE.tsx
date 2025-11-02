import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ineDataByMonth = {
  "2025-01": [
    { pais: "Portugal", nrHospedes: 25, nrNoites: 95, dormidas: 95, noitesTransitadas: 0 },
    { pais: "Espanha", nrHospedes: 8, nrNoites: 32, dormidas: 30, noitesTransitadas: 2 },
  ],
  "2025-02": [
    { pais: "Portugal", nrHospedes: 18, nrNoites: 72, dormidas: 72, noitesTransitadas: 0 },
    { pais: "França", nrHospedes: 12, nrNoites: 48, dormidas: 48, noitesTransitadas: 0 },
  ],
  "2025-03": [
    { pais: "Portugal", nrHospedes: 30, nrNoites: 120, dormidas: 118, noitesTransitadas: 2 },
    { pais: "Alemanha", nrHospedes: 6, nrNoites: 28, dormidas: 26, noitesTransitadas: 2 },
  ],
};

const INE = () => {
  const [selectedMonth, setSelectedMonth] = useState("2025-03");
  const ineData = ineDataByMonth[selectedMonth as keyof typeof ineDataByMonth] || [];

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
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Adicionar Registo</span>
          </Button>
        }
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
