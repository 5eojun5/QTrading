export interface Position {
  id: string;
  symbol: string;
  contractSymbol?: string;
  type: "stock" | "call" | "put";
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  openedAt: number;
  strike?: number;
  expiration?: string;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  contractSymbol?: string;
  type: "stock" | "call" | "put";
  side: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  pnl?: number;
  pnlPercent?: number;
  executedAt: number;
  strategy?: string;
  notes?: string;
}

export interface Portfolio {
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  positions: Position[];
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export interface PaperOrder {
  symbol: string;
  contractSymbol?: string;
  type: "stock" | "call" | "put";
  side: "buy" | "sell";
  quantity: number;
  orderType: "market" | "limit" | "stop";
  limitPrice?: number;
  stopPrice?: number;
  strategy?: string;
  notes?: string;
}
