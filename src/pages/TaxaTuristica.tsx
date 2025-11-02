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

const taxaDataByProperty = {
  "1": [
    { mes: "Janeiro 2025", totalHospedes: 12, totalNoites: 45, taxaPorNoite: 2, totalTaxa: 90, pago: true },
    { mes: "Fevereiro 2025", totalHospedes: 8, totalNoites: 32, taxaPorNoite: 2, totalTaxa: 64, pago: true },
    { mes: "Março 2025", totalHospedes: 15, totalNoites: 58, taxaPorNoite: 2, totalTaxa: 116, pago: false },
  ],
  "2": [
    { mes: "Janeiro 2025", totalHospedes: 10, totalNoites: 38, taxaPorNoite: 2, totalTaxa: 76, pago: true },
    { mes: "Fevereiro 2025", totalHospedes: 14, totalNoites: 52, taxaPorNoite: 2, totalTaxa: 104, pago: false },
  ],
};

const TaxaTuristica = () => {
  const { selectedPropertyId, selectedProperty } = useProperty();
  const [selectedMonth, setSelectedMonth] = useState("all");
  
  const taxaData = taxaDataByProperty[selectedPropertyId as keyof typeof taxaDataByProperty] || [];
  
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
            <SelectItem value="Janeiro 2025">Janeiro 2025</SelectItem>
            <SelectItem value="Fevereiro 2025">Fevereiro 2025</SelectItem>
            <SelectItem value="Março 2025">Março 2025</SelectItem>
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
