"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { cn, formatGreek, formatPercent, formatVolume } from "@/lib/utils";
import type { OptionContract } from "@/types/market";
import { generateOptionChain } from "@/lib/mockData";

interface OptionsChainProps {
  symbol: string;
  underlyingPrice: number;
}

const GREEK_COLORS = {
  delta: "text-chart-2",
  gamma: "text-primary",
  theta: "text-bear",
  vega: "text-warning",
};

export function OptionsChain({ symbol, underlyingPrice }: OptionsChainProps) {
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const [showType, setShowType] = useState<"both" | "calls" | "puts">("both");
  const [highlightITM, setHighlightITM] = useState(true);

  const contracts = useMemo(() => generateOptionChain(symbol, underlyingPrice), [symbol, underlyingPrice]);

  const expirations = useMemo(() =>
    Array.from(new Set(contracts.map((c) => c.expiration))).sort(),
    [contracts]
  );

  const activeExpiry = selectedExpiry || expirations[0];

  const calls = contracts.filter((c) => c.type === "call" && c.expiration === activeExpiry)
    .sort((a, b) => a.strike - b.strike);
  const puts = contracts.filter((c) => c.type === "put" && c.expiration === activeExpiry)
    .sort((a, b) => a.strike - b.strike);

  const strikes = Array.from(new Set(calls.map((c) => c.strike))).sort((a, b) => a - b);

  const getCallFor = (strike: number) => calls.find((c) => c.strike === strike);
  const getPutFor = (strike: number) => puts.find((c) => c.strike === strike);

  const maxOI = Math.max(...contracts.map((c) => c.openInterest));

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          {["both", "calls", "puts"].map((t) => (
            <button
              key={t}
              onClick={() => setShowType(t as typeof showType)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                showType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Expiry selector */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {expirations.map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExpiry(exp)}
              className={cn("shrink-0 px-2.5 py-1 text-xs rounded-lg border transition-colors whitespace-nowrap",
                activeExpiry === exp
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:border-border/70"
              )}
            >
              {exp}
            </button>
          ))}
        </div>

        <button
          onClick={() => setHighlightITM(!highlightITM)}
          className={cn("px-2.5 py-1 text-xs rounded-lg border transition-colors",
            highlightITM ? "bg-accent text-foreground border-border" : "text-muted-foreground border-border"
          )}
        >
          ITM Highlight
        </button>

        <div className="ml-auto text-xs text-muted-foreground">
          Underlying: <span className="font-mono font-bold text-foreground">${underlyingPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {showType !== "puts" && (
                <>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Vol</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">OI</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">IV</th>
                  <th className="text-right py-2 px-2 text-bull font-medium">Delta</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Theta</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Bid</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Ask</th>
                  <th className="text-right py-2 px-2 text-bull font-semibold">CALLS</th>
                </>
              )}
              <th className="text-center py-2 px-4 font-bold text-foreground">STRIKE</th>
              {showType !== "calls" && (
                <>
                  <th className="text-left py-2 px-2 text-bear font-semibold">PUTS</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Bid</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Ask</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Theta</th>
                  <th className="text-left py-2 px-2 text-bear font-medium">Delta</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">IV</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">OI</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Vol</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {strikes.map((strike) => {
              const call = getCallFor(strike);
              const put = getPutFor(strike);
              const isATM = Math.abs(strike - underlyingPrice) < underlyingPrice * 0.02;
              const callITM = strike < underlyingPrice;
              const putITM = strike > underlyingPrice;

              return (
                <motion.tr
                  key={strike}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "border-b border-border/30 hover:bg-accent/30 transition-colors cursor-pointer",
                    isATM && "bg-primary/5 border-primary/20"
                  )}
                >
                  {showType !== "puts" && call && (
                    <>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        {formatVolume(call.volume)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        {formatVolume(call.openInterest)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        {(call.impliedVolatility * 100).toFixed(1)}%
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font text-chart-2",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        {formatGreek(call.delta)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font text-bear",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        {formatGreek(call.theta)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        ${call.bid.toFixed(2)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font font-semibold text-bull",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        ${call.ask.toFixed(2)}
                      </td>
                      <td className={cn("text-right py-1.5 px-2 font-mono number-font font-bold text-bull",
                        highlightITM && callITM ? "bg-bull/5" : ""
                      )}>
                        ${call.last.toFixed(2)}
                      </td>
                    </>
                  )}
                  {showType !== "puts" && !call && (
                    <td colSpan={8} />
                  )}

                  {/* Strike column */}
                  <td className={cn("text-center py-1.5 px-4 font-bold font-mono",
                    isATM ? "text-primary bg-primary/10" : "text-foreground"
                  )}>
                    {strike}
                    {isATM && <span className="text-xs text-primary ml-1">ATM</span>}
                  </td>

                  {showType !== "calls" && put && (
                    <>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font font-bold text-bear",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        ${put.last.toFixed(2)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        ${put.bid.toFixed(2)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font font-semibold text-bear",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        ${put.ask.toFixed(2)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font text-bear",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        {formatGreek(put.theta)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font text-chart-2",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        {formatGreek(put.delta)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        {(put.impliedVolatility * 100).toFixed(1)}%
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        {formatVolume(put.openInterest)}
                      </td>
                      <td className={cn("text-left py-1.5 px-2 font-mono number-font",
                        highlightITM && putITM ? "bg-bear/5" : ""
                      )}>
                        {formatVolume(put.volume)}
                      </td>
                    </>
                  )}
                  {showType !== "calls" && !put && (
                    <td colSpan={8} />
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
