import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab: string;
  onTabChange: (tabId: string) => void;
}

const AnimatedTabs = ({ tabs, defaultTab, onTabChange }: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
};

export default AnimatedTabs;
