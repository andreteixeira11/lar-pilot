import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Simulador from "./pages/Simulador";
import CheckIn from "./pages/CheckIn";
import CheckIns from "./pages/CheckIns";
import Dashboard from "./pages/Dashboard";
import OverviewDashboard from "./pages/OverviewDashboard";
import Reservas from "./pages/Reservas";
import ResumoMensal from "./pages/ResumoMensal";
import TaxaTuristica from "./pages/TaxaTuristica";
import INE from "./pages/INE";
import DadosAlojamento from "./pages/DadosAlojamento";
import Acessos from "./pages/Acessos";
import CalendarioFiscal from "./pages/CalendarioFiscal";
import Subscriptions from "./pages/Subscriptions";
import Perfil from "./pages/Perfil";
import Equipa from "./pages/Equipa";
import AcceptInvite from "./pages/AcceptInvite";
import PublicBookingPage from "./pages/PublicBookingPage";
import ReservasDiretas from "./pages/ReservasDiretas";
import Faturacao from "./pages/Faturacao";
import Guidebooks from "./pages/Guidebooks";
import UpsellOrders from "./pages/UpsellOrders";
import PublicGuidebook from "./pages/PublicGuidebook";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminReports from "./pages/admin/AdminReports";
import AdminSales from "./pages/admin/AdminSales";
import OwnerLogin from "./pages/proprietario/OwnerLogin";
import OwnerResetPassword from "./pages/proprietario/OwnerResetPassword";
import OwnerDashboard from "./pages/proprietario/OwnerDashboard";
import OwnerReservas from "./pages/proprietario/OwnerReservas";
import OwnerFinanceiro from "./pages/proprietario/OwnerFinanceiro";
import OwnerRelatorios from "./pages/proprietario/OwnerRelatorios";
import OwnerDocumentos from "./pages/proprietario/OwnerDocumentos";
import OwnerReviews from "./pages/proprietario/OwnerReviews";
import Proprietarios from "./pages/Proprietarios";
import Reviews from "./pages/Reviews";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/simulador" element={<Simulador />} />
                  <Route path="/checkin/:token" element={<CheckIn />} />
                  <Route path="/accept-invite" element={<AcceptInvite />} />
                  <Route path="/p/:slug" element={<PublicBookingPage />} />
                  <Route path="/guidebook/:id" element={<PublicGuidebook />} />
                  
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
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OwnerAuthProvider>
        </ReservaProvider>
      </PropertyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
