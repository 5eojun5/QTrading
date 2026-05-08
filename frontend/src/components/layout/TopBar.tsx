"use client";
import { useState, useEffect } from "react";
import { Search, Bell, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/store/marketStore";
import { formatPercent, formatChange, cn } from "@/lib/utils";
import { MOCK_QUOTES } from "@/lib/mockData";

const TICKER_SYMBOLS = ["SPY", "QQQ", "AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "META", "GOOGL", "AMD"];

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const quotes = useMarketStore((s) => s.quotes);
  const lastUpdate = useMarketStore((s) => s.lastUpdate);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);

  const tickers = TICKER_SYMBOLS.map((sym) => quotes[sym] || MOCK_QUOTES[sym]).filter(Boolean);

  const filteredResults = searchQuery
    ? Object.values(quotes).filter(
        (q) =>
          q.symbol.includes(searchQuery.toUpperCase()) ||
          q.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="h-16 border-b border-border flex items-center px-4 gap-4 bg-card/50 backdrop-blur-sm relative z-20">
      {/* Ticker tape */}
      <div className="flex-1 overflow-hidden ticker-wrapper hidden md:block">
        <div className="ticker-content flex items-center gap-6">
          {[...tickers, ...tickers].map((quote, i) => (
            <button
              key={`${quote.symbol}-${i}`}
              onClick={() => setSelectedSymbol(quote.symbol)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-bold text-foreground">{quote.symbol}</span>
              <span className="text-xs font-mono number-font text-foreground">${quote.price.toFixed(2)}</span>
              <span className={cn("text-xs font-mono number-font", quote.changePercent >= 0 ? "text-bull" : "text-bear")}>
                {formatPercent(quote.changePercent)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-muted-foreground text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block">Search symbol...</span>
          <kbd className="hidden sm:block text-xs bg-background/50 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, ETFs..."
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {filteredResults.length > 0 ? (
                <div className="py-1">
                  {filteredResults.map((q) => (
                    <button
                      key={q.symbol}
                      onClick={() => { setSelectedSymbol(q.symbol); setSearchOpen(false); setSearchQuery(""); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent transition-colors text-left"
                    >
                      <div>
                        <div className="text-sm font-bold">{q.symbol}</div>
                        <div className="text-xs text-muted-foreground">{q.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono number-font">${q.price.toFixed(2)}</div>
                        <div className={cn("text-xs font-mono number-font", q.changePercent >= 0 ? "text-bull" : "text-bear")}>
                          {formatPercent(q.changePercent)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-4 text-center text-sm text-muted-foreground">No results</div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trending</div>
                  {tickers.slice(0, 5).map((q) => (
                    <button
                      key={q.symbol}
                      onClick={() => { setSelectedSymbol(q.symbol); setSearchOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent transition-colors"
                    >
                      <span className="text-sm font-bold">{q.symbol}</span>
                      <span className={cn("text-xs font-mono number-font", q.changePercent >= 0 ? "text-bull" : "text-bear")}>
                        {formatPercent(q.changePercent)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-bear" />
      </button>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
        <span className="hidden sm:block">Live</span>
      </div>

      {/* Close search on outside click */}
      {searchOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
      )}
    </header>
  );
}
