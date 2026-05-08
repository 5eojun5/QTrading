"use client";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMarketData } from "@/hooks/useMarketData";

export function AppShell({ children }: { children: React.ReactNode }) {
  useWebSocket();
  useMarketData();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
