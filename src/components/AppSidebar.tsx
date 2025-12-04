import { NavLink } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";


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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
