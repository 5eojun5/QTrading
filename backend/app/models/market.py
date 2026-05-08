from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class Quote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    close: float
    volume: int
    avg_volume: int
    market_cap: float
    pe: float
    week_52_high: float
    week_52_low: float
    pre_market_price: Optional[float] = None
    after_hours_price: Optional[float] = None
    timestamp: int


class OHLCVBar(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: int


class OptionContract(BaseModel):
    contract_symbol: str
    strike: float
    expiration: str
    type: Literal["call", "put"]
    bid: float
    ask: float
    last: float
    change: float
    change_percent: float
    volume: int
    open_interest: int
    implied_volatility: float
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float
    intrinsic_value: float
    extrinsic_value: float
    in_the_money: bool
    days_to_expiration: int


class TradeSignal(BaseModel):
    id: str
    symbol: str
    action: Literal["BUY", "SELL", "HOLD"]
    strategy: str
    entry_price: float
    target_price: float
    stop_loss: float
    risk_reward: float
    confidence: int
    probability: int
    suggested_size: int
    reasoning: str
    indicators: dict
    timestamp: int
    timeframe: str
    contract_type: Optional[Literal["call", "put"]] = None
    strike_price: Optional[float] = None
    expiry: Optional[str] = None


class TechnicalIndicators(BaseModel):
    rsi: float
    macd_value: float
    macd_signal: float
    macd_histogram: float
    ema_20: float
    ema_50: float
    ema_200: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    vwap: float
    atr: float
    adx: float
    stoch_k: float
    stoch_d: float
    volume: int
    volume_ratio: float
