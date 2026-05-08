"use client";
import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";
import { useMarketStore } from "@/store/marketStore";

const SECTORS = [
  { name: "Technology", symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMD", "META"] },
  { name: "Consumer", symbols: ["AMZN", "TSLA"] },
  { name: "Index ETFs", symbols: ["SPY", "QQQ"] },
];

export function MarketHeatmap() {
  const quotes = useMarketStore((s) => s.quotes);
  const setSelected = useMarketStore((s) => s.setSelectedSymbol);

  const getColor = (pct: number) => {
    if (pct >= 3) return "bg-bull text-white";
    if (pct >= 1.5) return "bg-bull/70 text-white";
    if (pct >= 0.5) return "bg-bull/40 text-bull";
    if (pct >= 0) return "bg-bull/20 text-bull";
    if (pct >= -0.5) return "bg-bear/20 text-bear";
    if (pct >= -1.5) return "bg-bear/40 text-bear";
    if (pct >= -3) return "bg-bear/70 text-white";
    return "bg-bear text-white";
  };

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Market Heatmap</h3>
      <div className="space-y-3">
        {SECTORS.map((sector) => (
          <div key={sector.name}>
            <div className="text-xs text-muted-foreground mb-1.5">{sector.name}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {sector.symbols.map((sym) => {
                const q = quotes[sym];
                if (!q) return null;
                return (
                  <motion.button
                    key={sym}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(sym)}
                    className={cn("rounded-lg p-2 text-center transition-all", getColor(q.changePercent))}
                  >
                    <div className="text-xs font-bold">{sym}</div>
                    <div className="text-xs font-mono number-font">{formatPercent(q.changePercent)}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
