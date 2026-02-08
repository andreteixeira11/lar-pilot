import { NavLink, useLocation, Link } from "react-router-dom";
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
  ChevronDown,
  HelpCircle,
  Users,
  Star,
  CreditCard,
  Globe,
  Link2,
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
    refetchInterval: 30000,
  });

  const isReservasActive = ["/reservas", "/checkins", "/reservas-diretas"].some(path => 
    location.pathname.startsWith(path)
  );
  
  const isFinancasActive = ["/faturacao", "/calendario-fiscal", "/resumo-mensal"].some(path => 
    location.pathname.startsWith(path)
  );
  
  const isRelatoriosActive = ["/taxa-turistica", "/ine", "/proprietarios", "/reviews"].some(path => 
    location.pathname.startsWith(path)
  );

  const isGuidebooksActive = ["/guidebooks", "/upsell-orders"].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {state !== "collapsed" && (
          <Link to="/" className="px-6 py-4 border-b border-sidebar-border flex items-center justify-center hover:opacity-80 transition-opacity">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumental Atlantic" 
              className="h-16 w-auto"
            />
          </Link>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 1. Visão Geral */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/overview"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "bg-primary/10 text-primary font-medium rounded-xl"
                        : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                    }
                  >
                    <Globe className="h-4 w-4" />
                    {state !== "collapsed" && <span>Visão Geral</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. Dashboard Propriedade */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "bg-primary/10 text-primary font-medium rounded-xl"
                        : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {state !== "collapsed" && <span>Dashboard Propriedade</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 3. Reservas (dropdown) */}
              <Collapsible defaultOpen={isReservasActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isReservasActive ? "bg-primary/10 text-primary font-medium rounded-xl" : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"}>
                      <CalendarIcon className="h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">Reservas</span>
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
                            to="/reservas"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Calendário
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/checkins"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Check-ins
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/reservas-diretas"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Reservas Diretas
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 4. Finanças (dropdown) */}
              <Collapsible defaultOpen={isFinancasActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isFinancasActive ? "bg-primary/10 text-primary font-medium rounded-xl" : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"}>
                      <CreditCard className="h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">Finanças</span>
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
                            to="/faturacao"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Faturação
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/calendario-fiscal"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Calendário Fiscal
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/resumo-mensal"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Resumo Mensal
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 5. Relatórios (dropdown) */}
              <Collapsible defaultOpen={isRelatoriosActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isRelatoriosActive ? "bg-primary/10 text-primary font-medium rounded-xl" : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"}>
                      <BarChart3 className="h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">Relatórios</span>
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
                            to="/taxa-turistica"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Taxa Turística
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/ine"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            INE
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/proprietarios"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Proprietários
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to="/reviews"
                            end
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-primary/10 hover:text-primary transition-colors"
                            }
                          >
                            Reviews
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 6. Guidebooks (dropdown) */}
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

              {/* 7. Acessos */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/acessos"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "bg-primary/10 text-primary font-medium rounded-xl"
                        : "hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                    }
                  >
                    <Key className="h-4 w-4" />
                    {state !== "collapsed" && <span>Acessos</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Central de Ajuda */}
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
