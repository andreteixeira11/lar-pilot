import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar as CalendarIcon,
  Key,
  DollarSign,
  BarChart3,
  FileText,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Building2,
  BookOpen,
  ShoppingCart,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Dados do Alojamento", url: "/alojamento", icon: Building2 },
  { title: "Reservas", url: "/reservas", icon: CalendarIcon },
  { title: "Check-ins", url: "/checkins", icon: ClipboardCheck },
  { title: "Acessos", url: "/acessos", icon: Key },
  { title: "Taxa Turística", url: "/taxa-turistica", icon: DollarSign },
  { title: "INE", url: "/ine", icon: BarChart3 },
  { title: "Calendário Fiscal", url: "/calendario-fiscal", icon: CalendarDays },
  { title: "Resumo Mensal", url: "/resumo-mensal", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  
  // Check for pending upsell orders
  const { data: pendingUpsells = 0 } = useQuery({
    queryKey: ["pending-upsells-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("upsell_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isGuidebooksActive = location.pathname.startsWith("/guidebooks") || location.pathname.startsWith("/upsell-orders");

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {state !== "collapsed" && (
          <div className="px-6 py-4 border-b border-sidebar-border flex items-center justify-center">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumenta Atlantic" 
              className="h-16 w-auto"
            />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/10 text-primary font-medium rounded-xl"
                          : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Guidebooks with submenu */}
              <Collapsible defaultOpen={isGuidebooksActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isGuidebooksActive ? "bg-primary/10 text-primary font-medium rounded-xl" : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"}>
                      <BookOpen className="h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">Guidebooks</span>
                          {pendingUpsells > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs mr-1">
                              {pendingUpsells}
                            </Badge>
                          )}
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/guidebooks"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Os Meus Guidebooks
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/upsell-orders"
                            className={({ isActive }) =>
                              `flex items-center gap-2 ${isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"}`
                            }
                          >
                            Pedidos Upsell
                            {pendingUpsells > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                                {pendingUpsells}
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Help Center */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/ajuda"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "bg-primary/10 text-primary font-medium rounded-xl"
                        : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                    }
                  >
                    <HelpCircle className="h-4 w-4" />
                    {state !== "collapsed" && <span>Central de Ajuda</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
