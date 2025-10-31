import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PropertyProvider } from "@/contexts/PropertyContext";
import Reservas from "./pages/Reservas";
import ResumoMensal from "./pages/ResumoMensal";
import TaxaTuristica from "./pages/TaxaTuristica";
import INE from "./pages/INE";
import DadosAlojamento from "./pages/DadosAlojamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PropertyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 bg-background">
                <header className="h-14 border-b border-border flex items-center px-4 bg-card sticky top-0 z-10">
                  <SidebarTrigger />
                </header>
                <Routes>
                  <Route path="/" element={<Navigate to="/reservas" replace />} />
                  <Route path="/reservas" element={<Reservas />} />
                  <Route path="/alojamento" element={<DadosAlojamento />} />
                  <Route path="/resumo-mensal" element={<ResumoMensal />} />
                  <Route path="/taxa-turistica" element={<TaxaTuristica />} />
                  <Route path="/ine" element={<INE />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyProvider>
  </QueryClientProvider>
);

export default App;
