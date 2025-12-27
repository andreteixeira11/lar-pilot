import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OwnerLanguageSelector } from "@/components/OwnerLanguageSelector";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  FileText,
  FolderOpen,
  LogOut,
  Home,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/proprietario", icon: LayoutDashboard, labelKey: "sidebar.dashboard" },
  { path: "/proprietario/reservas", icon: CalendarDays, labelKey: "sidebar.reservations" },
  { path: "/proprietario/financeiro", icon: Wallet, labelKey: "sidebar.financial" },
  { path: "/proprietario/relatorios", icon: FileText, labelKey: "sidebar.reports" },
  { path: "/proprietario/documentos", icon: FolderOpen, labelKey: "sidebar.documents" },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { owner, logout } = useOwnerAuth();
  const { t } = useOwnerLanguage();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    onItemClick?.();
    logout();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sidebar-foreground truncate">
              {t("sidebar.title")}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {owner?.propertyName}
            </p>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <OwnerLanguageSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {owner?.ownerName ? getInitials(owner.ownerName) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">
              {owner?.ownerName}
            </p>
            <p className="text-xs text-muted-foreground">{t("sidebar.owner")}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("sidebar.logout")}
        </Button>
      </div>
    </div>
  );
}

export function OwnerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background shadow-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar-background">
            <SidebarContent onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar-background hidden md:flex flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
