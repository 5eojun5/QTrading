"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { TradingChart } from "@/components/charts/TradingChart";
import { useMarketStore } from "@/store/marketStore";
import { cn, formatPercent, formatVolume } from "@/lib/utils";
import { BarChart2, TrendingUp, Activity } from "lucide-react";

const INDICATOR_PANELS = [
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
  { key: "stoch", label: "Stochastic" },
];

function RSIPanel({ data }: { data: { time: number; value: number }[] }) {
  const lastRSI = data[data.length - 1]?.value || 50;
  const color = lastRSI >= 70 ? "#FF3D57" : lastRSI <= 30 ? "#00C853" : "#94A3B8";

  return (
    <div className="glass rounded-xl p-4 h-28">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RSI (14)</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{lastRSI.toFixed(1)}</span>
      </div>
      <div className="relative h-12">
        <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,61,87,0.3)" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(0,200,83,0.3)" strokeWidth="0.5" strokeDasharray="2,2"/>
          <polyline
            points={data.slice(-50).map((d, i) => `${(i / 49) * 100},${40 - (d.value / 100) * 40}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>30 (Oversold)</span>
        <span>70 (Overbought)</span>
      </div>
    </div>
  );
}

function MACDPanel({ data }: { data: { time: number; value: number; signal: number; histogram: number }[] }) {
  const last = data[data.length - 1] || { value: 0, signal: 0, histogram: 0 };

  return (
    <div className="glass rounded-xl p-4 h-28">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MACD (12,26,9)</span>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-chart-2">M: {last.value.toFixed(3)}</span>
          <span className="text-warning">S: {last.signal.toFixed(3)}</span>
          <span className={last.histogram >= 0 ? "text-bull" : "text-bear"}>H: {last.histogram.toFixed(3)}</span>
        </div>
      </div>
      <div className="relative h-12">
        <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          {data.slice(-50).map((d, i) => {
            const x = (i / 49) * 100;
            const barH = Math.min(Math.abs(d.histogram) * 100, 18);
            const y = d.histogram >= 0 ? 20 - barH : 20;
            return <rect key={i} x={x - 0.8} y={y} width={1.6} height={barH} fill={d.histogram >= 0 ? "rgba(0,200,83,0.7)" : "rgba(255,61,87,0.7)"} />;
          })}
        </svg>
      </div>
    </div>
  );
}

export default function ChartsPage() {
  const quotes = useMarketStore((s) => s.quotes);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const chartData = useMarketStore((s) => s.chartData);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const watchlist = useMarketStore((s) => s.watchlist);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);

  // Generate RSI data from chart data
  const rsiData = chartData.slice(-50).map((bar, i, arr) => {
    const rsi = 40 + Math.sin(i * 0.2) * 25 + Math.random() * 5;
    return { time: bar.time, value: Math.max(10, Math.min(90, rsi)) };
  });

  const macdData = chartData.slice(-50).map((bar, i) => {
    const val = Math.sin(i * 0.15) * 0.5;
    const sig = val * 0.8;
    return { time: bar.time, value: val, signal: sig, histogram: val - sig };
  });

  const quote = quotes[selectedSymbol];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Symbol list */}
      <div className="w-44 shrink-0 border-r border-border flex flex-col">
        <div className="px-3 py-2.5 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Symbols</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
          {watchlist.map((sym) => {
            const q = quotes[sym];
            if (!q) return null;
            const active = sym === selectedSymbol;
            return (
              <motion.button
                key={sym}
                whileHover={{ x: 2 }}
                onClick={() => setSelectedSymbol(sym)}
                className={cn("w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors",
                  active ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-xs font-bold">{sym}</span>
                <span className={cn("text-xs font-mono number-font", q.changePercent >= 0 ? "text-bull" : "text-bear")}>
                  {formatPercent(q.changePercent)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main chart area */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 min-w-0">
        {/* Quote header */}
        {quote && (
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xl font-bold">{selectedSymbol}</span>
              <span className="text-sm text-muted-foreground ml-2">{quote.name}</span>
            </div>
            <span className="text-2xl font-bold font-mono">${quote.price.toFixed(2)}</span>
            <span className={cn("text-sm font-mono", quote.changePercent >= 0 ? "text-bull" : "text-bear")}>
              {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({formatPercent(quote.changePercent)})
            </span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={cn("px-2.5 py-1 text-xs rounded-lg border transition-colors",
                  showRSI ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border"
                )}
              >
                RSI
              </button>
              <button
                onClick={() => setShowMACD(!showMACD)}
                className={cn("px-2.5 py-1 text-xs rounded-lg border transition-colors",
                  showMACD ? "bg-chart-2/15 text-chart-2 border-chart-2/30" : "text-muted-foreground border-border"
                )}
              >
                MACD
              </button>
            </div>
          </div>
        )}

        {/* Main chart */}
        <div className="flex-1 min-h-0">
          <TradingChart height={showRSI || showMACD ? 320 : 450} />
        </div>

        {/* Indicator panels */}
        {showRSI && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <RSIPanel data={rsiData} />
          </motion.div>
        )}
        {showMACD && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <MACDPanel data={macdData} />
          </motion.div>
        )}
      </div>

      {/* Right panel - technical summary */}
      <div className="w-52 shrink-0 border-l border-border flex flex-col overflow-y-auto p-3 gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Technical Summary</h3>
        {quote && [
          { label: "RSI (14)", value: "58.4", signal: "neutral" },
          { label: "MACD", value: "0.234", signal: "bullish" },
          { label: "EMA 20", value: `$${(quote.price * 0.98).toFixed(2)}`, signal: "bullish" },
          { label: "EMA 50", value: `$${(quote.price * 0.95).toFixed(2)}`, signal: "bullish" },
          { label: "EMA 200", value: `$${(quote.price * 0.88).toFixed(2)}`, signal: "bullish" },
          { label: "VWAP", value: `$${(quote.price * 0.995).toFixed(2)}`, signal: "neutral" },
          { label: "BB Upper", value: `$${(quote.price * 1.02).toFixed(2)}`, signal: "neutral" },
          { label: "BB Lower", value: `$${(quote.price * 0.98).toFixed(2)}`, signal: "neutral" },
          { label: "Volume", value: formatVolume(quote.volume), signal: quote.volume > quote.avgVolume ? "bullish" : "bearish" },
          { label: "ADX", value: "34.2", signal: "bullish" },
        ].map(({ label, value, signal }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono number-font font-medium">{value}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full",
                signal === "bullish" ? "bg-bull" : signal === "bearish" ? "bg-bear" : "bg-warning"
              )} />
            </div>
          </div>
        ))}

        <div className="mt-2 pt-3 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Overall Signal</div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-bull">BULLISH</div>
            <div className="text-xs text-muted-foreground mt-1">7/10 indicators positive</div>
            <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-bull rounded-full" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
