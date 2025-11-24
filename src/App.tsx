import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatedSidebar } from "@/components/ui/animated-sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ReservaProvider } from "@/contexts/ReservaContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import { PropertySelector } from "@/components/PropertySelector";
import { NotificationMenu } from "@/components/NotificationMenu";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Reservas from "./pages/Reservas";
import ResumoMensal from "./pages/ResumoMensal";
import TaxaTuristica from "./pages/TaxaTuristica";
import INE from "./pages/INE";
import DadosAlojamento from "./pages/DadosAlojamento";
import Acessos from "./pages/Acessos";
import CalendarioFiscal from "./pages/CalendarioFiscal";
import Subscriptions from "./pages/Subscriptions";
import Perfil from "./pages/Perfil";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PropertyProvider>
        <ReservaProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                <ProtectedRoute>
                  <div className="flex min-h-screen w-full">
                    <AnimatedSidebar />
                    <main className="flex-1 md:ml-64 bg-background">
                      <header className="h-14 border-b border-border flex items-center justify-between gap-4 px-4 bg-card sticky top-0 z-10">
                        <div className="flex-1 max-w-md">
                          <PropertySelector />
                        </div>
                        <div className="flex items-center gap-2">
                          <NotificationMenu />
                          <UserMenu />
                        </div>
                      </header>
                      <Routes>
                        <Route path="/reservas" element={<Reservas />} />
                        <Route path="/alojamento" element={<DadosAlojamento />} />
                        <Route path="/acessos" element={<Acessos />} />
                        <Route path="/calendario-fiscal" element={<CalendarioFiscal />} />
                        <Route path="/resumo-mensal" element={<ResumoMensal />} />
                        <Route path="/taxa-turistica" element={<TaxaTuristica />} />
                        <Route path="/ine" element={<INE />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
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
        </ReservaProvider>
      </PropertyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
