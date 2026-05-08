"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatPercent, formatVolume } from "@/lib/utils";
import { useMarketStore } from "@/store/marketStore";
import type { StockQuote } from "@/types/market";
import { useEffect, useRef, useState } from "react";

interface QuoteCardProps {
  quote: StockQuote;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function QuoteCard({ quote, onClick, selected, compact }: QuoteCardProps) {
  const prevPrice = useRef(quote.price);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (quote.price !== prevPrice.current) {
      setFlashClass(quote.price > prevPrice.current ? "price-up" : "price-down");
      prevPrice.current = quote.price;
      const t = setTimeout(() => setFlashClass(""), 500);
      return () => clearTimeout(t);
    }
  }, [quote.price]);

  const isPositive = quote.changePercent >= 0;
  const Icon = isPositive ? TrendingUp : quote.changePercent === 0 ? Minus : TrendingDown;

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left",
          selected ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold",
            isPositive ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
          )}>
            {quote.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-bold">{quote.symbol}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[100px]">{quote.name?.split(" ")[0]}</div>
          </div>
        </div>
        <div className={cn("text-right", flashClass)}>
          <div className="text-sm font-mono number-font font-semibold">${quote.price.toFixed(2)}</div>
          <div className={cn("text-xs font-mono number-font", isPositive ? "text-bull" : "text-bear")}>
            {formatPercent(quote.changePercent)}
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-4 cursor-pointer transition-all",
        selected && "border-primary/40 glow-bull",
        flashClass
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold">{quote.symbol}</div>
          <div className="text-xs text-muted-foreground">{quote.name}</div>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
          isPositive ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
        )}>
          <Icon className="w-3 h-3" />
          {formatPercent(quote.changePercent)}
        </div>
      </div>
      <div className={cn("text-2xl font-bold font-mono number-font mb-1", flashClass)}>
        ${quote.price.toFixed(2)}
      </div>
      <div className={cn("text-sm font-mono number-font", isPositive ? "text-bull" : "text-bear")}>
        {isPositive ? "+" : ""}{quote.change.toFixed(2)} today
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>Vol: {formatVolume(quote.volume)}</div>
        <div>Mkt: {formatCurrency(quote.marketCap)}</div>
      </div>
    </motion.div>
  );
}
