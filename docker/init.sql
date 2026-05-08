-- QTrading Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    contract_symbol VARCHAR(50),
    type VARCHAR(10) NOT NULL CHECK (type IN ('stock', 'call', 'put')),
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity INTEGER NOT NULL,
    price NUMERIC(12, 4) NOT NULL,
    total NUMERIC(14, 2) NOT NULL,
    pnl NUMERIC(14, 2),
    pnl_percent NUMERIC(8, 4),
    strategy VARCHAR(100),
    notes TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    contract_symbol VARCHAR(50),
    type VARCHAR(10) NOT NULL CHECK (type IN ('stock', 'call', 'put')),
    side VARCHAR(5) NOT NULL CHECK (side IN ('long', 'short')),
    quantity INTEGER NOT NULL,
    entry_price NUMERIC(12, 4) NOT NULL,
    current_price NUMERIC(12, 4),
    target_price NUMERIC(12, 4),
    stop_loss NUMERIC(12, 4),
    unrealized_pnl NUMERIC(14, 2) DEFAULT 0,
    realized_pnl NUMERIC(14, 2) DEFAULT 0,
    strike NUMERIC(10, 2),
    expiration DATE,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    is_open BOOLEAN DEFAULT TRUE
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    action VARCHAR(4) NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
    strategy VARCHAR(100) NOT NULL,
    entry_price NUMERIC(12, 4) NOT NULL,
    target_price NUMERIC(12, 4) NOT NULL,
    stop_loss NUMERIC(12, 4) NOT NULL,
    risk_reward NUMERIC(6, 2),
    confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),
    timeframe VARCHAR(10),
    reasoning TEXT,
    indicators JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    condition VARCHAR(20),
    value NUMERIC(14, 4),
    message TEXT,
    triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_value NUMERIC(14, 2) NOT NULL,
    cash_balance NUMERIC(14, 2) NOT NULL,
    invested_value NUMERIC(14, 2) NOT NULL,
    total_pnl NUMERIC(14, 2) NOT NULL,
    day_pnl NUMERIC(14, 2),
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_executed_at ON trades(executed_at DESC);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_positions_is_open ON positions(is_open);
CREATE INDEX idx_signals_symbol ON signals(symbol);
CREATE INDEX idx_signals_generated_at ON signals(generated_at DESC);
CREATE INDEX idx_portfolio_snapshots_at ON portfolio_snapshots(snapshot_at DESC);
