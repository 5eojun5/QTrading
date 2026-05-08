import type { StockQuote, OHLCVBar, OptionContract, TradeSignal, MarketMover, OptionsAlert, WatchlistItem } from "@/types/market";
import type { Portfolio, Position, Trade } from "@/types/trading";

export const WATCHLIST_SYMBOLS = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "MSFT", "AMZN", "META", "GOOGL", "AMD"];

export const MOCK_QUOTES: Record<string, StockQuote> = {
  AAPL: { symbol: "AAPL", name: "Apple Inc.", price: 189.43, change: 2.15, changePercent: 1.15, open: 187.28, high: 190.12, low: 186.95, close: 187.28, volume: 52_340_100, avgVolume: 58_000_000, marketCap: 2_940_000_000_000, pe: 31.2, week52High: 199.62, week52Low: 142.92, sector: "Technology", timestamp: Date.now() },
  NVDA: { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.39, change: 23.45, changePercent: 2.75, open: 851.94, high: 880.12, low: 849.77, close: 851.94, volume: 38_120_000, avgVolume: 42_000_000, marketCap: 2_160_000_000_000, pe: 68.4, week52High: 974.00, week52Low: 393.48, sector: "Technology", timestamp: Date.now() },
  TSLA: { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -4.23, changePercent: -1.67, open: 252.73, high: 255.10, low: 247.30, close: 252.73, volume: 94_500_000, avgVolume: 110_000_000, marketCap: 792_000_000_000, pe: 62.1, week52High: 299.29, week52Low: 138.80, sector: "Consumer Cyclical", timestamp: Date.now() },
  SPY: { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 511.23, change: 3.87, changePercent: 0.76, open: 507.36, high: 512.44, low: 506.98, close: 507.36, volume: 72_100_000, avgVolume: 85_000_000, marketCap: 520_000_000_000, pe: 22.8, week52High: 524.61, week52Low: 413.92, sector: "ETF", timestamp: Date.now() },
  QQQ: { symbol: "QQQ", name: "Invesco QQQ Trust", price: 440.85, change: 4.12, changePercent: 0.94, open: 436.73, high: 441.90, low: 435.88, close: 436.73, volume: 34_800_000, avgVolume: 38_000_000, marketCap: 225_000_000_000, pe: 28.9, week52High: 453.16, week52Low: 341.35, sector: "ETF", timestamp: Date.now() },
  MSFT: { symbol: "MSFT", name: "Microsoft Corp.", price: 415.32, change: 1.87, changePercent: 0.45, open: 413.45, high: 416.78, low: 412.33, close: 413.45, volume: 18_200_000, avgVolume: 22_000_000, marketCap: 3_090_000_000_000, pe: 35.1, week52High: 430.82, week52Low: 309.45, sector: "Technology", timestamp: Date.now() },
  AMZN: { symbol: "AMZN", name: "Amazon.com Inc.", price: 186.72, change: 2.34, changePercent: 1.27, open: 184.38, high: 187.45, low: 183.92, close: 184.38, volume: 28_900_000, avgVolume: 35_000_000, marketCap: 1_960_000_000_000, pe: 41.2, week52High: 201.20, week52Low: 101.26, sector: "Consumer Cyclical", timestamp: Date.now() },
  META: { symbol: "META", name: "Meta Platforms", price: 503.45, change: 8.92, changePercent: 1.80, open: 494.53, high: 505.88, low: 493.10, close: 494.53, volume: 14_300_000, avgVolume: 18_000_000, marketCap: 1_280_000_000_000, pe: 26.8, week52High: 531.49, week52Low: 279.40, sector: "Technology", timestamp: Date.now() },
  GOOGL: { symbol: "GOOGL", name: "Alphabet Inc.", price: 172.34, change: -0.87, changePercent: -0.50, open: 173.21, high: 174.55, low: 171.88, close: 173.21, volume: 21_600_000, avgVolume: 28_000_000, marketCap: 2_150_000_000_000, pe: 24.5, week52High: 191.75, week52Low: 115.83, sector: "Technology", timestamp: Date.now() },
  AMD: { symbol: "AMD", name: "Advanced Micro Devices", price: 162.78, change: 4.56, changePercent: 2.88, open: 158.22, high: 163.90, low: 157.45, close: 158.22, volume: 44_700_000, avgVolume: 52_000_000, marketCap: 263_000_000_000, pe: 280.2, week52High: 227.30, week52Low: 93.12, sector: "Technology", timestamp: Date.now() },
};

export function generateOHLCV(basePrice: number, bars = 200, intervalMinutes = 5): OHLCVBar[] {
  const bars_data: OHLCVBar[] = [];
  let price = basePrice * 0.92;
  const now = Math.floor(Date.now() / 1000);
  const interval = intervalMinutes * 60;

  for (let i = bars; i >= 0; i--) {
    const volatility = 0.008;
    const drift = 0.0001;
    const change = price * (Math.random() * volatility * 2 - volatility + drift);
    const open = price;
    price = price + change;
    const high = Math.max(open, price) * (1 + Math.random() * 0.003);
    const low = Math.min(open, price) * (1 - Math.random() * 0.003);
    const volume = Math.floor(500_000 + Math.random() * 2_000_000);

    bars_data.push({
      time: now - i * interval,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume,
    });
  }
  return bars_data;
}

export function generateOptionChain(symbol: string, underlyingPrice: number): OptionContract[] {
  const strikes = [];
  const step = underlyingPrice < 50 ? 1 : underlyingPrice < 200 ? 5 : 10;
  const centerStrike = Math.round(underlyingPrice / step) * step;

  for (let i = -8; i <= 8; i++) {
    strikes.push(centerStrike + i * step);
  }

  const expirations = [7, 14, 21, 30, 45, 60, 90];
  const contracts: OptionContract[] = [];

  strikes.forEach((strike) => {
    expirations.slice(0, 3).forEach((dte) => {
      const expDate = new Date(Date.now() + dte * 86400000);
      const expStr = expDate.toISOString().split("T")[0];
      const moneyness = (underlyingPrice - strike) / underlyingPrice;
      const itm = strike < underlyingPrice;
      const iv = 0.25 + Math.abs(moneyness) * 0.5 + Math.random() * 0.1;
      const t = dte / 365;
      const intrinsic = Math.max(0, underlyingPrice - strike);
      const extrinsic = Math.max(0.05, iv * underlyingPrice * Math.sqrt(t) * 0.4);
      const callPrice = intrinsic + extrinsic;
      const putIntrinsic = Math.max(0, strike - underlyingPrice);
      const putPrice = putIntrinsic + extrinsic;
      const callDelta = itm ? 0.5 + Math.random() * 0.45 : 0.05 + Math.random() * 0.45;
      const gamma = 0.01 + Math.random() * 0.05;
      const theta = -(callPrice * 0.02 + Math.random() * 0.05);
      const vega = callPrice * 0.1 * Math.sqrt(t);
      const vol = Math.floor(100 + Math.random() * 5000);
      const oi = Math.floor(500 + Math.random() * 20000);

      contracts.push({
        contractSymbol: `${symbol}${expStr.replace(/-/g, "")}C${String(strike * 1000).padStart(8, "0")}`,
        strike, expiration: expStr, type: "call",
        bid: parseFloat((callPrice * 0.97).toFixed(2)),
        ask: parseFloat((callPrice * 1.03).toFixed(2)),
        last: parseFloat(callPrice.toFixed(2)),
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        changePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        volume: vol, openInterest: oi,
        impliedVolatility: parseFloat(iv.toFixed(4)),
        delta: parseFloat(callDelta.toFixed(4)),
        gamma: parseFloat(gamma.toFixed(4)),
        theta: parseFloat(theta.toFixed(4)),
        vega: parseFloat(vega.toFixed(4)),
        rho: parseFloat((0.01 * dte / 365).toFixed(4)),
        intrinsicValue: parseFloat(intrinsic.toFixed(2)),
        extrinsicValue: parseFloat(extrinsic.toFixed(2)),
        inTheMoney: itm, daysToExpiration: dte,
      });

      contracts.push({
        contractSymbol: `${symbol}${expStr.replace(/-/g, "")}P${String(strike * 1000).padStart(8, "0")}`,
        strike, expiration: expStr, type: "put",
        bid: parseFloat((putPrice * 0.97).toFixed(2)),
        ask: parseFloat((putPrice * 1.03).toFixed(2)),
        last: parseFloat(putPrice.toFixed(2)),
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        changePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        volume: Math.floor(vol * 0.7), openInterest: Math.floor(oi * 0.8),
        impliedVolatility: parseFloat((iv + 0.02).toFixed(4)),
        delta: parseFloat((-1 + callDelta).toFixed(4)),
        gamma: parseFloat(gamma.toFixed(4)),
        theta: parseFloat(theta.toFixed(4)),
        vega: parseFloat(vega.toFixed(4)),
        rho: parseFloat((-0.01 * dte / 365).toFixed(4)),
        intrinsicValue: parseFloat(putIntrinsic.toFixed(2)),
        extrinsicValue: parseFloat(extrinsic.toFixed(2)),
        inTheMoney: !itm, daysToExpiration: dte,
      });
    });
  });

  return contracts;
}

export function generateSignals(): TradeSignal[] {
  const strategies = ["EMA Crossover", "RSI Reversal", "VWAP Bounce", "Breakout", "Gamma Squeeze", "Momentum"];
  const symbols = ["AAPL", "NVDA", "TSLA", "SPY", "AMD", "META"];
  return symbols.slice(0, 4).map((sym, i) => {
    const quote = MOCK_QUOTES[sym];
    const isBull = Math.random() > 0.4;
    const confidence = 55 + Math.floor(Math.random() * 40);
    return {
      id: `sig_${i}`,
      symbol: sym,
      action: isBull ? "BUY" : "SELL",
      strategy: strategies[i % strategies.length],
      entryPrice: quote.price,
      targetPrice: isBull ? quote.price * (1 + 0.03 + Math.random() * 0.05) : quote.price * (1 - 0.03 - Math.random() * 0.05),
      stopLoss: isBull ? quote.price * (1 - 0.015 - Math.random() * 0.02) : quote.price * (1 + 0.015 + Math.random() * 0.02),
      riskReward: 1.5 + Math.random() * 2.5,
      confidence,
      probability: 45 + Math.floor(Math.random() * 35),
      suggestedSize: Math.floor(1 + Math.random() * 10),
      reasoning: `${sym} showing ${isBull ? "bullish" : "bearish"} momentum with RSI at ${(30 + Math.random() * 40).toFixed(0)}, ${isBull ? "above" : "below"} VWAP.`,
      indicators: { rsi: parseFloat((30 + Math.random() * 40).toFixed(1)), macd: parseFloat((Math.random() * 2 - 1).toFixed(3)) },
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      timeframe: ["1m", "5m", "15m", "1h"][i % 4],
    };
  });
}

export function generatePortfolio(): Portfolio {
  const positions: Position[] = [
    {
      id: "pos_1", symbol: "AAPL", type: "call", side: "long", quantity: 2,
      entryPrice: 4.85, currentPrice: 6.23, targetPrice: 8.00, stopLoss: 3.50,
      unrealizedPnL: 276, unrealizedPnLPercent: 28.45, realizedPnL: 0,
      openedAt: Date.now() - 86400000 * 2,
      strike: 185, expiration: "2025-06-20", delta: 0.65, gamma: 0.04, theta: -0.12, vega: 0.18,
      contractSymbol: "AAPL250620C00185000",
    },
    {
      id: "pos_2", symbol: "NVDA", type: "stock", side: "long", quantity: 10,
      entryPrice: 845.20, currentPrice: 875.39, targetPrice: 950.00, stopLoss: 800.00,
      unrealizedPnL: 301.90, unrealizedPnLPercent: 3.57, realizedPnL: 0,
      openedAt: Date.now() - 86400000 * 5,
    },
    {
      id: "pos_3", symbol: "TSLA", type: "put", side: "long", quantity: 3,
      entryPrice: 3.20, currentPrice: 4.85, targetPrice: 6.50, stopLoss: 2.00,
      unrealizedPnL: 495, unrealizedPnLPercent: 51.56, realizedPnL: 0,
      openedAt: Date.now() - 86400000,
      strike: 255, expiration: "2025-05-17", delta: -0.55, gamma: 0.06, theta: -0.18, vega: 0.15,
      contractSymbol: "TSLA250517P00255000",
    },
  ];

  const investedValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice * (p.type !== "stock" ? 100 : 1), 0);
  const totalPnL = positions.reduce((s, p) => s + p.unrealizedPnL + p.realizedPnL, 0);

  return {
    totalValue: 50000 + totalPnL,
    cashBalance: 50000 - investedValue,
    investedValue,
    totalPnL,
    totalPnLPercent: (totalPnL / 50000) * 100,
    dayPnL: 342.50,
    dayPnLPercent: 0.68,
    positions,
    winRate: 67.3,
    sharpeRatio: 1.84,
    maxDrawdown: -8.2,
    totalTrades: 28,
    winningTrades: 19,
    losingTrades: 9,
    avgWin: 385.20,
    avgLoss: -142.80,
    profitFactor: 2.27,
  };
}

export function generateTrades(): Trade[] {
  return [
    { id: "t1", symbol: "SPY", type: "call", side: "sell", quantity: 2, price: 8.45, total: 1690, pnl: 312, pnlPercent: 22.7, executedAt: Date.now() - 3600000 * 3, strategy: "Momentum" },
    { id: "t2", symbol: "AAPL", type: "stock", side: "buy", quantity: 50, price: 187.20, total: 9360, executedAt: Date.now() - 86400000, strategy: "EMA Crossover" },
    { id: "t3", symbol: "NVDA", type: "call", side: "buy", quantity: 1, price: 24.50, total: 2450, executedAt: Date.now() - 86400000 * 2, strategy: "Breakout" },
    { id: "t4", symbol: "TSLA", type: "put", side: "buy", quantity: 3, price: 3.20, total: 960, executedAt: Date.now() - 86400000 * 3, strategy: "RSI Reversal" },
    { id: "t5", symbol: "AMD", type: "call", side: "sell", quantity: 5, price: 6.80, total: 3400, pnl: -145, pnlPercent: -4.1, executedAt: Date.now() - 86400000 * 4, strategy: "Gamma Squeeze" },
  ];
}

export function generateMarketMovers(): MarketMover[] {
  return [
    { symbol: "PLTR", name: "Palantir Technologies", price: 24.87, change: 4.32, changePercent: 21.0, volume: 128_400_000, type: "gainer" },
    { symbol: "SMCI", name: "Super Micro Computer", price: 88.45, change: 12.15, changePercent: 15.9, volume: 45_200_000, type: "gainer" },
    { symbol: "MSTR", name: "MicroStrategy", price: 1456.23, change: 187.40, changePercent: 14.8, volume: 8_900_000, type: "gainer" },
    { symbol: "GME", name: "GameStop Corp", price: 18.75, change: -3.45, changePercent: -15.5, volume: 89_000_000, type: "loser" },
    { symbol: "BBBY", name: "Bed Bath & Beyond", price: 0.35, change: -0.08, changePercent: -18.6, volume: 234_000_000, type: "loser" },
    { symbol: "RIVN", name: "Rivian Automotive", price: 12.34, change: -1.87, changePercent: -13.1, volume: 67_800_000, type: "loser" },
  ];
}

export function generateOptionsAlerts(): OptionsAlert[] {
  return [
    { id: "oa1", symbol: "NVDA", type: "sweep", contractType: "call", strike: 900, expiration: "2025-05-17", premium: 2_450_000, volume: 15840, openInterest: 8920, volumeOIRatio: 1.77, sentiment: "bullish", timestamp: Date.now() - 300000 },
    { id: "oa2", symbol: "SPY", type: "large_block", contractType: "put", strike: 495, expiration: "2025-06-20", premium: 8_750_000, volume: 5000, openInterest: 45000, volumeOIRatio: 0.11, sentiment: "bearish", timestamp: Date.now() - 600000 },
    { id: "oa3", symbol: "TSLA", type: "unusual_volume", contractType: "call", strike: 270, expiration: "2025-05-10", premium: 890_000, volume: 12400, openInterest: 2100, volumeOIRatio: 5.9, sentiment: "bullish", timestamp: Date.now() - 900000 },
    { id: "oa4", symbol: "AMD", type: "gamma_squeeze", contractType: "call", strike: 165, expiration: "2025-05-10", premium: 1_230_000, volume: 28900, openInterest: 4500, volumeOIRatio: 6.4, sentiment: "bullish", timestamp: Date.now() - 1200000 },
  ];
}
