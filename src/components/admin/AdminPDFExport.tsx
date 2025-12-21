import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ExportData {
  usersCount: number;
  propertiesCount: number;
  reservationsCount: number;
  totalRevenue: number;
  planDistribution?: Array<{ name: string; value: number }>;
  planSales?: Array<{ name: string; vendas: number; receita: number }>;
  topProperties?: Array<{ name: string; revenue: number; reservations: number }>;
  monthlyUsers?: Array<{ name: string; utilizadores: number }>;
  monthlyRevenue?: Array<{ name: string; receita: number }>;
}

interface AdminPDFExportProps {
  data: ExportData;
}

export const AdminPDFExport = ({ data }: AdminPDFExportProps) => {
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 122, 110);
    doc.text("Monumenta Atlantic", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Relatório Administrativo", pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}`,
      pageWidth / 2,
      38,
      { align: "center" }
    );

    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo Geral", 14, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total de Utilizadores", data.usersCount.toString()],
        ["Total de Propriedades", data.propertiesCount.toString()],
        ["Total de Reservas", data.reservationsCount.toString()],
        ["Receita Total", `€${data.totalRevenue.toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [26, 122, 110] },
      styles: { fontSize: 10 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Plan Distribution
    if (data.planDistribution && data.planDistribution.length > 0) {
      doc.setFontSize(14);
      doc.text("Distribuição de Planos", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Plano", "Utilizadores"]],
        body: data.planDistribution.map(p => [p.name, p.value.toString()]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
        styles: { fontSize: 10 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Plan Sales
    if (data.planSales && data.planSales.length > 0) {
      doc.setFontSize(14);
      doc.text("Vendas por Plano", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Plano", "Vendas", "Receita"]],
        body: data.planSales.map(p => [p.name, p.vendas.toString(), `€${p.receita.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
        styles: { fontSize: 10 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Top Properties
    if (data.topProperties && data.topProperties.length > 0) {
      doc.setFontSize(14);
      doc.text("Top 10 Propriedades por Receita", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Propriedade", "Reservas", "Receita"]],
        body: data.topProperties.slice(0, 10).map(p => [
          p.name,
          p.reservations.toString(),
          `€${p.revenue.toFixed(2)}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
        styles: { fontSize: 10 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Monthly Users
    if (data.monthlyUsers && data.monthlyUsers.length > 0) {
      doc.setFontSize(14);
      doc.text("Novos Utilizadores por Mês", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Mês", "Novos Utilizadores"]],
        body: data.monthlyUsers.map(m => [m.name, m.utilizadores.toString()]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
        styles: { fontSize: 10 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Monthly Revenue
    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
      doc.setFontSize(14);
      doc.text("Receita Mensal", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Mês", "Receita"]],
        body: data.monthlyRevenue.map(m => [m.name, `€${m.receita.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [26, 122, 110] },
        styles: { fontSize: 10 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`relatorio-admin-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <Button onClick={exportPDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Exportar PDF
    </Button>
  );
};
