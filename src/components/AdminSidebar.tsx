import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building2, FileBarChart, ArrowLeft } from "lucide-react";
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
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Vendas", url: "/admin/sales", icon: FileBarChart },
  { title: "Utilizadores", url: "/admin/users", icon: Users },
  { title: "Propriedades", url: "/admin/properties", icon: Building2 },
  { title: "Relatórios", url: "/admin/reports", icon: FileBarChart },
];

export function AdminSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {state !== "collapsed" && (
          <div className="px-6 py-4 border-b border-sidebar-border">
            <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Gestão da Plataforma</p>
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
                      end={item.url === "/admin"}
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    className="hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {state !== "collapsed" && <span>Voltar ao Backoffice</span>}
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
