"use client";
import { motion } from "framer-motion";
import { Target, Shield, TrendingUp, Clock, Zap } from "lucide-react";
import { cn, formatCurrency, formatPercent, getConfidenceColor, timeAgo } from "@/lib/utils";
import type { TradeSignal } from "@/types/market";

interface SignalCardProps {
  signal: TradeSignal;
  index?: number;
}

export function SignalCard({ signal, index = 0 }: SignalCardProps) {
  const isBull = signal.action === "BUY";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 hover:border-border/70 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("px-2 py-0.5 rounded text-xs font-bold tracking-wide",
            isBull ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
          )}>
            {signal.action}
          </div>
          <span className="font-bold text-sm">{signal.symbol}</span>
          {signal.contractType && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded border",
              signal.contractType === "call" ? "border-bull/30 text-bull" : "border-bear/30 text-bear"
            )}>
              {signal.contractType.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeAgo(signal.timestamp)}
        </div>
      </div>

      {/* Strategy badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 text-xs bg-accent px-2 py-1 rounded-md text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" />
          {signal.strategy}
        </div>
        <div className="text-xs text-muted-foreground">{signal.timeframe}</div>
      </div>

      {/* Price levels */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Entry</div>
          <div className="text-sm font-mono font-bold number-font">${signal.entryPrice.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Target</div>
          <div className="text-sm font-mono font-bold number-font text-bull">${signal.targetPrice.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Stop</div>
          <div className="text-sm font-mono font-bold number-font text-bear">${signal.stopLoss.toFixed(2)}</div>
        </div>
      </div>

      {/* Confidence + R/R */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", signal.confidence >= 80 ? "bg-bull" : signal.confidence >= 60 ? "bg-warning" : "bg-bear")}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span className={cn("text-xs font-mono font-bold", getConfidenceColor(signal.confidence))}>
                {signal.confidence}%
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">R/R</div>
            <div className="text-xs font-mono font-bold text-primary">{signal.riskReward.toFixed(1)}x</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Win%</div>
            <div className="text-xs font-mono font-bold">{signal.probability}%</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
            isBull
              ? "bg-bull/15 text-bull hover:bg-bull/25 border border-bull/20"
              : "bg-bear/15 text-bear hover:bg-bear/25 border border-bear/20"
          )}
        >
          Trade
        </motion.button>
      </div>
    </motion.div>
  );
}
