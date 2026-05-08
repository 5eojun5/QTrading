"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, TrendingUp, Activity, Plus, X, Filter } from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { cn, formatCurrency, formatPercent, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

type AlertType = "price" | "indicator" | "options" | "ai_signal";
type AlertFilter = "all" | AlertType;

interface Alert {
  id: string;
  type: AlertType;
  symbol: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: number;
  triggered: boolean;
}

const MOCK_ALERTS: Alert[] = [
  { id: "a1", type: "options", symbol: "NVDA", message: "Unusual call sweep detected: 900 strike, 5/17 exp. $2.4M premium. Bullish sentiment.", severity: "critical", timestamp: Date.now() - 300000, triggered: true },
  { id: "a2", type: "ai_signal", symbol: "AAPL", message: "AI Buy signal: EMA crossover confirmed, RSI reversal from 32. Confidence: 84%.", severity: "info", timestamp: Date.now() - 600000, triggered: true },
  { id: "a3", type: "price", symbol: "TSLA", message: "Price crossed above $250.00 (target level reached). Current: $251.20.", severity: "warning", timestamp: Date.now() - 1200000, triggered: true },
  { id: "a4", type: "indicator", symbol: "AMD", message: "RSI oversold on 15m chart (RSI: 27.4). Potential reversal setup.", severity: "info", timestamp: Date.now() - 1800000, triggered: true },
  { id: "a5", type: "options", symbol: "SPY", message: "Large put block: 495 strike, 6/20 exp. $8.75M premium. Possible hedge.", severity: "warning", timestamp: Date.now() - 2400000, triggered: true },
  { id: "a6", type: "ai_signal", symbol: "META", message: "Momentum breakout detected above 52-week resistance. Entry: $505, Target: $540.", severity: "info", timestamp: Date.now() - 3600000, triggered: false },
  { id: "a7", type: "price", symbol: "QQQ", message: "Volume spike: 2.8x average. Unusual institutional activity detected.", severity: "warning", timestamp: Date.now() - 4200000, triggered: false },
];

const TYPE_CONFIG = {
  price: { icon: TrendingUp, color: "text-chart-2", bg: "bg-chart-2/10", label: "Price Alert" },
  indicator: { icon: Activity, color: "text-warning", bg: "bg-warning/10", label: "Indicator Alert" },
  options: { icon: Zap, color: "text-primary", bg: "bg-primary/10", label: "Options Flow" },
  ai_signal: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10", label: "AI Signal" },
};

const SEVERITY_CONFIG = {
  info: "border-chart-2/20 bg-chart-2/5",
  warning: "border-warning/20 bg-warning/5",
  critical: "border-bear/20 bg-bear/5",
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ symbol: "AAPL", type: "price" as AlertType, condition: "above", value: "" });
  const optAlerts = useMarketStore((s) => s.optionsAlerts);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const createAlert = () => {
    toast.success(`Alert created for ${newAlert.symbol}`);
    setShowCreate(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Alert Center
            </h1>
            <p className="text-sm text-muted-foreground">Real-time alerts for price, indicators, options flow, and AI signals</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border">
        {[
          { label: "Total Alerts", value: alerts.length, color: "text-foreground" },
          { label: "Critical", value: alerts.filter(a => a.severity === "critical").length, color: "text-bear" },
          { label: "Options Flow", value: alerts.filter(a => a.type === "options").length, color: "text-primary" },
          { label: "AI Signals", value: alerts.filter(a => a.type === "ai_signal").length, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={cn("text-2xl font-bold font-mono mt-1", color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "price", "indicator", "options", "ai_signal"] as AlertFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("px-3 py-1 text-xs rounded-lg capitalize transition-colors",
              filter === f ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} alerts</span>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <AnimatePresence>
          {filtered.map((alert, i) => {
            const config = TYPE_CONFIG[alert.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={cn("glass rounded-xl p-4 border transition-all hover:border-border/70", SEVERITY_CONFIG[alert.severity])}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{alert.symbol}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded", config.bg, config.color)}>
                        {config.label}
                      </span>
                      {alert.severity === "critical" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-bear/15 text-bear font-medium">CRITICAL</span>
                      )}
                      {!alert.triggered && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{alert.message}</p>
                    <div className="text-xs text-muted-foreground mt-1">{timeAgo(alert.timestamp)}</div>
                  </div>
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create alert modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="w-[440px] glass-strong rounded-2xl p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Create Alert</h2>
                  <button onClick={() => setShowCreate(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Alert Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["price", "indicator", "options", "ai_signal"] as AlertType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setNewAlert((p) => ({ ...p, type: t }))}
                          className={cn("py-2 px-3 rounded-lg text-sm capitalize transition-colors text-left",
                            newAlert.type === t ? "bg-primary/15 text-primary border border-primary/30" : "bg-accent text-muted-foreground"
                          )}
                        >
                          {t.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Symbol</label>
                    <input
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                      className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  {newAlert.type === "price" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                        <select
                          value={newAlert.condition}
                          onChange={(e) => setNewAlert((p) => ({ ...p, condition: e.target.value }))}
                          className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none"
                        >
                          <option value="above">Above</option>
                          <option value="below">Below</option>
                          <option value="crosses">Crosses</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Price</label>
                        <input
                          type="number"
                          value={newAlert.value}
                          onChange={(e) => setNewAlert((p) => ({ ...p, value: e.target.value }))}
                          placeholder="e.g. 200.00"
                          className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={createAlert}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
                  >
                    Create Alert
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
