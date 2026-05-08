"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Zap, DollarSign, BarChart3 } from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { QuoteCard } from "@/components/market/QuoteCard";
import { SignalCard } from "@/components/market/SignalCard";
import { MarketHeatmap } from "@/components/market/MarketHeatmap";
import { TradingChart } from "@/components/charts/TradingChart";
import { cn, formatCurrency, formatPercent, formatVolume } from "@/lib/utils";
import { generateMarketMovers, generateOptionsAlerts } from "@/lib/mockData";

const movers = generateMarketMovers();
const optAlerts = generateOptionsAlerts();

export default function DashboardPage() {
  const quotes = useMarketStore((s) => s.quotes);
  const watchlist = useMarketStore((s) => s.watchlist);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const signals = useMarketStore((s) => s.signals);
  const portfolio = useMarketStore((s) => s.portfolio);
  const selectedQuote = quotes[selectedSymbol];

  const gainers = movers.filter((m) => m.type === "gainer");
  const losers = movers.filter((m) => m.type === "loser");

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-card/30">
        {[
          { label: "Portfolio", value: formatCurrency(portfolio.totalValue), change: portfolio.dayPnLPercent, icon: DollarSign },
          { label: "Day P&L", value: formatCurrency(portfolio.dayPnL), change: portfolio.dayPnLPercent, icon: TrendingUp },
          { label: "Win Rate", value: `${portfolio.winRate}%`, icon: Activity },
          { label: "Sharpe", value: portfolio.sharpeRatio.toFixed(2), icon: BarChart3 },
          { label: "Open Signals", value: signals.length, icon: Zap },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <stat.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-sm font-bold font-mono number-font">
                {stat.value}
                {stat.change !== undefined && (
                  <span className={cn("text-xs ml-1", stat.change >= 0 ? "text-bull" : "text-bear")}>
                    {formatPercent(stat.change)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-px h-6 bg-border ml-2" />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - watchlist */}
        <div className="w-52 shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Watchlist</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-1 px-2">
            {watchlist.map((sym) => {
              const q = quotes[sym];
              if (!q) return null;
              return (
                <QuoteCard
                  key={sym}
                  quote={q}
                  compact
                  selected={sym === selectedSymbol}
                  onClick={() => setSelectedSymbol(sym)}
                />
              );
            })}
          </div>
        </div>

        {/* Center - chart + data */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Selected stock header */}
          {selectedQuote && (
            <div className="px-4 py-3 border-b border-border flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{selectedQuote.symbol}</h1>
                  <span className="text-sm text-muted-foreground">{selectedQuote.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-bold font-mono number-font">${selectedQuote.price.toFixed(2)}</span>
                  <span className={cn("text-sm font-mono", selectedQuote.changePercent >= 0 ? "text-bull" : "text-bear")}>
                    {selectedQuote.change >= 0 ? "+" : ""}{selectedQuote.change.toFixed(2)} ({formatPercent(selectedQuote.changePercent)})
                  </span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-6 text-sm">
                {[
                  { label: "Open", value: `$${selectedQuote.open.toFixed(2)}` },
                  { label: "High", value: `$${selectedQuote.high.toFixed(2)}` },
                  { label: "Low", value: `$${selectedQuote.low.toFixed(2)}` },
                  { label: "Volume", value: formatVolume(selectedQuote.volume) },
                  { label: "P/E", value: selectedQuote.pe.toFixed(1) },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="font-mono number-font font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="flex-1 p-3 overflow-hidden">
            <TradingChart height={380} />
          </div>

          {/* Market movers row */}
          <div className="border-t border-border px-4 py-3 flex gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-bull mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top Gainers
              </div>
              <div className="flex gap-2">
                {gainers.map((m) => (
                  <motion.button
                    key={m.symbol}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 bg-bull/10 border border-bull/20 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-bold">{m.symbol}</span>
                    <span className="text-bull font-mono">{formatPercent(m.changePercent)}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <div className="text-xs font-medium text-bear mb-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Top Losers
              </div>
              <div className="flex gap-2">
                {losers.map((m) => (
                  <motion.button
                    key={m.symbol}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 bg-bear/10 border border-bear/20 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-bold">{m.symbol}</span>
                    <span className="text-bear font-mono">{formatPercent(m.changePercent)}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - signals + heatmap */}
        <div className="w-72 shrink-0 border-l border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Options alerts */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" /> Options Flow
              </h3>
              <div className="space-y-2">
                {optAlerts.slice(0, 3).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-lg p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{alert.symbol}</span>
                      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium",
                        alert.sentiment === "bullish" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                      )}>
                        {alert.contractType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      ${alert.strike} {alert.expiration} · {formatCurrency(alert.premium)}
                    </div>
                    <div className="flex justify-between mt-1 text-muted-foreground">
                      <span>Vol: {(alert.volume / 1000).toFixed(1)}K</span>
                      <span className="text-warning">{alert.type.replace("_", " ")}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Signals */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3 text-primary" /> AI Signals
              </h3>
              <div className="space-y-2">
                {signals.slice(0, 3).map((sig, i) => (
                  <SignalCard key={sig.id} signal={sig} index={i} />
                ))}
              </div>
            </div>

            {/* Heatmap */}
            <MarketHeatmap />
          </div>
        </div>
      </div>
    </div>
  );
}
