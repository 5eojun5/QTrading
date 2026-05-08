"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { OptionsChain } from "@/components/options/OptionsChain";
import { useMarketStore } from "@/store/marketStore";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, Activity, BarChart3, Zap } from "lucide-react";

export default function OptionsPage() {
  const quotes = useMarketStore((s) => s.quotes);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const watchlist = useMarketStore((s) => s.watchlist);
  const optionsAlerts = useMarketStore((s) => s.optionsAlerts);
  const [activeSymbol, setActiveSymbol] = useState(selectedSymbol);

  const quote = quotes[activeSymbol];

  const handleSelect = (sym: string) => {
    setActiveSymbol(sym);
    setSelectedSymbol(sym);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Options Chain
            </h1>
            <p className="text-sm text-muted-foreground">Real-time options data with Greeks analysis</p>
          </div>
          {/* Symbol quick-select */}
          <div className="flex items-center gap-2">
            {watchlist.slice(0, 6).map((sym) => (
              <button
                key={sym}
                onClick={() => handleSelect(sym)}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors",
                  activeSymbol === sym
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "text-muted-foreground border-border hover:border-border/70 hover:text-foreground"
                )}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Quote summary */}
        {quote && (
          <div className="flex items-center gap-6 mt-3">
            <span className="text-lg font-bold font-mono">${quote.price.toFixed(2)}</span>
            <span className={cn("text-sm font-mono", quote.changePercent >= 0 ? "text-bull" : "text-bear")}>
              {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({formatPercent(quote.changePercent)})
            </span>
            <div className="flex gap-4 text-xs text-muted-foreground ml-4">
              <span>IV Rank: <strong className="text-warning">42.3</strong></span>
              <span>IV Pct: <strong className="text-warning">38th</strong></span>
              <span>Put/Call: <strong className="text-chart-2">0.82</strong></span>
              <span>Avg IV: <strong>28.4%</strong></span>
            </div>
            <div className="ml-auto flex gap-3 text-xs">
              {[
                { label: "Call OI", value: "485K", color: "text-bull" },
                { label: "Put OI", value: "312K", color: "text-bear" },
                { label: "Gamma Exp.", value: formatCurrency(2_340_000), color: "text-warning" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass px-3 py-1.5 rounded-lg">
                  <div className="text-muted-foreground">{label}</div>
                  <div className={cn("font-bold font-mono", color)}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Options chain table */}
        <div className="flex-1 overflow-y-auto">
          {quote && <OptionsChain symbol={activeSymbol} underlyingPrice={quote.price} />}
        </div>

        {/* Right panel - unusual activity */}
        <div className="w-64 shrink-0 border-l border-border overflow-y-auto p-3 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" /> Unusual Activity
          </h3>
          {optionsAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{alert.symbol}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                    alert.contractType === "call" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                  )}>
                    {alert.contractType.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-warning capitalize">{alert.type.replace("_", " ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-muted-foreground">Strike</div>
                <div className="font-mono font-bold text-right">${alert.strike}</div>
                <div className="text-muted-foreground">Expiry</div>
                <div className="font-mono text-right">{alert.expiration}</div>
                <div className="text-muted-foreground">Premium</div>
                <div className={cn("font-mono font-bold text-right",
                  alert.sentiment === "bullish" ? "text-bull" : "text-bear"
                )}>
                  {formatCurrency(alert.premium)}
                </div>
                <div className="text-muted-foreground">Vol/OI</div>
                <div className="font-mono font-bold text-right text-warning">{alert.volumeOIRatio.toFixed(1)}x</div>
              </div>
            </motion.div>
          ))}

          {/* Greeks explainer */}
          <div className="mt-4 pt-3 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Greeks Legend</h3>
            {[
              { greek: "Δ Delta", desc: "Price sensitivity", color: "text-chart-2" },
              { greek: "Γ Gamma", desc: "Delta rate of change", color: "text-primary" },
              { greek: "Θ Theta", desc: "Time decay per day", color: "text-bear" },
              { greek: "V Vega", desc: "IV sensitivity", color: "text-warning" },
            ].map(({ greek, desc, color }) => (
              <div key={greek} className="flex items-center justify-between text-xs mb-1.5">
                <span className={cn("font-mono font-bold", color)}>{greek}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
