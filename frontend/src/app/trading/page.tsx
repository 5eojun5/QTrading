"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/store/marketStore";
import { cn, formatCurrency, formatPercent, formatNumber, timeAgo } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Activity, PlusCircle, X, Clock } from "lucide-react";
import { generateTrades } from "@/lib/mockData";
import toast from "react-hot-toast";

const trades = generateTrades();

export default function TradingPage() {
  const portfolio = useMarketStore((s) => s.portfolio);
  const quotes = useMarketStore((s) => s.quotes);
  const [activeTab, setActiveTab] = useState<"positions" | "history" | "performance">("positions");
  const [orderSymbol, setOrderSymbol] = useState("AAPL");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderQty, setOrderQty] = useState("1");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  const quote = quotes[orderSymbol];

  const submitOrder = () => {
    toast.success(`${orderSide.toUpperCase()} ${orderQty}x ${orderSymbol} order submitted`);
    setShowOrderPanel(false);
  };

  const equityCurve = Array.from({ length: 30 }, (_, i) => {
    const base = 45000;
    const trend = i * 170;
    const noise = (Math.random() - 0.4) * 800;
    return base + trend + noise;
  });
  const maxEq = Math.max(...equityCurve);
  const minEq = Math.min(...equityCurve);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Paper Trading Portfolio
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOrderPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              New Order
            </motion.button>
          </div>
        </div>

        {/* Portfolio summary cards */}
        <div className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-border">
          {[
            { label: "Total Value", value: formatCurrency(portfolio.totalValue), change: portfolio.dayPnLPercent, icon: Wallet },
            { label: "Total P&L", value: formatCurrency(portfolio.totalPnL), change: portfolio.totalPnLPercent, positive: portfolio.totalPnL >= 0, icon: TrendingUp },
            { label: "Cash Balance", value: formatCurrency(portfolio.cashBalance), icon: Activity },
            { label: "Invested", value: formatCurrency(portfolio.investedValue), icon: BarChart3 },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold font-mono number-font">{card.value}</div>
              {card.change !== undefined && (
                <div className={cn("text-xs font-mono mt-1", card.positive !== false ? "text-bull" : "text-bear")}>
                  {formatPercent(card.change)} today
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-5 gap-3 px-5 py-3 border-b border-border">
          {[
            { label: "Win Rate", value: `${portfolio.winRate}%`, color: "text-bull" },
            { label: "Sharpe", value: portfolio.sharpeRatio.toFixed(2), color: "text-chart-2" },
            { label: "Max DD", value: `${portfolio.maxDrawdown}%`, color: "text-bear" },
            { label: "Profit Factor", value: portfolio.profitFactor.toFixed(2), color: "text-warning" },
            { label: "Avg Win/Loss", value: `${(portfolio.avgWin / Math.abs(portfolio.avgLoss)).toFixed(1)}x`, color: "text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className={cn("text-lg font-bold font-mono number-font", color)}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-2 border-b border-border">
          {["positions", "history", "performance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn("px-4 py-1.5 text-sm rounded-lg capitalize transition-colors",
                activeTab === tab ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {activeTab === "positions" && (
              <motion.div key="positions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left pb-2 font-medium">Symbol</th>
                      <th className="text-left pb-2 font-medium">Type</th>
                      <th className="text-right pb-2 font-medium">Qty</th>
                      <th className="text-right pb-2 font-medium">Entry</th>
                      <th className="text-right pb-2 font-medium">Current</th>
                      <th className="text-right pb-2 font-medium">Target</th>
                      <th className="text-right pb-2 font-medium">Stop</th>
                      <th className="text-right pb-2 font-medium">Unr. P&L</th>
                      <th className="text-right pb-2 font-medium">Greeks</th>
                      <th className="text-right pb-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {portfolio.positions.map((pos) => (
                      <motion.tr
                        key={pos.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 font-bold">{pos.symbol}</td>
                        <td className="py-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium",
                            pos.type === "call" ? "bg-bull/15 text-bull" :
                            pos.type === "put" ? "bg-bear/15 text-bear" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {pos.type.toUpperCase()}
                            {pos.strike && ` $${pos.strike}`}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">{pos.quantity}</td>
                        <td className="py-3 text-right font-mono number-font">${pos.entryPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono number-font font-bold">${pos.currentPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono number-font text-bull">${pos.targetPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono number-font text-bear">${pos.stopLoss.toFixed(2)}</td>
                        <td className={cn("py-3 text-right font-mono font-bold number-font",
                          pos.unrealizedPnL >= 0 ? "text-bull" : "text-bear"
                        )}>
                          {pos.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(pos.unrealizedPnL)}
                          <span className="text-xs ml-1">({formatPercent(pos.unrealizedPnLPercent)})</span>
                        </td>
                        <td className="py-3 text-right text-xs font-mono text-muted-foreground">
                          {pos.delta && `Δ${pos.delta.toFixed(2)} θ${pos.theta?.toFixed(2)}`}
                        </td>
                        <td className="py-3 text-right">
                          <button className="px-2 py-1 text-xs bg-bear/15 text-bear border border-bear/20 rounded-md hover:bg-bear/25 transition-colors">
                            Close
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left pb-2 font-medium">Time</th>
                      <th className="text-left pb-2 font-medium">Symbol</th>
                      <th className="text-left pb-2 font-medium">Side</th>
                      <th className="text-right pb-2 font-medium">Qty</th>
                      <th className="text-right pb-2 font-medium">Price</th>
                      <th className="text-right pb-2 font-medium">Total</th>
                      <th className="text-right pb-2 font-medium">P&L</th>
                      <th className="text-left pb-2 font-medium">Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-border/30 hover:bg-accent/30">
                        <td className="py-3 text-xs text-muted-foreground">{timeAgo(trade.executedAt)}</td>
                        <td className="py-3 font-bold">{trade.symbol}</td>
                        <td className="py-3">
                          <span className={cn("px-2 py-0.5 text-xs rounded font-medium",
                            trade.side === "buy" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                          )}>
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">{trade.quantity}</td>
                        <td className="py-3 text-right font-mono number-font">${trade.price.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono number-font">{formatCurrency(trade.total)}</td>
                        <td className={cn("py-3 text-right font-mono number-font font-bold",
                          trade.pnl === undefined ? "text-muted-foreground" :
                          trade.pnl >= 0 ? "text-bull" : "text-bear"
                        )}>
                          {trade.pnl !== undefined ? `${trade.pnl >= 0 ? "+" : ""}${formatCurrency(trade.pnl)}` : "Open"}
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{trade.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === "performance" && (
              <motion.div key="perf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-6"
              >
                {/* Equity curve */}
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Equity Curve</h3>
                  <svg viewBox={`0 0 300 80`} className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C853" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#00C853" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${equityCurve.map((v, i) => `${(i / 29) * 300},${80 - ((v - minEq) / (maxEq - minEq)) * 70}`).join(" L ")}`}
                      fill="none" stroke="#00C853" strokeWidth="2"
                    />
                    <path
                      d={`M 0,80 L ${equityCurve.map((v, i) => `${(i / 29) * 300},${80 - ((v - minEq) / (maxEq - minEq)) * 70}`).join(" L ")} L 300,80 Z`}
                      fill="url(#eq-grad)"
                    />
                  </svg>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatCurrency(minEq)}</span>
                    <span className="text-bull font-bold">{formatCurrency(equityCurve[equityCurve.length - 1])}</span>
                  </div>
                </div>

                {/* Win/Loss breakdown */}
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Win/Loss Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Total Trades", value: portfolio.totalTrades },
                      { label: "Winning", value: portfolio.winningTrades, color: "text-bull" },
                      { label: "Losing", value: portfolio.losingTrades, color: "text-bear" },
                      { label: "Avg Win", value: formatCurrency(portfolio.avgWin), color: "text-bull" },
                      { label: "Avg Loss", value: formatCurrency(portfolio.avgLoss), color: "text-bear" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={cn("font-mono font-bold number-font", color)}>{value}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-bear/30 rounded-full overflow-hidden">
                          <div className="h-full bg-bull rounded-full" style={{ width: `${portfolio.winRate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-bull">{portfolio.winRate}% Win Rate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order panel */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="w-80 shrink-0 border-l border-border bg-card flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-bold">New Order</h2>
              <button onClick={() => setShowOrderPanel(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-4">
              {/* Symbol */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Symbol</label>
                <input
                  value={orderSymbol}
                  onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                />
              </div>
              {/* Side */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Side</label>
                <div className="grid grid-cols-2 gap-2">
                  {["buy", "sell"].map((side) => (
                    <button
                      key={side}
                      onClick={() => setOrderSide(side as typeof orderSide)}
                      className={cn("py-2 rounded-lg text-sm font-bold capitalize transition-colors",
                        orderSide === side
                          ? side === "buy" ? "bg-bull text-white" : "bg-bear text-white"
                          : "bg-accent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>
              {/* Qty */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                <input
                  type="number"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  min="1"
                  className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {/* Order type */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["market", "limit"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t as typeof orderType)}
                      className={cn("py-2 rounded-lg text-sm capitalize transition-colors",
                        orderType === t ? "bg-primary/15 text-primary border border-primary/30" : "bg-accent text-muted-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Limit Price</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={quote?.price.toFixed(2)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}
              {/* Order summary */}
              {quote && (
                <div className="glass rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Price</span>
                    <span className="font-mono font-bold">${quote.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Total</span>
                    <span className="font-mono font-bold">{formatCurrency(quote.price * parseInt(orderQty || "0"))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Cash</span>
                    <span className="font-mono font-bold text-primary">{formatCurrency(portfolio.cashBalance)}</span>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitOrder}
                className={cn("w-full py-3 rounded-xl font-bold text-sm transition-colors",
                  orderSide === "buy"
                    ? "bg-bull text-white hover:bg-bull/90"
                    : "bg-bear text-white hover:bg-bear/90"
                )}
              >
                {orderSide === "buy" ? "Buy" : "Sell"} {orderSymbol}
              </motion.button>
              <p className="text-xs text-center text-muted-foreground">Paper trading — no real money involved</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="4" width="4" height="17" rx="1"/>
    </svg>
  );
}
