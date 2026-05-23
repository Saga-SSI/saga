"use client";

import AgentWindow from "@/components/dashboard/AgentWindow";
import DocsAssistantWindow from "@/components/dashboard/DocsAssistantWindow";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <div className="relative h-screen bg-[#1C1C1C]">
      <div className="flex h-screen transition-all duration-300 ease-in-out">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <AgentWindow />
      <DocsAssistantWindow />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
