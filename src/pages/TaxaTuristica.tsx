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
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Taxa Turística"
        description="Controlo mensal da taxa turística"
      />

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxaTuristica;
