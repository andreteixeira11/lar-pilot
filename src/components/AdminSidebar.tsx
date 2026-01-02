import { NavLink } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Users, Building2, FileBarChart, ArrowLeft, Menu, X, ChevronLeft, ShoppingCart, UserPlus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/admin/leads", icon: UserPlus },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Vendas", url: "/admin/sales", icon: ShoppingCart },
  { title: "Utilizadores", url: "/admin/users", icon: Users },
  { title: "Propriedades", url: "/admin/properties", icon: Building2 },
  { title: "Relatórios", url: "/admin/reports", icon: FileBarChart },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-72",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "border-b border-border flex items-center justify-between",
            isCollapsed ? "px-2 py-4" : "px-6 py-4"
          )}>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Gestão da Plataforma</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className={cn("mb-4", isCollapsed && "text-center")}>
              {!isCollapsed && (
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Navegação
                </span>
              )}
            </div>
            {menuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-primary/5 hover:text-primary text-muted-foreground",
                    isCollapsed && "justify-center px-2"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                "hover:bg-primary/5 hover:text-primary text-muted-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <ArrowLeft className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Voltar ao Backoffice</span>}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
