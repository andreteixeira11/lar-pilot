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

const ineData = [
  {
    pais: "Portugal",
    nrHospedes: 25,
    nrNoites: 95,
    dormidas: 95,
    noitesTransitadas: 0,
  },
  {
    pais: "Espanha",
    nrHospedes: 8,
    nrNoites: 32,
    dormidas: 30,
    noitesTransitadas: 2,
  },
  {
    pais: "França",
    nrHospedes: 12,
    nrNoites: 48,
    dormidas: 48,
    noitesTransitadas: 0,
  },
  {
    pais: "Alemanha",
    nrHospedes: 6,
    nrNoites: 28,
    dormidas: 26,
    noitesTransitadas: 2,
  },
];

const INE = () => {
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
    <div className="p-8">
      <PageHeader
        title="INE - Instituto Nacional de Estatística"
        description="Registo de hóspedes por país de origem"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Registo
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por País</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>País</TableHead>
                <TableHead className="text-right">Nº Hóspedes</TableHead>
                <TableHead className="text-right">Nº Noites</TableHead>
                <TableHead className="text-right">Dormidas</TableHead>
                <TableHead className="text-right">Noites Transitadas</TableHead>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default INE;
