"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        isCollapsed,
        toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),
        toggleCollapse: () => setIsCollapsed((prev) => !prev),
        setCollapsed: setIsCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
