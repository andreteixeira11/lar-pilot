import { NavLink } from "react-router-dom";
import {
  Calendar,
  Home,
  Key,
  CheckSquare,
  DollarSign,
  BarChart3,
  FileText,
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
import { PropertySelector } from "./PropertySelector";

const mockProperties = [
  {
    id: "1",
    name: "Casa da Praia",
    address: "Rua da Praia, 123, Porto",
  },
  {
    id: "2",
    name: "Apartamento Centro",
    address: "Av. Liberdade, 45, Lisboa",
  },
  {
    id: "3",
    name: "Villa do Douro",
    address: "Quinta do Douro, Peso da Régua",
  },
];

const menuItems = [
  { title: "Reservas", url: "/reservas", icon: Calendar },
  { title: "Dados do Alojamento", url: "/alojamento", icon: Home },
  { title: "Acessos", url: "/acessos", icon: Key },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Taxa Turística", url: "/taxa-turistica", icon: DollarSign },
  { title: "INE", url: "/ine", icon: BarChart3 },
  { title: "Resumo Mensal", url: "/resumo-mensal", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {state !== "collapsed" && (
          <div className="px-6 py-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-primary">
              Gestão de Alojamento
            </h2>
          </div>
        )}

        {state !== "collapsed" && (
          <PropertySelector
            properties={mockProperties}
            selectedPropertyId="1"
            onPropertyChange={(id) => console.log("Selected property:", id)}
          />
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
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "hover:bg-sidebar-accent/50"
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
