export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  week52High: number;
  week52Low: number;
  preMarketPrice?: number;
  preMarketChange?: number;
  afterHoursPrice?: number;
  afterHoursChange?: number;
  timestamp: number;
  sector?: string;
}

export interface OHLCVBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  expiration: string;
  type: "call" | "put";
  bid: number;
  ask: number;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  intrinsicValue: number;
  extrinsicValue: number;
  inTheMoney: boolean;
  daysToExpiration: number;
}

export interface OptionsChain {
  symbol: string;
  underlyingPrice: number;
  expirations: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  timestamp: number;
}

export interface TradeSignal {
  id: string;
  symbol: string;
  action: "BUY" | "SELL" | "HOLD";
  strategy: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  confidence: number;
  probability: number;
  suggestedSize: number;
  reasoning: string;
  indicators: Record<string, number | string>;
  timestamp: number;
  timeframe: string;
  expiry?: string;
  contractType?: "call" | "put";
  strikePrice?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema20: number;
  ema50: number;
  ema200: number;
  bb: { upper: number; middle: number; lower: number };
  vwap: number;
  atr: number;
  adx: number;
  stoch: { k: number; d: number };
  volume: number;
  volumeRatio: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  signals: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  type: "gainer" | "loser" | "active";
}

export interface OptionsAlert {
  id: string;
  symbol: string;
  type: "unusual_volume" | "sweep" | "large_block" | "gamma_squeeze";
  contractType: "call" | "put";
  strike: number;
  expiration: string;
  premium: number;
  volume: number;
  openInterest: number;
  volumeOIRatio: number;
  sentiment: "bullish" | "bearish" | "neutral";
  timestamp: number;
}
