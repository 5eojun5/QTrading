# QTrading — Quantitative Options Intelligence Platform

A production-quality, full-stack quantitative options trading dashboard with AI-powered signal analysis. Built for local development and designed to impress.

![QTrading Dashboard](docs/preview.png)

## Features

### Live Market Dashboard
- Real-time stock price simulation (WebSocket streaming)
- Watchlist with live P&L updates
- Market heatmap by sector
- Top gainers / losers
- Options flow alerts (sweeps, gamma squeezes, unusual activity)

### Advanced Charting
- TradingView Lightweight Charts (candlestick)
- Technical indicators: EMA (20/50/200), Bollinger Bands, RSI, MACD, VWAP, ATR, ADX
- Multi-timeframe support: 1m, 5m, 15m, 1h, 4h, 1d
- Indicator panels (RSI, MACD)

### Options Chain Analyzer
- Full options chain with Black-Scholes pricing
- All Greeks: Delta, Gamma, Theta, Vega, Rho
- ITM/OTM highlighting
- Multiple expiration dates
- Unusual options activity tracker

### AI Trade Signal Engine
- Rule-based signal detection (EMA crossover, RSI reversal, VWAP bounce, breakout, momentum)
- OpenAI GPT-4o-mini integration for AI-powered analysis
- Confidence scores, risk/reward ratios, probability estimates
- Entry, target, and stop-loss levels

### Paper Trading System
- Full portfolio management ($50K starting balance)
- Buy/sell stocks and options
- Position PnL tracking with Greeks
- Trade history
- Performance analytics (win rate, Sharpe ratio, profit factor, equity curve)

### Alert System
- Price alerts
- Technical indicator alerts
- Options flow alerts
- AI signal alerts
- Create custom alerts

### AI Chat Assistant
- Built-in trading knowledge base
- OpenAI integration for personalized analysis
- Explains Greeks, strategies, market conditions
- Context-aware responses with live market data

## Tech Stack

### Frontend
- **Next.js 15** (App Router, Turbopack)
- **TypeScript** — full type safety
- **TailwindCSS** — utility-first styling
- **shadcn/ui** — accessible component primitives
- **Framer Motion** — smooth animations
- **TradingView Lightweight Charts** — professional candlestick charts
- **Zustand** — lightweight state management
- **SWR** — data fetching hooks

### Backend
- **Python FastAPI** — high-performance async API
- **WebSockets** — real-time data streaming
- **yfinance** — Yahoo Finance market data
- **Pandas + NumPy** — data processing
- **SciPy** — Black-Scholes option pricing
- **OpenAI SDK** — AI signal generation
- **SQLAlchemy** — async ORM

### Database
- **PostgreSQL 16** — primary database
- **Redis 7** — caching and pub/sub

### Infrastructure
- **Docker + docker-compose** — containerized deployment
- **Environment-based configuration**

## Quick Start (Local Development)

### Prerequisites
- Node.js 22+
- Python 3.12+
- Docker (optional, for database)

### 1. Clone and Setup

```bash
cd QTrading
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to add your API keys (optional)

# Start the API server
python main.py
# Or: uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs
WebSocket: ws://localhost:8000/ws

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

### 4. Database (Optional, with Docker)

```bash
cd docker
docker-compose up postgres redis -d
```

### 5. Full Stack with Docker

```bash
cd docker
docker-compose up --build
```

## API Keys (All Optional)

The app works completely with mock/simulated data out of the box. For live data:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [OpenAI](https://platform.openai.com) | AI signals & chat | Pay per use |
| [Polygon.io](https://polygon.io) | Real-time data | Free tier |
| [Alpaca Markets](https://alpaca.markets) | Paper + live trading | Free |
| [Finnhub](https://finnhub.io) | Market data | Free tier |

Add keys to `backend/.env`:
```
OPENAI_API_KEY=sk-...
POLYGON_API_KEY=...
```

## Project Structure

```
QTrading/
├── frontend/                    # Next.js 15 app
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── dashboard/       # Main dashboard
│       │   ├── charts/          # Advanced charting
│       │   ├── options/         # Options chain
│       │   ├── trading/         # Paper trading portfolio
│       │   ├── alerts/          # Alert center
│       │   ├── assistant/       # AI chat
│       │   └── settings/        # Configuration
│       ├── components/          # Reusable components
│       │   ├── layout/          # Shell, sidebar, topbar
│       │   ├── charts/          # TradingView chart
│       │   ├── market/          # Quote cards, signals, heatmap
│       │   └── options/         # Options chain table
│       ├── hooks/               # React hooks (WebSocket, market data)
│       ├── lib/                 # Utils, mock data
│       ├── store/               # Zustand state
│       └── types/               # TypeScript types
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── api/routes/          # REST endpoints
│   │   ├── core/                # Config, settings
│   │   ├── models/              # Pydantic models
│   │   ├── services/
│   │   │   ├── market/          # Data engine (yfinance, mock)
│   │   │   ├── quant/           # Black-Scholes, indicators
│   │   │   ├── ai/              # Signal engine (OpenAI + rule-based)
│   │   │   └── trading/         # Paper trading engine
│   │   └── ws/                  # WebSocket manager
│   └── main.py                  # FastAPI app + WS streaming
│
├── docker/                      # Docker configs
│   ├── docker-compose.yml
│   └── init.sql                 # PostgreSQL schema
│
└── docs/                        # Architecture documentation
```

## API Endpoints

### Market Data
- `GET /api/v1/market/quote/{symbol}` — Single quote
- `GET /api/v1/market/quotes?symbols=AAPL,NVDA` — Multiple quotes
- `GET /api/v1/market/ohlcv/{symbol}?timeframe=5m` — Candlestick data
- `GET /api/v1/market/options/{symbol}` — Options chain
- `GET /api/v1/market/indicators/{symbol}` — Technical indicators
- `GET /api/v1/market/movers` — Top gainers/losers

### AI Signals
- `GET /api/v1/signals/analyze/{symbol}` — Analyze symbol
- `GET /api/v1/signals/scan` — Scan watchlist for signals
- `GET /api/v1/signals/strategies` — Available strategies

### Paper Trading
- `POST /api/v1/trading/order` — Execute order
- `GET /api/v1/trading/portfolio` — Portfolio summary
- `GET /api/v1/trading/positions` — Open positions
- `GET /api/v1/trading/history` — Trade history
- `DELETE /api/v1/trading/position/{id}` — Close position

### AI Assistant
- `POST /api/v1/ai/chat` — Chat with AI
- `GET /api/v1/ai/sentiment/{symbol}` — Market sentiment

### WebSocket
- `ws://localhost:8000/ws` — Real-time data stream

WebSocket message types:
```json
{ "type": "quote", "symbol": "AAPL", "data": {...} }
{ "type": "signal", "data": {...} }
{ "type": "options_alert", "data": {...} }
{ "type": "heartbeat", "timestamp": 1234567890 }
```

## Performance

- Frontend: < 2s initial load with Turbopack
- WebSocket: ~1.5s update interval (configurable)
- Black-Scholes pricing: < 1ms per contract
- Options chain (50 strikes × 3 expirations): < 50ms

## Security

- API keys stored in environment variables only
- CORS configured for localhost
- WebSocket connections validated
- No secrets in source code

## Quant Logic

### Black-Scholes Model
Full implementation in `backend/app/services/quant/black_scholes.py`:
- European call/put pricing
- All Greeks (Δ, Γ, Θ, V, ρ)
- IV smile (higher IV for OTM options)
- Newton-Raphson implied volatility solver

### Technical Indicators
Implemented in `backend/app/services/quant/indicators.py`:
- RSI (Exponential smoothing)
- MACD (12/26/9)
- EMA (20/50/200)
- Bollinger Bands (20, 2σ)
- VWAP
- ATR (14)
- ADX (14)
- Stochastic (14/3)

### Signal Strategies
Rule-based in `backend/app/services/ai/signal_engine.py`:
1. **EMA Crossover** — 20 EMA crosses 50 EMA with ADX > 20
2. **RSI Reversal** — Extreme RSI + MACD histogram confirmation
3. **VWAP Bounce** — Price near VWAP with volume surge
4. **Breakout** — BB upper band break with 1.5x volume
5. **Momentum** — MACD crossover + ADX trending

## Contributing

This is a portfolio project. Feel free to fork and extend.

## License

MIT License — use freely for learning and portfolio purposes.

---

Built with Next.js 15, FastAPI, and Black-Scholes mathematics.
