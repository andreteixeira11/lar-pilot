import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import Reservas from "./pages/Reservas";
import ResumoMensal from "./pages/ResumoMensal";
import TaxaTuristica from "./pages/TaxaTuristica";
import INE from "./pages/INE";
import DadosAlojamento from "./pages/DadosAlojamento";
import Auth from "./pages/Auth";
import Subscriptions from "./pages/Subscriptions";
import Perfil from "./pages/Perfil";
import PropertySettings from "./pages/PropertySettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PropertyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <main className="flex-1 bg-background">
                          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card sticky top-0 z-10">
                            <SidebarTrigger />
                            <UserMenu />
                          </header>
                          <Routes>
                            <Route path="/reservas" element={<Reservas />} />
                            <Route path="/alojamento" element={<DadosAlojamento />} />
                            <Route path="/resumo-mensal" element={<ResumoMensal />} />
                            <Route path="/taxa-turistica" element={<TaxaTuristica />} />
                            <Route path="/ine" element={<INE />} />
                            <Route path="/definicoes" element={<PropertySettings />} />
                            <Route path="/perfil" element={<Perfil />} />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PropertyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
