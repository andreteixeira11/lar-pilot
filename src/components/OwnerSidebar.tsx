import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";
import { useOwnerLanguage } from "@/contexts/OwnerLanguageContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OwnerLanguageSelector } from "@/components/OwnerLanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  FileText,
  FolderOpen,
  LogOut,
  Home,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/proprietario", icon: LayoutDashboard, labelKey: "sidebar.dashboard" },
  { path: "/proprietario/reservas", icon: CalendarDays, labelKey: "sidebar.reservations" },
  { path: "/proprietario/financeiro", icon: Wallet, labelKey: "sidebar.financial" },
  { path: "/proprietario/relatorios", icon: FileText, labelKey: "sidebar.reports" },
  { path: "/proprietario/documentos", icon: FolderOpen, labelKey: "sidebar.documents" },
];

export function OwnerSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { owner, logout } = useOwnerAuth();
  const { t } = useOwnerLanguage();
  const location = useLocation();

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const renderNavigation = (onItemClick?: () => void) => (
    <>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium shadow-sm"
                : "hover:bg-primary/10 hover:text-primary text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </>
  );

  const renderUserSection = (onLogout: () => void) => (
    <div className="p-4 border-t border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-primary/10 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {owner?.ownerName ? getInitials(owner.ownerName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{owner?.ownerName}</p>
              <p className="text-xs text-muted-foreground">{t("sidebar.owner")}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          <DropdownMenuItem className="cursor-default">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>{owner?.propertyName}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("sidebar.logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logos/monumenta-logo.svg" 
                      alt="Monumenta Atlantic" 
                      className="h-10 w-auto"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-foreground truncate">
                        {t("sidebar.title")}
                      </h2>
                      <p className="text-xs text-muted-foreground truncate">
                        {owner?.propertyName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="px-4 py-3 border-b border-border">
                  <OwnerLanguageSelector />
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-1">{renderNavigation(toggleSidebar)}</div>
                </nav>

                {/* User Profile Section */}
                {renderUserSection(handleLogout)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-72 bg-background border-r border-border">
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumenta Atlantic" 
              className="h-10 w-auto"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {t("sidebar.title")}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {owner?.propertyName}
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="px-4 py-3 border-b border-border">
          <OwnerLanguageSelector />
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">{renderNavigation()}</div>
        </nav>

        {/* User Profile Section */}
        {renderUserSection(logout)}
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
}
