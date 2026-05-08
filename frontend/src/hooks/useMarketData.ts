"use client";
import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store/marketStore";

export function useMarketData() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { refreshData, isConnected } = useMarketStore();

  // Simulate live data updates when WebSocket not connected
  useEffect(() => {
    if (!isConnected) {
      intervalRef.current = setInterval(refreshData, 1500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, refreshData]);
}

export function useQuote(symbol: string) {
  const quote = useMarketStore((s) => s.quotes[symbol]);
  return quote;
}

export function useSelectedQuote() {
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const quote = useMarketStore((s) => s.quotes[selectedSymbol]);
  return { symbol: selectedSymbol, quote };
}

export function useWatchlistQuotes() {
  const watchlist = useMarketStore((s) => s.watchlist);
  const quotes = useMarketStore((s) => s.quotes);
  return watchlist.map((sym) => quotes[sym]).filter(Boolean);
}

export function usePortfolio() {
  return useMarketStore((s) => s.portfolio);
}

export function useSignals() {
  return useMarketStore((s) => s.signals);
}
