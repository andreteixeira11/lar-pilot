import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Calendar, ClipboardCheck, Key, DollarSign, BarChart3, CalendarDays, FileText, BookOpen, Users, CreditCard, Settings, ChevronRight, ExternalLink, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface Article {
  title: string;
  description: string;
  content: string[];
}

interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: Article[];
}

const categories: Category[] = [
  {
    id: "alojamento",
    title: "Dados do Alojamento",
    icon: Building2,
    description: "Configurar propriedade, RNAL, seguro",
    articles: [
      { 
        title: "Como adicionar uma nova propriedade", 
        description: "Aprenda a registar os dados do seu alojamento",
        content: [
          "Aceda ao menu lateral e clique em 'Dashboard Propriedade'",
          "Clique no botão 'Adicionar Propriedade' no canto superior direito",
          "Preencha os campos obrigatórios: Nome, Morada e Região",
          "Adicione informações opcionais como capacidade, quartos e casas de banho",
          "Clique em 'Guardar' para criar a nova propriedade",
          "A propriedade ficará disponível no seletor de propriedades no topo da página"
        ]
      },
      { 
        title: "Configurar RNAL e número de registo", 
        description: "Passos para inserir o registo nacional de alojamento local",
        content: [
          "Selecione a propriedade desejada no seletor do topo",
          "Aceda a 'Dashboard Propriedade' no menu lateral",
          "Localize o campo 'RNAL' na secção de dados",
          "Introduza o número de registo no formato correto (ex: 12345/AL)",
          "Clique em 'Guardar' para confirmar as alterações",
          "O RNAL ficará visível em todos os relatórios e documentos gerados"
        ]
      },
      { 
        title: "Carregar documentos de seguro", 
        description: "Como fazer upload do seguro e definir validade",
        content: [
          "Navegue até 'Dashboard Propriedade' no menu lateral",
          "Localize a secção 'Seguro' nos dados do alojamento",
          "Clique em 'Carregar Documento' e selecione o ficheiro PDF do seguro",
          "Defina a data de validade do seguro no campo apropriado",
          "O sistema irá alertá-lo automaticamente quando o seguro estiver próximo de expirar",
          "Pode atualizar o documento a qualquer momento repetindo o processo"
        ]
      },
      { 
        title: "Atualizar estado nas plataformas", 
        description: "Gerir o estado de submissão nas OTAs",
        content: [
          "Aceda a 'Dashboard Propriedade' no menu",
          "Localize o campo 'Estado de Submissão'",
          "Selecione uma das opções: Não Submetido, Submetido ou Aprovado",
          "Este campo ajuda a acompanhar o processo de aprovação nas plataformas",
          "Atualize regularmente conforme recebe feedback das OTAs"
        ]
      },
    ]
  },
  {
    id: "reservas",
    title: "Reservas",
    icon: Calendar,
    description: "Gerir reservas e calendário",
    articles: [
      { 
        title: "Criar uma nova reserva", 
        description: "Como adicionar reservas manualmente",
        content: [
          "Aceda a 'Reservas' > 'Calendário' no menu lateral",
          "Clique no botão 'Nova Reserva' no canto superior direito",
          "Preencha os dados do hóspede: nome, email e telefone",
          "Selecione as datas de check-in e check-out no calendário",
          "Indique o número de hóspedes e o país de origem",
          "Selecione a fonte da reserva (Airbnb, Booking, Direto, etc.)",
          "Adicione o valor total e notas opcionais",
          "Clique em 'Guardar' para criar a reserva"
        ]
      },
      { 
        title: "Editar detalhes de uma reserva", 
        description: "Modificar datas, hóspedes e valores",
        content: [
          "Navegue até 'Reservas' > 'Calendário'",
          "Localize a reserva que pretende editar na lista ou calendário",
          "Clique na reserva para abrir os detalhes",
          "Clique no botão 'Editar' no canto superior do diálogo",
          "Faça as alterações necessárias nos campos",
          "Clique em 'Guardar' para confirmar as alterações",
          "As mudanças serão refletidas automaticamente nos relatórios"
        ]
      },
      { 
        title: "Enviar link de check-in", 
        description: "Automatizar o envio de formulários de check-in",
        content: [
          "Aceda aos detalhes da reserva clicando nela",
          "Clique no botão 'Enviar Check-in' no diálogo de detalhes",
          "O sistema enviará automaticamente um email ao hóspede",
          "O email contém um link único para o formulário de check-in",
          "Os hóspedes podem preencher os dados de todos os ocupantes",
          "Receberá uma notificação quando o check-in for completado",
          "Os dados ficam disponíveis em 'Reservas' > 'Check-ins'"
        ]
      },
      { 
        title: "Importar reservas de plataformas", 
        description: "Sincronizar com Airbnb e Booking.com",
        content: [
          "Aceda a 'Reservas' > 'Reservas Diretas'",
          "Configure as URLs dos calendários iCal do Airbnb e Booking",
          "Clique em 'Sincronizar' para importar as reservas existentes",
          "As reservas importadas aparecerão automaticamente no calendário",
          "A sincronização ocorre periodicamente de forma automática",
          "Pode forçar uma sincronização manual a qualquer momento"
        ]
      },
    ]
  },
  {
    id: "checkins",
    title: "Check-ins",
    icon: ClipboardCheck,
    description: "Formulários e dados de hóspedes",
    articles: [
      { 
        title: "Personalizar templates de check-in", 
        description: "Configurar campos e idiomas do formulário",
        content: [
          "Aceda a 'Reservas' > 'Check-ins' no menu",
          "Clique no botão 'Configurar Templates' no topo da página",
          "Crie um novo template ou edite um existente",
          "Ative ou desative campos opcionais como hora de chegada",
          "Configure campos de pedidos especiais e preferências",
          "Defina os idiomas disponíveis para o formulário",
          "Guarde as alterações e associe o template às reservas"
        ]
      },
      { 
        title: "Ver dados dos hóspedes", 
        description: "Aceder à informação submetida pelos hóspedes",
        content: [
          "Navegue até 'Reservas' > 'Check-ins'",
          "Localize a reserva desejada na lista de check-ins",
          "Clique em 'Ver Detalhes' para abrir os dados completos",
          "Visualize informações de todos os hóspedes da reserva",
          "Verifique documentos de identificação submetidos",
          "Exporte os dados em formato PDF se necessário"
        ]
      },
      { 
        title: "Enviar check-in por email", 
        description: "Automatizar o envio do link de check-in",
        content: [
          "Ao criar uma nova reserva, marque a opção 'Enviar link de check-in'",
          "O email será enviado automaticamente para o hóspede",
          "Em alternativa, aceda aos detalhes da reserva",
          "Clique em 'Reenviar Link' se o hóspede não recebeu o email",
          "O link é único e seguro para cada reserva",
          "Pode personalizar a mensagem do email nas configurações"
        ]
      },
      { 
        title: "Exportar dados para SEF", 
        description: "Gerar relatórios para comunicação obrigatória",
        content: [
          "Aceda a 'Reservas' > 'Check-ins' no menu",
          "Selecione o período desejado usando os filtros",
          "Clique em 'Exportar para SEF' no menu de ações",
          "O sistema gerará um ficheiro no formato adequado",
          "Verifique os dados antes de submeter ao SIBA",
          "Utilize as credenciais em 'Acessos' para submeter no portal"
        ]
      },
    ]
  },
  {
    id: "acessos",
    title: "Acessos",
    icon: Key,
    description: "Códigos de acesso e credenciais",
    articles: [
      { 
        title: "Configurar códigos de acesso", 
        description: "Definir códigos de portas e wifi",
        content: [
          "Aceda a 'Acessos' no menu lateral",
          "Clique em 'Editar' para ativar o modo de edição",
          "Navegue até à tab 'Outros' para configurar acessos personalizados",
          "Clique em 'Adicionar Outros Acessos' para criar um novo",
          "Insira o nome (ex: Código da Porta, WiFi)",
          "Preencha o utilizador/código e password",
          "Clique em 'Guardar' para confirmar as alterações"
        ]
      },
      { 
        title: "Gerir acessos por plataforma", 
        description: "Organizar credenciais por Airbnb, Booking, etc.",
        content: [
          "Na página 'Acessos', use as tabs para navegar entre categorias",
          "Tab 'Plataformas': credenciais do Airbnb e Booking",
          "Tab 'Fiscal': acessos a Taxa Turística, SIBA, INE e Portal das Finanças",
          "Tab 'Outros': Livro de Reclamações e acessos personalizados",
          "Use os botões de copiar para transferir rapidamente credenciais",
          "O botão do olho permite ver/ocultar passwords"
        ]
      },
      { 
        title: "Atualizar códigos existentes", 
        description: "Modificar passwords e instruções de acesso",
        content: [
          "Navegue até 'Acessos' no menu lateral",
          "Clique em 'Editar' no canto superior direito",
          "Localize a plataforma que pretende atualizar",
          "Altere os campos necessários",
          "Clique em 'Guardar' para confirmar as alterações",
          "As credenciais são encriptadas e armazenadas de forma segura"
        ]
      },
    ]
  },
  {
    id: "taxa-turistica",
    title: "Taxa Turística",
    icon: DollarSign,
    description: "Gestão de taxas e pagamentos",
    articles: [
      { 
        title: "Registar taxas turísticas", 
        description: "Como inserir valores de taxa por período",
        content: [
          "Aceda a 'Relatórios' > 'Taxa Turística' no menu",
          "Selecione o mês e ano desejado nos filtros",
          "Clique em 'Adicionar Registo' para nova entrada",
          "O sistema calcula automaticamente com base nas reservas",
          "Verifique o valor por noite configurado para a sua região",
          "Ajuste manualmente se necessário e guarde as alterações"
        ]
      },
      { 
        title: "Marcar taxas como pagas", 
        description: "Atualizar estado de pagamento",
        content: [
          "Na página 'Taxa Turística', localize o mês desejado",
          "Clique no botão 'Marcar como Pago' na linha correspondente",
          "Confirme a ação no diálogo de confirmação",
          "O estado será atualizado para 'Pago'",
          "Pode reverter a ação se necessário",
          "O histórico de pagamentos fica registado para consulta"
        ]
      },
      { 
        title: "Exportar relatório de taxas", 
        description: "Gerar documento para câmara municipal",
        content: [
          "Aceda a 'Relatórios' > 'Taxa Turística'",
          "Selecione o período desejado usando os filtros",
          "Clique em 'Exportar PDF' no menu de ações",
          "O relatório inclui todas as dormidas e valores calculados",
          "Utilize este documento para submissão à câmara",
          "Pode também exportar em formato Excel se preferir"
        ]
      },
    ]
  },
  {
    id: "ine",
    title: "INE",
    icon: BarChart3,
    description: "Estatísticas e relatórios INE",
    articles: [
      { 
        title: "Introduzir dados INE", 
        description: "Como preencher estatísticas mensais",
        content: [
          "Navegue até 'Relatórios' > 'INE' no menu lateral",
          "Selecione o mês e ano para os dados estatísticos",
          "O sistema apresenta os dados calculados automaticamente",
          "Verifique o número de hóspedes por país de origem",
          "Confirme o total de dormidas por nacionalidade",
          "Clique em 'Submeter' quando os dados estiverem corretos"
        ]
      },
      { 
        title: "Calcular dormidas automáticas", 
        description: "Usar dados de reservas para cálculo INE",
        content: [
          "Os cálculos são feitos automaticamente com base nas reservas",
          "O sistema agrupa hóspedes por país de residência",
          "Calcula o número de noites por cada grupo",
          "Distingue entre dormidas de residentes e não residentes",
          "Pode ajustar manualmente valores se necessário",
          "Exporte o relatório final para submissão ao INE"
        ]
      },
      { 
        title: "Submeter relatório ao INE", 
        description: "Passos para envio oficial",
        content: [
          "Aceda a 'Acessos' e copie as credenciais do INE",
          "Abra o portal do INE numa nova janela",
          "Faça login com as credenciais copiadas",
          "Selecione o período de reporte mensal",
          "Utilize os dados calculados pela plataforma",
          "Confirme a submissão e guarde o comprovativo"
        ]
      },
    ]
  },
  {
    id: "calendario-fiscal",
    title: "Calendário Fiscal",
    icon: CalendarDays,
    description: "Obrigações e prazos fiscais",
    articles: [
      { 
        title: "Ver tarefas fiscais pendentes", 
        description: "Acompanhar obrigações mensais",
        content: [
          "Aceda a 'Finanças' > 'Calendário Fiscal' no menu",
          "Visualize todas as tarefas organizadas por mês",
          "Tarefas pendentes aparecem destacadas",
          "Veja os prazos de cada obrigação fiscal",
          "Filtre por categoria: IVA, IRS, Taxa Turística, etc.",
          "O sistema envia alertas antes dos prazos expirarem"
        ]
      },
      { 
        title: "Marcar tarefas como concluídas", 
        description: "Atualizar progresso fiscal",
        content: [
          "Na lista de tarefas, localize a obrigação cumprida",
          "Clique na checkbox ou botão 'Concluir'",
          "A tarefa será marcada como realizada",
          "O progresso mensal é atualizado automaticamente",
          "Pode adicionar notas sobre a conclusão da tarefa",
          "O histórico fica registado para consulta futura"
        ]
      },
      { 
        title: "Entender prazos IVA e IRS", 
        description: "Calendário de obrigações fiscais",
        content: [
          "IVA trimestral: submissão até dia 20 do mês seguinte",
          "IRS: pagamentos por conta em julho, setembro e dezembro",
          "Taxa Turística: submissão mensal até dia 15",
          "Validação e-fatura: até final do mês seguinte",
          "Modelo 30: submissão mensal para pagamentos a não residentes",
          "Configure alertas personalizados em 'Configurações'"
        ]
      },
    ]
  },
  {
    id: "resumo-mensal",
    title: "Resumo Mensal",
    icon: FileText,
    description: "Relatórios mensais de atividade",
    articles: [
      { 
        title: "Gerar resumo do mês", 
        description: "Criar relatório consolidado de atividade",
        content: [
          "Aceda a 'Finanças' > 'Resumo Mensal' no menu",
          "Selecione o mês e ano desejado",
          "O sistema compila automaticamente todas as métricas",
          "Visualize receitas, despesas e ocupação",
          "Compare com meses anteriores nos gráficos",
          "Exporte o relatório para partilhar com proprietários"
        ]
      },
      { 
        title: "Exportar em PDF", 
        description: "Descarregar relatório para arquivo",
        content: [
          "Na página 'Resumo Mensal', clique em 'Exportar'",
          "Selecione o formato PDF no menu",
          "O relatório inclui gráficos e tabelas",
          "Adicione o logotipo da empresa se configurado",
          "O PDF fica formatado para impressão profissional",
          "Partilhe diretamente por email com um clique"
        ]
      },
      { 
        title: "Analisar métricas chave", 
        description: "Interpretar indicadores de performance",
        content: [
          "Taxa de ocupação: percentagem de noites ocupadas",
          "ADR (Average Daily Rate): receita média por noite",
          "RevPAR: receita por quarto disponível",
          "Compare métricas entre propriedades",
          "Identifique tendências sazonais nos gráficos",
          "Use os insights para otimizar preços e estratégia"
        ]
      },
    ]
  },
  {
    id: "guidebooks",
    title: "Guidebooks",
    icon: BookOpen,
    description: "Guias digitais e upselling",
    articles: [
      { 
        title: "Criar um guidebook", 
        description: "Configurar guia digital para hóspedes",
        content: [
          "Aceda a 'Guidebooks' > 'Os Meus Guidebooks' no menu",
          "Clique em 'Criar Guidebook' para iniciar",
          "Adicione um título e mensagem de boas-vindas",
          "Carregue uma imagem de capa atrativa",
          "Selecione os idiomas disponíveis para os hóspedes",
          "Escolha a cor primária para personalizar o design",
          "Guarde e continue a adicionar secções"
        ]
      },
      { 
        title: "Adicionar secções ao guidebook", 
        description: "Inserir informações, regras e dicas",
        content: [
          "Abra o guidebook em modo de edição",
          "Clique em 'Adicionar Secção' para criar novo conteúdo",
          "Escolha o tipo: texto, lista, contactos, etc.",
          "Adicione título e conteúdo em cada idioma",
          "Arraste as secções para reordenar",
          "Use ícones para identificar visualmente cada secção",
          "Pré-visualize como os hóspedes vão ver"
        ]
      },
      { 
        title: "Configurar serviços de upsell", 
        description: "Adicionar serviços adicionais para venda",
        content: [
          "No editor do guidebook, aceda à tab 'Upsells'",
          "Clique em 'Adicionar Serviço' para criar uma oferta",
          "Defina nome, descrição e preço do serviço",
          "Adicione uma imagem ilustrativa",
          "Selecione a categoria (alimentação, experiências, etc.)",
          "Ative ou desative a disponibilidade do serviço",
          "Os hóspedes podem pedir diretamente pelo guidebook"
        ]
      },
      { 
        title: "Publicar e partilhar guidebook", 
        description: "Gerar link e QR code para hóspedes",
        content: [
          "No guidebook, clique em 'Publicar' quando estiver pronto",
          "O sistema gera um link único para partilha",
          "Copie o link para enviar por email ou mensagem",
          "Gere um QR code para impressão física",
          "Coloque o QR code no alojamento para fácil acesso",
          "O guidebook está sempre atualizado em tempo real"
        ]
      },
      { 
        title: "Gerir pedidos de upsell", 
        description: "Aprovar ou recusar pedidos de serviços",
        content: [
          "Aceda a 'Guidebooks' > 'Pedidos Upsell' no menu",
          "Veja todos os pedidos pendentes de aprovação",
          "Clique num pedido para ver os detalhes completos",
          "Aprove ou recuse o pedido conforme disponibilidade",
          "O hóspede recebe notificação automática da decisão",
          "Atualize o estado de pagamento quando receber"
        ]
      },
    ]
  },
  {
    id: "proprietarios",
    title: "Proprietários",
    icon: Users,
    description: "Portal e gestão de proprietários",
    articles: [
      { 
        title: "Adicionar um proprietário", 
        description: "Criar conta de acesso para proprietário",
        content: [
          "Aceda a 'Relatórios' > 'Proprietários' no menu",
          "Clique em 'Adicionar Proprietário'",
          "Preencha os dados: nome, email e telefone",
          "O sistema envia automaticamente credenciais de acesso",
          "O proprietário pode aceder ao portal em /proprietario",
          "Configure as permissões de visualização de dados"
        ]
      },
      { 
        title: "Associar propriedades", 
        description: "Ligar alojamentos a proprietários",
        content: [
          "Na ficha do proprietário, clique em 'Gerir Propriedades'",
          "Selecione as propriedades a associar da lista",
          "Confirme a associação clicando em 'Guardar'",
          "O proprietário verá apenas as suas propriedades no portal",
          "Pode associar múltiplas propriedades ao mesmo proprietário",
          "Remova associações quando já não forem necessárias"
        ]
      },
      { 
        title: "Definir comissões", 
        description: "Configurar taxas de gestão",
        content: [
          "Abra a ficha do proprietário para edição",
          "Localize o campo 'Taxa de Comissão'",
          "Insira a percentagem acordada (ex: 15%)",
          "A comissão é calculada automaticamente nas receitas",
          "Veja o breakdown no resumo mensal do proprietário",
          "Pode definir comissões diferentes por propriedade"
        ]
      },
      { 
        title: "Enviar documentos", 
        description: "Partilhar ficheiros com proprietários",
        content: [
          "Na secção de documentos do proprietário, clique em 'Carregar'",
          "Selecione o tipo de documento (relatório, fatura, contrato)",
          "Escolha o ficheiro do seu computador",
          "Adicione uma descrição opcional",
          "O documento fica disponível no portal do proprietário",
          "Envie uma notificação para alertar o proprietário"
        ]
      },
    ]
  },
  {
    id: "faturacao",
    title: "Faturação",
    icon: CreditCard,
    description: "Faturas e pagamentos",
    articles: [
      { 
        title: "Criar uma fatura", 
        description: "Emitir documento fiscal para cliente",
        content: [
          "Aceda a 'Finanças' > 'Faturação' no menu",
          "Clique em 'Nova Fatura' no canto superior",
          "Selecione a reserva associada (opcional)",
          "Preencha os dados do cliente: nome, NIF e morada",
          "Adicione os itens da fatura com descrição e valor",
          "O sistema calcula automaticamente impostos e total",
          "Clique em 'Emitir' para gerar a fatura"
        ]
      },
      { 
        title: "Configurar séries de faturação", 
        description: "Definir numeração e prefixos",
        content: [
          "Na página de Faturação, aceda a 'Configurações'",
          "Crie uma nova série com código único (ex: FT2025)",
          "Defina o prefixo e número inicial",
          "Selecione a série como ativa para novas faturas",
          "Pode ter múltiplas séries para diferentes fins",
          "A numeração é sequencial e automática"
        ]
      },
      { 
        title: "Exportar SAF-T", 
        description: "Gerar ficheiro para comunicação AT",
        content: [
          "Aceda a 'Finanças' > 'Faturação'",
          "Clique em 'Exportar SAF-T' no menu de ações",
          "Selecione o período fiscal desejado",
          "O sistema gera o ficheiro XML no formato oficial",
          "Valide o ficheiro antes de submeter",
          "Submeta no Portal das Finanças usando as credenciais em 'Acessos'"
        ]
      },
    ]
  },
  {
    id: "equipa",
    title: "Equipa",
    icon: Settings,
    description: "Utilizadores e permissões",
    articles: [
      { 
        title: "Convidar membros da equipa", 
        description: "Adicionar colaboradores ao sistema",
        content: [
          "Aceda a 'Perfil' e depois 'Equipa' no menu",
          "Clique em 'Convidar Membro' para enviar convite",
          "Insira o email do colaborador",
          "Selecione as propriedades a que terá acesso",
          "Escolha o nível de permissão apropriado",
          "O colaborador recebe email com link de ativação",
          "Após aceitar, pode aceder imediatamente à plataforma"
        ]
      },
      { 
        title: "Definir permissões", 
        description: "Configurar níveis de acesso",
        content: [
          "Admin: acesso total a todas as funcionalidades",
          "Editor: pode criar e editar reservas e dados",
          "Viewer: apenas visualização, sem poder editar",
          "Configure permissões por propriedade se necessário",
          "Altere permissões a qualquer momento na gestão de equipa",
          "Revogue acessos de utilizadores que já não colaboram"
        ]
      },
      { 
        title: "Gerir convites pendentes", 
        description: "Ver e reenviar convites",
        content: [
          "Na página 'Equipa', veja a lista de convites pendentes",
          "Convites expiram após 7 dias automaticamente",
          "Clique em 'Reenviar' para enviar novo email",
          "Pode cancelar convites que já não são necessários",
          "Verifique se o email foi inserido corretamente",
          "O colaborador deve verificar pasta de spam se não receber"
        ]
      },
    ]
  },
];

export default function Ajuda() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumenta Atlantic" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <Button variant="outline" onClick={() => navigate("/auth?mode=login")}>
            Entrar
          </Button>
        </div>
      </header>

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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {selectedArticle ? (
          // Article Detail View
          <div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-primary hover:underline mb-6"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar aos artigos
            </button>

            <Card className="max-w-3xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-2">{selectedArticle.title}</h2>
                <p className="text-muted-foreground mb-8">{selectedArticle.description}</p>

                <div className="space-y-4">
                  {selectedArticle.content.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <p className="text-foreground pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-8" />

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Este artigo foi útil?</span>
                  <Button variant="outline" size="sm">Sim</Button>
                  <Button variant="outline" size="sm">Não</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedCategory ? (
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
                    <Card 
                      key={index} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
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
                  { category: "Reservas", title: "Como criar uma nova reserva", icon: Calendar, article: categories.find(c => c.id === "reservas")?.articles[0] },
                  { category: "Check-ins", title: "Enviar link de check-in automático", icon: ClipboardCheck, article: categories.find(c => c.id === "checkins")?.articles[2] },
                  { category: "Guidebooks", title: "Configurar serviços de upsell", icon: BookOpen, article: categories.find(c => c.id === "guidebooks")?.articles[2] },
                  { category: "Faturação", title: "Exportar SAF-T mensalmente", icon: CreditCard, article: categories.find(c => c.id === "faturacao")?.articles[2] },
                ].map((item, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => item.article && setSelectedArticle(item.article)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{item.category}</p>
                        <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
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

      {/* Footer */}
      <footer className="border-t bg-background py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Não encontrou o que procurava?
          </p>
          <Button onClick={() => navigate("/contactos")}>
            Contacte-nos
          </Button>
        </div>
      </footer>
    </div>
  );
}
