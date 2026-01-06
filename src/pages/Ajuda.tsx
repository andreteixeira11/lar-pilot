import { useState } from "react";
import { Search, Building2, Calendar, ClipboardCheck, Key, DollarSign, BarChart3, CalendarDays, FileText, BookOpen, Users, CreditCard, Settings, ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const categories = [
  {
    id: "alojamento",
    title: "Dados do Alojamento",
    icon: Building2,
    description: "Configurar propriedade, RNAL, seguro",
    articles: [
      { title: "Como adicionar uma nova propriedade", description: "Aprenda a registar os dados do seu alojamento" },
      { title: "Configurar RNAL e número de registo", description: "Passos para inserir o registo nacional de alojamento local" },
      { title: "Carregar documentos de seguro", description: "Como fazer upload do seguro e definir validade" },
      { title: "Atualizar estado nas plataformas", description: "Gerir o estado de submissão nas OTAs" },
    ]
  },
  {
    id: "reservas",
    title: "Reservas",
    icon: Calendar,
    description: "Gerir reservas e calendário",
    articles: [
      { title: "Criar uma nova reserva", description: "Como adicionar reservas manualmente" },
      { title: "Editar detalhes de uma reserva", description: "Modificar datas, hóspedes e valores" },
      { title: "Enviar link de check-in", description: "Automatizar o envio de formulários de check-in" },
      { title: "Importar reservas de plataformas", description: "Sincronizar com Airbnb e Booking.com" },
    ]
  },
  {
    id: "checkins",
    title: "Check-ins",
    icon: ClipboardCheck,
    description: "Formulários e dados de hóspedes",
    articles: [
      { title: "Personalizar templates de check-in", description: "Configurar campos e idiomas do formulário" },
      { title: "Ver dados dos hóspedes", description: "Aceder à informação submetida pelos hóspedes" },
      { title: "Enviar check-in por email", description: "Automatizar o envio do link de check-in" },
      { title: "Exportar dados para SEF", description: "Gerar relatórios para comunicação obrigatória" },
    ]
  },
  {
    id: "acessos",
    title: "Acessos",
    icon: Key,
    description: "Códigos de acesso e credenciais",
    articles: [
      { title: "Configurar códigos de acesso", description: "Definir códigos de portas e wifi" },
      { title: "Gerir acessos por plataforma", description: "Organizar credenciais por Airbnb, Booking, etc." },
      { title: "Atualizar códigos existentes", description: "Modificar passwords e instruções de acesso" },
    ]
  },
  {
    id: "taxa-turistica",
    title: "Taxa Turística",
    icon: DollarSign,
    description: "Gestão de taxas e pagamentos",
    articles: [
      { title: "Registar taxas turísticas", description: "Como inserir valores de taxa por período" },
      { title: "Marcar taxas como pagas", description: "Atualizar estado de pagamento" },
      { title: "Exportar relatório de taxas", description: "Gerar documento para câmara municipal" },
    ]
  },
  {
    id: "ine",
    title: "INE",
    icon: BarChart3,
    description: "Estatísticas e relatórios INE",
    articles: [
      { title: "Introduzir dados INE", description: "Como preencher estatísticas mensais" },
      { title: "Calcular dormidas automáticas", description: "Usar dados de reservas para cálculo INE" },
      { title: "Submeter relatório ao INE", description: "Passos para envio oficial" },
    ]
  },
  {
    id: "calendario-fiscal",
    title: "Calendário Fiscal",
    icon: CalendarDays,
    description: "Obrigações e prazos fiscais",
    articles: [
      { title: "Ver tarefas fiscais pendentes", description: "Acompanhar obrigações mensais" },
      { title: "Marcar tarefas como concluídas", description: "Atualizar progresso fiscal" },
      { title: "Entender prazos IVA e IRS", description: "Calendário de obrigações fiscais" },
    ]
  },
  {
    id: "resumo-mensal",
    title: "Resumo Mensal",
    icon: FileText,
    description: "Relatórios mensais de atividade",
    articles: [
      { title: "Gerar resumo do mês", description: "Criar relatório consolidado de atividade" },
      { title: "Exportar em PDF", description: "Descarregar relatório para arquivo" },
      { title: "Analisar métricas chave", description: "Interpretar indicadores de performance" },
    ]
  },
  {
    id: "guidebooks",
    title: "Guidebooks",
    icon: BookOpen,
    description: "Guias digitais e upselling",
    articles: [
      { title: "Criar um guidebook", description: "Configurar guia digital para hóspedes" },
      { title: "Adicionar secções ao guidebook", description: "Inserir informações, regras e dicas" },
      { title: "Configurar serviços de upsell", description: "Adicionar serviços adicionais para venda" },
      { title: "Publicar e partilhar guidebook", description: "Gerar link e QR code para hóspedes" },
      { title: "Gerir pedidos de upsell", description: "Aprovar ou recusar pedidos de serviços" },
    ]
  },
  {
    id: "proprietarios",
    title: "Proprietários",
    icon: Users,
    description: "Portal e gestão de proprietários",
    articles: [
      { title: "Adicionar um proprietário", description: "Criar conta de acesso para proprietário" },
      { title: "Associar propriedades", description: "Ligar alojamentos a proprietários" },
      { title: "Definir comissões", description: "Configurar taxas de gestão" },
      { title: "Enviar documentos", description: "Partilhar ficheiros com proprietários" },
    ]
  },
  {
    id: "faturacao",
    title: "Faturação",
    icon: CreditCard,
    description: "Faturas e pagamentos",
    articles: [
      { title: "Criar uma fatura", description: "Emitir documento fiscal para cliente" },
      { title: "Configurar séries de faturação", description: "Definir numeração e prefixos" },
      { title: "Exportar SAF-T", description: "Gerar ficheiro para comunicação AT" },
    ]
  },
  {
    id: "equipa",
    title: "Equipa",
    icon: Settings,
    description: "Utilizadores e permissões",
    articles: [
      { title: "Convidar membros da equipa", description: "Adicionar colaboradores ao sistema" },
      { title: "Definir permissões", description: "Configurar níveis de acesso" },
      { title: "Gerir convites pendentes", description: "Ver e reenviar convites" },
    ]
  },
];

export default function Ajuda() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.articles.some(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query)
      )
    );
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Encontre respostas para as suas dúvidas sobre gestão de alojamentos
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar artigos de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-xl border-border bg-background shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {selectedCategory ? (
          // Category Detail View
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-primary hover:underline mb-6"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar às categorias
            </button>

            {selectedCategoryData && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <selectedCategoryData.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCategoryData.title}</h2>
                    <p className="text-muted-foreground">{selectedCategoryData.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCategoryData.articles.map((article, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                              {article.title}
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </h3>
                            <p className="text-sm text-muted-foreground">{article.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Categories Grid View
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/30"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {category.articles.length} artigos
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">Tente pesquisar com outros termos</p>
              </div>
            )}

            {/* Popular Articles Section */}
            <Separator className="my-12" />
            
            <div>
              <h2 className="text-xl font-semibold mb-6">Artigos Populares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: "Reservas", title: "Como criar uma nova reserva", icon: Calendar },
                  { category: "Check-ins", title: "Enviar link de check-in automático", icon: ClipboardCheck },
                  { category: "Guidebooks", title: "Configurar serviços de upsell", icon: BookOpen },
                  { category: "Faturação", title: "Exportar SAF-T mensalmente", icon: CreditCard },
                ].map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <article.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{article.category}</p>
                        <h4 className="font-medium text-foreground text-sm">{article.title}</h4>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
