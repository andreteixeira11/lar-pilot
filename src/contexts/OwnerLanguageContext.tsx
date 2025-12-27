import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type OwnerLanguage = "pt" | "en";

interface OwnerLanguageContextType {
  language: OwnerLanguage;
  setLanguage: (lang: OwnerLanguage) => void;
  t: (key: string) => string;
}

const OwnerLanguageContext = createContext<OwnerLanguageContextType | undefined>(undefined);

const STORAGE_KEY = "owner_language";

const translations: Record<OwnerLanguage, Record<string, string>> = {
  pt: {
    // Login
    "login.title": "Portal do Proprietário",
    "login.subtitle": "Acompanhe o desempenho da sua propriedade",
    "login.enter": "Entrar",
    "login.credentials": "Use as credenciais fornecidas pelo seu gestor",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgotPassword": "Esqueceu a password?",
    "login.submitting": "A entrar...",
    "login.noAccess": "Não tem acesso?",
    "login.contactManager": "Contacte o seu gestor de propriedade.",
    "login.loading": "A carregar...",
    
    // Sidebar
    "sidebar.title": "Portal do Proprietário",
    "sidebar.dashboard": "Dashboard",
    "sidebar.reservations": "Reservas",
    "sidebar.financial": "Financeiro",
    "sidebar.reports": "Relatórios",
    "sidebar.documents": "Documentos",
    "sidebar.owner": "Proprietário",
    "sidebar.logout": "Terminar Sessão",
    
    // Dashboard
    "dashboard.statusNormal": "Estado Normal",
    "dashboard.statusAttention": "Requer Atenção",
    "dashboard.period": "Período",
    "dashboard.currentMonth": "Mês Atual",
    "dashboard.lastMonth": "Mês Anterior",
    "dashboard.last3Months": "Últimos 3 Meses",
    "dashboard.last6Months": "Últimos 6 Meses",
    "dashboard.thisYear": "Este Ano",
    "dashboard.totalRevenue": "Receita Total",
    "dashboard.grossValue": "Valor bruto das reservas",
    "dashboard.reservations": "Reservas",
    "dashboard.totalReservations": "Total de reservas no período",
    "dashboard.occupancyRate": "Taxa de Ocupação",
    "dashboard.nightsOccupied": "Noites ocupadas no período",
    "dashboard.estimatedProfit": "Lucro Estimado",
    "dashboard.afterCommission": "Após comissão de",
    "dashboard.revenueEvolution": "Evolução da Receita",
    "dashboard.loading": "A carregar...",
    "dashboard.noData": "Sem dados disponíveis",
    "dashboard.revenue": "Receita",
    
    // Reservations
    "reservations.title": "Reservas",
    "reservations.subtitle": "Histórico de reservas da sua propriedade",
    "reservations.search": "Pesquisar...",
    "reservations.guest": "Hóspede",
    "reservations.checkIn": "Check-in",
    "reservations.checkOut": "Check-out",
    "reservations.nights": "Noites",
    "reservations.value": "Valor",
    "reservations.status": "Estado",
    "reservations.noReservations": "Sem reservas no período selecionado",
    "reservations.confirmed": "Confirmada",
    "reservations.completed": "Concluída",
    "reservations.cancelled": "Cancelada",
    "reservations.pending": "Pendente",
    
    // Financial
    "financial.title": "Resumo Financeiro",
    "financial.subtitle": "Detalhes financeiros da sua propriedade",
    "financial.totalRevenue": "Receita Total",
    "financial.managementCommission": "Comissão de Gestão",
    "financial.operationalCosts": "Custos Operacionais",
    "financial.netProfit": "Lucro Líquido",
    "financial.costsBreakdown": "Detalhes dos Custos",
    "financial.cleaning": "Limpeza",
    "financial.maintenance": "Manutenção",
    "financial.other": "Outros",
    "financial.noCosts": "Sem custos registados no período",
    
    // Reports
    "reports.title": "Relatórios",
    "reports.subtitle": "Análises e estatísticas da propriedade",
    "reports.monthlyPerformance": "Desempenho Mensal",
    "reports.month": "Mês",
    "reports.reservations": "Reservas",
    "reports.revenue": "Receita",
    "reports.occupancy": "Ocupação",
    "reports.noData": "Sem dados disponíveis",
    
    // Documents
    "documents.title": "Documentos",
    "documents.subtitle": "Documentos partilhados pelo seu gestor",
    "documents.type": "Tipo",
    "documents.name": "Nome",
    "documents.date": "Data",
    "documents.actions": "Ações",
    "documents.view": "Ver",
    "documents.noDocuments": "Sem documentos disponíveis",
    "documents.contract": "Contrato de Gestão",
    "documents.invoice": "Fatura",
    "documents.report": "Relatório",
    "documents.other": "Outros",
    
    // Common
    "common.loading": "A carregar...",
    "common.error": "Erro",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.close": "Fechar",
    "common.download": "Descarregar",
    "common.language": "Idioma",
  },
  en: {
    // Login
    "login.title": "Owner Portal",
    "login.subtitle": "Track your property performance",
    "login.enter": "Login",
    "login.credentials": "Use the credentials provided by your manager",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgotPassword": "Forgot password?",
    "login.submitting": "Logging in...",
    "login.noAccess": "Don't have access?",
    "login.contactManager": "Contact your property manager.",
    "login.loading": "Loading...",
    
    // Sidebar
    "sidebar.title": "Owner Portal",
    "sidebar.dashboard": "Dashboard",
    "sidebar.reservations": "Reservations",
    "sidebar.financial": "Financial",
    "sidebar.reports": "Reports",
    "sidebar.documents": "Documents",
    "sidebar.owner": "Owner",
    "sidebar.logout": "Logout",
    
    // Dashboard
    "dashboard.statusNormal": "Normal Status",
    "dashboard.statusAttention": "Needs Attention",
    "dashboard.period": "Period",
    "dashboard.currentMonth": "Current Month",
    "dashboard.lastMonth": "Last Month",
    "dashboard.last3Months": "Last 3 Months",
    "dashboard.last6Months": "Last 6 Months",
    "dashboard.thisYear": "This Year",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.grossValue": "Gross booking value",
    "dashboard.reservations": "Reservations",
    "dashboard.totalReservations": "Total reservations in period",
    "dashboard.occupancyRate": "Occupancy Rate",
    "dashboard.nightsOccupied": "Nights occupied in period",
    "dashboard.estimatedProfit": "Estimated Profit",
    "dashboard.afterCommission": "After",
    "dashboard.revenueEvolution": "Revenue Evolution",
    "dashboard.loading": "Loading...",
    "dashboard.noData": "No data available",
    "dashboard.revenue": "Revenue",
    
    // Reservations
    "reservations.title": "Reservations",
    "reservations.subtitle": "Your property's booking history",
    "reservations.search": "Search...",
    "reservations.guest": "Guest",
    "reservations.checkIn": "Check-in",
    "reservations.checkOut": "Check-out",
    "reservations.nights": "Nights",
    "reservations.value": "Value",
    "reservations.status": "Status",
    "reservations.noReservations": "No reservations in selected period",
    "reservations.confirmed": "Confirmed",
    "reservations.completed": "Completed",
    "reservations.cancelled": "Cancelled",
    "reservations.pending": "Pending",
    
    // Financial
    "financial.title": "Financial Summary",
    "financial.subtitle": "Financial details of your property",
    "financial.totalRevenue": "Total Revenue",
    "financial.managementCommission": "Management Commission",
    "financial.operationalCosts": "Operational Costs",
    "financial.netProfit": "Net Profit",
    "financial.costsBreakdown": "Costs Breakdown",
    "financial.cleaning": "Cleaning",
    "financial.maintenance": "Maintenance",
    "financial.other": "Other",
    "financial.noCosts": "No costs recorded in period",
    
    // Reports
    "reports.title": "Reports",
    "reports.subtitle": "Property analytics and statistics",
    "reports.monthlyPerformance": "Monthly Performance",
    "reports.month": "Month",
    "reports.reservations": "Reservations",
    "reports.revenue": "Revenue",
    "reports.occupancy": "Occupancy",
    "reports.noData": "No data available",
    
    // Documents
    "documents.title": "Documents",
    "documents.subtitle": "Documents shared by your manager",
    "documents.type": "Type",
    "documents.name": "Name",
    "documents.date": "Date",
    "documents.actions": "Actions",
    "documents.view": "View",
    "documents.noDocuments": "No documents available",
    "documents.contract": "Management Contract",
    "documents.invoice": "Invoice",
    "documents.report": "Report",
    "documents.other": "Other",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.download": "Download",
    "common.language": "Language",
  },
};

export function OwnerLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<OwnerLanguage>("pt");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: OwnerLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <OwnerLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </OwnerLanguageContext.Provider>
  );
}

export function useOwnerLanguage() {
  const context = useContext(OwnerLanguageContext);
  if (context === undefined) {
    throw new Error("useOwnerLanguage must be used within an OwnerLanguageProvider");
  }
  return context;
}
