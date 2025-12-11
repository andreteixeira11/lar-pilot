"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Calendar as CalendarIcon,
  Home,
  Key,
  DollarSign,
  BarChart3,
  FileText,
  CalendarDays,
  ClipboardCheck,
  UserCircle,
  CreditCard,
  LogOut,
  User,
  LayoutDashboard,
  Building2,
  Users,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AnimatedMenuToggle = ({
  toggle,
  isOpen,
}: {
  toggle: () => void;
  isOpen: boolean;
}) => (
  <button
    onClick={toggle}
    aria-label="Toggle menu"
    className="focus:outline-none z-50"
  >
    <motion.div animate={{ y: isOpen ? 13 : 0 }} transition={{ duration: 0.3 }}>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        className="text-foreground"
      >
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 2.5 L 22 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 12 L 22 12", opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 21.5 L 22 21.5" },
            open: { d: "M 3 2.5 L 17 16.5" },
          }}
        />
      </motion.svg>
    </motion.div>
  </button>
);

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reservas", url: "/reservas", icon: CalendarIcon },
  { title: "Check-ins", url: "/checkins", icon: ClipboardCheck },
  { title: "Acessos", url: "/acessos", icon: Key },
  { title: "Taxa Turística", url: "/taxa-turistica", icon: DollarSign },
  { title: "INE", url: "/ine", icon: BarChart3 },
  { title: "Calendário Fiscal", url: "/calendario-fiscal", icon: CalendarDays },
  { title: "Resumo Mensal", url: "/resumo-mensal", icon: FileText },
];

export const AnimatedSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

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
              className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border"
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
                  <ul className="space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.title}>
                        <NavLink
                          to={item.url}
                          end
                          onClick={toggleSidebar}
                          className={({ isActive }) =>
                            `flex gap-3 items-center w-full py-3 px-4 rounded-xl transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium shadow-sm"
                                : "hover:bg-primary/10 hover:text-primary text-foreground"
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
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
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-background border-r border-border">
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
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end
                  className={({ isActive }) =>
                    `flex gap-3 items-center w-full py-3 px-4 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium shadow-sm"
                        : "hover:bg-primary/10 hover:text-primary text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
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
