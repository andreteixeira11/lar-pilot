import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatedSidebar } from "@/components/ui/animated-sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ReservaProvider } from "@/contexts/ReservaContext";
import { OwnerAuthProvider } from "@/contexts/OwnerAuthContext";
import { OwnerLanguageProvider } from "@/contexts/OwnerLanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { OwnerProtectedRoute } from "@/components/OwnerProtectedRoute";
import { OwnerSidebar } from "@/components/OwnerSidebar";
import { PropertySelectorCommand } from "@/components/PropertySelectorCommand";
import { NotificationMenu } from "@/components/NotificationMenu";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Simulador = lazy(() => import("./pages/Simulador"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const GuestPortal = lazy(() => import("./pages/GuestPortal"));
const CheckIns = lazy(() => import("./pages/CheckIns"));
const PedidosHospedes = lazy(() => import("./pages/PedidosHospedes"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OverviewDashboard = lazy(() => import("./pages/OverviewDashboard"));
const Reservas = lazy(() => import("./pages/Reservas"));
const ResumoMensal = lazy(() => import("./pages/ResumoMensal"));
const TaxaTuristica = lazy(() => import("./pages/TaxaTuristica"));
const INE = lazy(() => import("./pages/INE"));
const DadosAlojamento = lazy(() => import("./pages/DadosAlojamento"));
const Acessos = lazy(() => import("./pages/Acessos"));
const CalendarioFiscal = lazy(() => import("./pages/CalendarioFiscal"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Equipa = lazy(() => import("./pages/Equipa"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const PublicBookingPage = lazy(() => import("./pages/PublicBookingPage"));
const ReservasDiretas = lazy(() => import("./pages/ReservasDiretas"));
const Faturacao = lazy(() => import("./pages/Faturacao"));
const Guidebooks = lazy(() => import("./pages/Guidebooks"));
const UpsellOrders = lazy(() => import("./pages/UpsellOrders"));
const PublicGuidebook = lazy(() => import("./pages/PublicGuidebook"));
const Ajuda = lazy(() => import("./pages/Ajuda"));
const Contactos = lazy(() => import("./pages/Contactos"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosCondicoes = lazy(() => import("./pages/TermosCondicoes"));
const AdminAuth = lazy(() => import("./pages/admin/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const OwnerLogin = lazy(() => import("./pages/proprietario/OwnerLogin"));
const OwnerResetPassword = lazy(() => import("./pages/proprietario/OwnerResetPassword"));
const OwnerDashboard = lazy(() => import("./pages/proprietario/OwnerDashboard"));
const OwnerReservas = lazy(() => import("./pages/proprietario/OwnerReservas"));
const OwnerFinanceiro = lazy(() => import("./pages/proprietario/OwnerFinanceiro"));
const OwnerRelatorios = lazy(() => import("./pages/proprietario/OwnerRelatorios"));
const OwnerDocumentos = lazy(() => import("./pages/proprietario/OwnerDocumentos"));
const OwnerReviews = lazy(() => import("./pages/proprietario/OwnerReviews"));
const Proprietarios = lazy(() => import("./pages/Proprietarios"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Analiticas = lazy(() => import("./pages/Analiticas"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PropertyProvider>
        <ReservaProvider>
          <OwnerAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/simulador" element={<Simulador />} />
                    <Route path="/checkin/:token" element={<CheckIn />} />
                    <Route path="/guest/:token" element={<GuestPortal />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/p/:slug" element={<PublicBookingPage />} />
                    <Route path="/guidebook/:id" element={<PublicGuidebook />} />
                    <Route path="/contactos" element={<Contactos />} />
                    <Route path="/privacidade" element={<PoliticaPrivacidade />} />
                    <Route path="/termos" element={<TermosCondicoes />} />
                    <Route path="/ajuda" element={<Ajuda />} />
                    
                    {/* Owner Portal Login */}
                    <Route path="/proprietario/login" element={<OwnerLanguageProvider><OwnerLogin /></OwnerLanguageProvider>} />
                    <Route path="/proprietario/reset-password" element={<OwnerLanguageProvider><OwnerResetPassword /></OwnerLanguageProvider>} />
                    
                    {/* Owner Portal Protected Routes */}
                    <Route
                      path="/proprietario/*"
                      element={
                        <OwnerLanguageProvider>
                          <OwnerProtectedRoute>
                            <div className="flex min-h-screen w-full">
                              <OwnerSidebar />
                              <main className="flex-1 md:ml-72 bg-background">
                                <Routes>
                                  <Route path="/" element={<OwnerDashboard />} />
                                  <Route path="/reservas" element={<OwnerReservas />} />
                                  <Route path="/financeiro" element={<OwnerFinanceiro />} />
                                  <Route path="/relatorios" element={<OwnerRelatorios />} />
                                  <Route path="/reviews" element={<OwnerReviews />} />
                                  <Route path="/documentos" element={<OwnerDocumentos />} />
                                </Routes>
                              </main>
                            </div>
                          </OwnerProtectedRoute>
                        </OwnerLanguageProvider>
                      }
                    />
                    
                    {/* Admin Login Page */}
                    <Route path="/admin" element={<AdminAuth />} />
                    
                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <div className="flex min-h-screen w-full">
                            <AdminSidebar />
                            <main className="flex-1 md:ml-72 bg-background">
                              <Routes>
                                <Route path="/dashboard" element={<AdminDashboard />} />
                                <Route path="/leads" element={<AdminLeads />} />
                                <Route path="/analytics" element={<AdminAnalytics />} />
                                <Route path="/plans" element={<AdminPlans />} />
                                <Route path="/sales" element={<AdminSales />} />
                                <Route path="/users" element={<AdminUsers />} />
                                <Route path="/properties" element={<AdminProperties />} />
                                <Route path="/reports" element={<AdminReports />} />
                              </Routes>
                            </main>
                          </div>
                        </AdminRoute>
                      }
                    />

                    {/* Regular Backoffice Routes */}
                    <Route
                      path="/*"
                      element={
                      <ProtectedRoute>
                        <div className="flex min-h-screen w-full">
                          <AnimatedSidebar />
                            <main className="flex-1 md:ml-72 bg-background">
                            <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 bg-card sticky top-0 z-10">
                              <div className="flex-1 max-w-[180px] sm:max-w-xs md:max-w-md">
                                <PropertySelectorCommand />
                              </div>
                              <NotificationMenu />
                            </header>
                            <Routes>
                              <Route path="/overview" element={<OverviewDashboard />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/reservas" element={<Reservas />} />
                              <Route path="/checkins" element={<CheckIns />} />
                              <Route path="/alojamento" element={<DadosAlojamento />} />
                              <Route path="/acessos" element={<Acessos />} />
                              <Route path="/calendario-fiscal" element={<CalendarioFiscal />} />
                              <Route path="/resumo-mensal" element={<ResumoMensal />} />
                              <Route path="/taxa-turistica" element={<TaxaTuristica />} />
                              <Route path="/ine" element={<INE />} />
                              <Route path="/perfil" element={<Perfil />} />
                              <Route path="/subscriptions" element={<Subscriptions />} />
                              <Route path="/equipa" element={<Equipa />} />
                              <Route path="/reservas-diretas" element={<ReservasDiretas />} />
                              <Route path="/faturacao" element={<Faturacao />} />
                              <Route path="/guidebooks" element={<Guidebooks />} />
                              <Route path="/upsell-orders" element={<UpsellOrders />} />
                              <Route path="/proprietarios" element={<Proprietarios />} />
                              <Route path="/reviews" element={<Reviews />} />
                              <Route path="/analiticas" element={<Analiticas />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </OwnerAuthProvider>
        </ReservaProvider>
      </PropertyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
