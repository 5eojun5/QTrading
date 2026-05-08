"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, TrendingUp, BookOpen, Zap, BarChart2 } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { useMarketStore } from "@/store/marketStore";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Explain NVDA trade setup", prompt: "Analyze NVDA's current chart setup and give me a detailed trading recommendation with entry, stop, and target levels." },
  { icon: BookOpen, label: "Explain options Greeks", prompt: "Explain options Greeks (Delta, Gamma, Theta, Vega, Rho) in simple terms with real examples." },
  { icon: Zap, label: "What is a gamma squeeze?", prompt: "Explain what a gamma squeeze is and give me an example of how it plays out in the market." },
  { icon: BarChart2, label: "Best strategies this week", prompt: "Based on current market conditions (SPY up 0.76%, VIX at 14.2), what options strategies are best positioned for this week?" },
];

const SYSTEM_RESPONSES: Record<string, string> = {
  default: "I'm QTrading AI, your quantitative trading assistant. I can help you analyze stocks, explain options strategies, interpret technical indicators, and identify trading opportunities. What would you like to explore?",
};

function getAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("nvda") || lower.includes("nvidia")) {
    return `**NVDA Technical Analysis**

**Current Setup:** NVDA is showing a **bullish momentum pattern** with strong institutional support.

**Key Levels:**
- 🎯 Entry Zone: $870–$875 (current price $875.39)
- 📈 Target 1: $920 (+5.1%)
- 📈 Target 2: $960 (+9.6%)
- 🛑 Stop Loss: $840 (–4.0%)
- ⚡ Risk/Reward: 2.4x

**Technical Signals:**
- RSI(14): 62.3 — Bullish, room to run
- MACD: Positive crossover confirmed
- EMA20 ($851) and EMA50 ($818) — Price above both ✅
- Volume: 38M (above 42M avg) — Moderate interest

**Options Insight:**
Unusual call sweep on the 900C 5/17 expiry with $2.4M premium suggests smart money is positioning for a breakout above $900.

**Recommendation:** Consider a **bull call spread** (870/920C) for defined risk if you expect continuation. Position sizing: 1–2% of portfolio.`;
  }

  if (lower.includes("greek") || lower.includes("delta") || lower.includes("theta") || lower.includes("gamma")) {
    return `**Options Greeks Explained** 🎓

**Δ Delta (0 to ±1)**
Measures how much the option price moves per $1 move in the underlying.
- Call delta: 0 to +1 (0.50 ATM = $0.50 move per $1 underlying move)
- Put delta: -1 to 0
- *Think of it as:* Probability of finishing in-the-money

**Γ Gamma**
Rate of change of Delta. High gamma near expiration = fast-moving delta.
- Near ATM options have highest gamma
- *Risk:* High gamma means your position can flip quickly

**Θ Theta (Time Decay)**
Daily dollar loss from time passing. The "enemy" of option buyers.
- A theta of -0.05 means you lose $5/contract per day
- *Accelerates* as expiration approaches (especially inside 30 DTE)

**V Vega**
Sensitivity to implied volatility changes.
- High vega = position profits from IV expansion
- Earnings plays are vega bets
- Buy options when IV is low, sell when IV is high

**Ρ Rho**
Sensitivity to interest rate changes. Usually the least important Greek for retail traders.

**Pro Tip:** Focus on Delta for direction, Theta for time risk, and Vega when trading around events.`;
  }

  if (lower.includes("gamma squeeze")) {
    return `**Gamma Squeeze Explained** ⚡

A gamma squeeze happens when **dealers are forced to buy shares** to hedge their short call positions, creating a feedback loop.

**How it Works:**
1. Retail traders buy massive call options OTM
2. Market makers (who sold the calls) are short gamma
3. As the stock rises, dealer delta increases → they must buy shares to stay delta-neutral
4. More buying → stock goes higher → more hedging needed
5. Self-reinforcing loop creates explosive upside moves

**Famous Examples:**
- **GME (Jan 2021):** $20 → $483 in 2 weeks. Massive call OI at the $50-$800 strikes forced endless dealer hedging.
- **AMC (2021):** Similar dynamic with meme stock community concentrating call buying.

**How to Identify a Gamma Squeeze Setup:**
- Very high call OI relative to float at strikes just above current price
- Open interest concentrated at round numbers ($100, $150, $200)
- Rising IV + rising stock price (not diverging)
- High short interest (short squeeze amplifies it)

**QTrading tracks these:** Check our Options Flow alerts for unusual volume-to-OI ratios (>5x) — that's a potential gamma squeeze signal.`;
  }

  if (lower.includes("strateg") || lower.includes("this week") || lower.includes("market condition")) {
    return `**Market Conditions & Strategy Recommendations**

*Current Environment: SPY +0.76%, VIX 14.2 (Low volatility regime)*

**Top Strategies This Week:**

**1. Bull Call Spreads (Moderate Bullish)**
Low IV makes buying options relatively cheap. Spread reduces cost basis.
- Example: SPY 510/520C May expiry
- Max risk: premium paid | Max gain: $10 spread width

**2. Cash-Secured Puts (Income + Entry)**
Sell puts on quality stocks you'd want to own. Collect premium in low-vol environment.
- Example: Sell AAPL 185P for $1.20 credit
- Keep if assigned (cost basis: $183.80), profit if expires worthless

**3. Covered Calls (If You're Long)**
Low VIX = lower premiums, but still worth squeezing yield from existing positions.
- Sell 2–3% OTM calls on NVDA, MSFT holdings

**4. Iron Condors on Indexes (Range-Bound)**
VIX at 14.2 suggests low expected moves. Great for undefined-risk neutral plays.
- SPY 500/505 Put Spread | 515/520 Call Spread
- Collect ~$1.80 credit, max loss: $3.20

**5. Avoid:**
- Long naked puts (low IV = cheap, but market is trending up)
- Far OTM lotto calls (theta kill in low-vol)

**Risk Management:** Keep any single trade under 2% portfolio allocation.`;
  }

  return `**Market Analysis**

Based on current market data and technical signals, here's what I'm seeing:

**Market Context:**
- SPY is showing relative strength, trading above all key moving averages
- Sector rotation toward Technology and Semiconductors continues
- Options put/call ratio at 0.82 — moderately bullish sentiment

**Key Observations for Your Query:**
${prompt.length > 0 ? `
Regarding "${prompt.slice(0, 50)}...":

The current market setup suggests a **cautiously bullish** bias with the following considerations:

1. **Momentum is intact** — Price action remains above key support levels
2. **Options flow** is predominantly bullish with unusual call activity in tech names
3. **Risk management** is critical — always define your maximum loss before entering

Would you like me to deep-dive into any specific aspect? I can analyze:
- Specific stock setups
- Options strategy construction
- Portfolio risk assessment
- Technical indicator interpretation
` : "Please ask me a specific question about trading, options, or market analysis."}`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: SYSTEM_RESPONSES.default,
      timestamp: Date.now() - 60000,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const aiMsg: Message = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: getAIResponse(text),
      timestamp: Date.now(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  function renderContent(content: string) {
    // Simple markdown-like rendering
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-foreground mt-2 mb-1">{line.slice(2, -2)}</p>;
      }
      if (line.match(/^\*\*(.+)\*\*/)) {
        return (
          <p key={i} className="leading-relaxed">
            {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
              part.startsWith("**") ? (
                <strong key={j} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
              ) : part
            )}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <li key={i} className="ml-4 leading-relaxed">{line.slice(2)}</li>;
      }
      if (line.startsWith("#")) {
        return <h3 key={i} className="font-bold text-base mt-2">{line.replace(/^#+\s/, "")}</h3>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="leading-relaxed">{line}</p>;
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">QTrading AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by GPT-4 · Real-time market context · Options expert</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            <span>Connected to market data</span>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground shrink-0">Quick ask:</span>
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-xs whitespace-nowrap transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-3",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "glass rounded-bl-sm text-sm"
              )}>
                {msg.role === "assistant" ? (
                  <div className="space-y-0.5 text-sm text-foreground/90">{renderContent(msg.content)}</div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <div className={cn("text-xs mt-1.5", msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground")}>
                  {timeAgo(msg.timestamp)}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${selectedSymbol}, options strategies, market analysis...`}
              rows={1}
              className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none transition-colors placeholder:text-muted-foreground"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI analysis is for educational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
