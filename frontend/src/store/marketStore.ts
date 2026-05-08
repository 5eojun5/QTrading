import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { StockQuote, OHLCVBar, TradeSignal, OptionsAlert, WatchlistItem } from "@/types/market";
import type { Portfolio, Trade } from "@/types/trading";
import { MOCK_QUOTES, generateOHLCV, generateSignals, generatePortfolio, generateTrades, generateOptionsAlerts } from "@/lib/mockData";

interface MarketState {
  quotes: Record<string, StockQuote>;
  selectedSymbol: string;
  chartData: OHLCVBar[];
  chartTimeframe: string;
  signals: TradeSignal[];
  portfolio: Portfolio;
  trades: Trade[];
  optionsAlerts: OptionsAlert[];
  watchlist: string[];
  isConnected: boolean;
  isMarketOpen: boolean;
  lastUpdate: number;

  setSelectedSymbol: (symbol: string) => void;
  setChartTimeframe: (timeframe: string) => void;
  updateQuote: (symbol: string, quote: Partial<StockQuote>) => void;
  addSignal: (signal: TradeSignal) => void;
  setWatchlist: (symbols: string[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setConnected: (connected: boolean) => void;
  refreshData: () => void;
}

export const useMarketStore = create<MarketState>()(
  subscribeWithSelector((set, get) => ({
    quotes: MOCK_QUOTES,
    selectedSymbol: "AAPL",
    chartData: generateOHLCV(189.43),
    chartTimeframe: "5m",
    signals: generateSignals(),
    portfolio: generatePortfolio(),
    trades: generateTrades(),
    optionsAlerts: generateOptionsAlerts(),
    watchlist: ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "AMD"],
    isConnected: false,
    isMarketOpen: true,
    lastUpdate: Date.now(),

    setSelectedSymbol: (symbol) => {
      const quote = get().quotes[symbol];
      set({
        selectedSymbol: symbol,
        chartData: generateOHLCV(quote?.price || 100),
      });
    },

    setChartTimeframe: (timeframe) => {
      const { selectedSymbol, quotes } = get();
      const quote = quotes[selectedSymbol];
      const barCounts: Record<string, number> = { "1m": 390, "5m": 200, "15m": 100, "1h": 60, "4h": 30, "1d": 200 };
      const intervalMins: Record<string, number> = { "1m": 1, "5m": 5, "15m": 15, "1h": 60, "4h": 240, "1d": 1440 };
      set({
        chartTimeframe: timeframe,
        chartData: generateOHLCV(quote?.price || 100, barCounts[timeframe] || 200, intervalMins[timeframe] || 5),
      });
    },

    updateQuote: (symbol, partial) => {
      set((state) => ({
        quotes: {
          ...state.quotes,
          [symbol]: { ...state.quotes[symbol], ...partial, timestamp: Date.now() },
        },
        lastUpdate: Date.now(),
      }));
    },

    addSignal: (signal) => {
      set((state) => ({
        signals: [signal, ...state.signals.slice(0, 19)],
      }));
    },

    setWatchlist: (symbols) => set({ watchlist: symbols }),

    addToWatchlist: (symbol) => {
      set((state) => ({
        watchlist: state.watchlist.includes(symbol) ? state.watchlist : [...state.watchlist, symbol],
      }));
    },

    removeFromWatchlist: (symbol) => {
      set((state) => ({
        watchlist: state.watchlist.filter((s) => s !== symbol),
      }));
    },

    setConnected: (connected) => set({ isConnected: connected }),

    refreshData: () => {
      const { quotes, signals } = get();
      const updatedQuotes = { ...quotes };
      Object.keys(updatedQuotes).forEach((sym) => {
        const q = updatedQuotes[sym];
        const change = q.price * (Math.random() * 0.004 - 0.002);
        const newPrice = parseFloat((q.price + change).toFixed(2));
        updatedQuotes[sym] = {
          ...q,
          price: newPrice,
          change: parseFloat((q.change + change).toFixed(2)),
          changePercent: parseFloat(((q.change + change) / q.open * 100).toFixed(2)),
          timestamp: Date.now(),
        };
      });
      set({ quotes: updatedQuotes, lastUpdate: Date.now() });
    },
  }))
);
