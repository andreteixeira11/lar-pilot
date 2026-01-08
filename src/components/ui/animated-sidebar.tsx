"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Calendar as CalendarIcon,
  Key,
  DollarSign,
  BarChart3,
  FileText,
  CalendarDays,
  ClipboardCheck,
  UserCircle,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  Globe,
  ChevronDown,
  Receipt,
  BookOpen,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface MenuGroup {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Reservas",
    icon: CalendarIcon,
    items: [
      { title: "Calendário", url: "/reservas", icon: CalendarIcon },
      { title: "Check-ins", url: "/checkins", icon: ClipboardCheck },
      { title: "Reservas Diretas", url: "/reservas-diretas", icon: Globe },
    ],
  },
  {
    title: "Finanças",
    icon: DollarSign,
    items: [
      { title: "Faturação", url: "/faturacao", icon: Receipt },
      { title: "Calendário Fiscal", url: "/calendario-fiscal", icon: CalendarDays },
      { title: "Resumo Mensal", url: "/resumo-mensal", icon: FileText },
    ],
  },
  {
    title: "Relatórios",
    icon: TrendingUp,
    items: [
      { title: "Taxa Turística", url: "/taxa-turistica", icon: DollarSign },
      { title: "INE", url: "/ine", icon: BarChart3 },
      { title: "Proprietários", url: "/proprietarios", icon: UserCheck },
      { title: "Reviews", url: "/reviews", icon: Star },
    ],
  },
  {
    title: "Guidebooks",
    icon: BookOpen,
    items: [
      { title: "Os Meus Guidebooks", url: "/guidebooks", icon: BookOpen },
      { title: "Pedidos Upsell", url: "/upsell-orders", icon: ShoppingCart },
    ],
  },
];

const CollapsibleMenuGroup = ({
  group,
  isOpen,
  onToggle,
  onItemClick,
}: {
  group: MenuGroup;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}) => {
  const location = useLocation();
  const isGroupActive = group.items.some((item) => location.pathname === item.url);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center justify-between w-full py-3 px-4 rounded-xl transition-colors",
          isGroupActive
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-primary/10 hover:text-primary text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <group.icon className="h-5 w-5" />
          <span>{group.title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 mt-1 space-y-1">
        {group.items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "flex gap-3 items-center w-full py-2.5 px-4 rounded-xl transition-colors text-sm",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-primary/10 hover:text-primary text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const AnimatedSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Reservas: true,
    Finanças: false,
    Relatórios: false,
  });
  const { user, profile, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open group if current route is within it
  useState(() => {
    menuGroups.forEach((group) => {
      if (group.items.some((item) => location.pathname === item.url)) {
        setOpenGroups((prev) => ({ ...prev, [group.title]: true }));
      }
    });
  });

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "?";

  const displayName = profile?.name || "Utilizador";

  const renderNavigation = (onItemClick?: () => void) => (
    <>
      {/* Visão Geral - New Overview Page */}
      <NavLink
        to="/overview"
        onClick={onItemClick}
        className={({ isActive }) =>
          cn(
            "flex gap-3 items-center w-full py-3 px-4 rounded-xl transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "hover:bg-primary/10 hover:text-primary text-foreground"
          )
        }
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Visão Geral</span>
      </NavLink>

      {/* Dashboard Propriedade */}
      <NavLink
        to="/dashboard"
        onClick={onItemClick}
        className={({ isActive }) =>
          cn(
            "flex gap-3 items-center w-full py-3 px-4 rounded-xl transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "hover:bg-primary/10 hover:text-primary text-foreground"
          )
        }
      >
        <Building2 className="h-5 w-5" />
        <span>Dashboard Propriedade</span>
      </NavLink>

      {/* Collapsible Groups */}
      {menuGroups.map((group) => (
        <CollapsibleMenuGroup
          key={group.title}
          group={group}
          isOpen={openGroups[group.title] || false}
          onToggle={() => toggleGroup(group.title)}
          onItemClick={onItemClick}
        />
      ))}

      {/* 7. Acessos */}
      <NavLink
        to="/acessos"
        onClick={onItemClick}
        className={({ isActive }) =>
          cn(
            "flex gap-3 items-center w-full py-3 px-4 rounded-xl transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "hover:bg-primary/10 hover:text-primary text-foreground"
          )
        }
      >
        <Key className="h-5 w-5" />
        <span>Acessos</span>
      </NavLink>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
              onClick={toggleSidebar}
            />

            {/* Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileSidebarVariants}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border"
            >
              <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="p-6 border-b border-border flex items-center justify-center">
                  <img
                    src="/logos/monumenta-logo.svg"
                    alt="Monumenta Atlantic"
                    className="h-16 w-auto"
                  />
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-1">{renderNavigation(toggleSidebar)}</div>
                </nav>

                {/* Admin Link */}
                {isAdmin && (
                  <div className="px-4 pb-2">
                    <NavLink
                      to="/admin"
                      onClick={toggleSidebar}
                      className="flex gap-3 items-center w-full py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Painel Admin</span>
                    </NavLink>
                  </div>
                )}

                {/* User Profile Section */}
                <div className="p-4 border-t border-border">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/perfil");
                          toggleSidebar();
                        }}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/subscriptions");
                          toggleSidebar();
                        }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscrições</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/equipa");
                          toggleSidebar();
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Equipa</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-72 bg-background border-r border-border">
        {/* Logo Section */}
        <div className="p-6 border-b border-border flex items-center justify-center">
          <img
            src="/logos/monumenta-logo.svg"
            alt="Monumenta Atlantic"
            className="h-16 w-auto"
          />
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">{renderNavigation()}</div>
        </nav>

        {/* Admin Link */}
        {isAdmin && (
          <div className="px-4 pb-2">
            <NavLink
              to="/admin"
              className="flex gap-3 items-center w-full py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Painel Admin</span>
            </NavLink>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/subscriptions")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscrições</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/equipa")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Equipa</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Toggle Button - Fixed Position */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 rounded-lg bg-card border border-border shadow-md"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
    </>
  );
};
