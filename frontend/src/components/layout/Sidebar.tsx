"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, BarChart3, Wallet, Bell,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Activity, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMarketStore } from "@/store/marketStore";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/charts", icon: BarChart3, label: "Charts" },
  { href: "/options", icon: TrendingUp, label: "Options" },
  { href: "/trading", icon: Wallet, label: "Portfolio" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/assistant", icon: MessageSquare, label: "AI Assistant" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isConnected = useMarketStore((s) => s.isConnected);
  const isMarketOpen = useMarketStore((s) => s.isMarketOpen);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-card border-r border-border shrink-0 z-30"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <motion.span
              initial={false}
              animate={{ opacity: collapsed ? 0 : 1 }}
              className="font-bold text-lg tracking-tight whitespace-nowrap"
            >
              Q<span className="text-primary">Trading</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Market status */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2 text-xs">
            <div className={cn("w-2 h-2 rounded-full", isMarketOpen ? "bg-bull animate-pulse" : "bg-muted-foreground")} />
            <span className={isMarketOpen ? "text-bull" : "text-muted-foreground"}>
              {isMarketOpen ? "Market Open" : "Market Closed"}
            </span>
            <div className={cn("ml-auto w-2 h-2 rounded-full", isConnected ? "bg-bull animate-pulse" : "bg-warning animate-pulse")} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-border space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Paper Trading Mode</span>
            </div>
          </div>
        )}
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer",
            pathname === "/settings" && "bg-primary/10 text-primary"
          )}>
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </div>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-border border border-border/80 flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
