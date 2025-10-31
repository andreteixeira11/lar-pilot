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

const taxaData = [
  {
    mes: "Janeiro 2025",
    totalHospedes: 12,
    totalNoites: 45,
    taxaPorNoite: 2,
    totalTaxa: 90,
    pago: true,
  },
  {
    mes: "Fevereiro 2025",
    totalHospedes: 8,
    totalNoites: 32,
    taxaPorNoite: 2,
    totalTaxa: 64,
    pago: true,
  },
  {
    mes: "Março 2025",
    totalHospedes: 15,
    totalNoites: 58,
    taxaPorNoite: 2,
    totalTaxa: 116,
    pago: false,
  },
];

const TaxaTuristica = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Taxa Turística"
        description="Controlo mensal da taxa turística"
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Total Hóspedes</TableHead>
                <TableHead className="text-right">Total Noites</TableHead>
                <TableHead className="text-right">Taxa/Noite</TableHead>
                <TableHead className="text-right">Total Taxa</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxaData.map((row) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxaTuristica;
