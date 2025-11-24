"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Home,
  Key,
  DollarSign,
  BarChart3,
  FileText,
  CalendarDays,
} from "lucide-react";

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
  { title: "Dados do Alojamento", url: "/alojamento", icon: Home },
  { title: "Reservas", url: "/reservas", icon: CalendarIcon },
  { title: "Acessos", url: "/acessos", icon: Key },
  { title: "Taxa Turística", url: "/taxa-turistica", icon: DollarSign },
  { title: "INE", url: "/ine", icon: BarChart3 },
  { title: "Calendário Fiscal", url: "/calendario-fiscal", icon: CalendarDays },
  { title: "Resumo Mensal", url: "/resumo-mensal", icon: FileText },
];

export const AnimatedSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

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
                            `flex gap-3 items-center w-full py-3 px-4 rounded-lg transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-accent text-foreground"
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
                    `flex gap-3 items-center w-full py-3 px-4 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent text-foreground"
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
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden">
        <AnimatedMenuToggle toggle={toggleSidebar} isOpen={isOpen} />
      </div>
    </>
  );
};
