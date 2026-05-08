from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from app.services.market.data_engine import market_data_engine
from app.services.quant.indicators import calculate_all_indicators
from app.services.ai.signal_engine import signal_engine

router = APIRouter(prefix="/signals", tags=["signals"])

WATCHLIST = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "MSFT", "AMD", "META"]


@router.get("/analyze/{symbol}")
async def analyze_symbol(
    symbol: str,
    timeframe: str = Query(default="5m"),
):
    """Analyze a symbol and generate trade signal."""
    sym = symbol.upper()
    quote = await market_data_engine.get_quote(sym)
    bars = await market_data_engine.get_ohlcv(sym, timeframe, 200)
    indicators = calculate_all_indicators([b.model_dump() for b in bars])

    signal = await signal_engine.analyze(sym, quote.price, indicators, timeframe)
    if not signal:
        return {"symbol": sym, "signal": None, "message": "No signal detected"}

    return {"symbol": sym, "signal": signal.model_dump()}


@router.get("/scan")
async def scan_watchlist(
    timeframe: str = Query(default="5m"),
):
    """Scan multiple symbols and return all signals found."""
    results = []
    for sym in WATCHLIST:
        try:
            quote = await market_data_engine.get_quote(sym)
            bars = await market_data_engine.get_ohlcv(sym, timeframe, 200)
            indicators = calculate_all_indicators([b.model_dump() for b in bars])
            signal = await signal_engine.analyze(sym, quote.price, indicators, timeframe)
            if signal:
                results.append(signal.model_dump())
        except Exception:
            pass

    return {"signals": results, "count": len(results)}


@router.get("/strategies")
async def get_strategies():
    """List available trading strategies."""
    return {
        "strategies": [
            {"name": "EMA Crossover", "description": "20/50 EMA crossover with volume confirmation", "timeframes": ["5m", "15m", "1h"]},
            {"name": "RSI Reversal", "description": "Overbought/oversold RSI with momentum confirmation", "timeframes": ["5m", "15m", "1h"]},
            {"name": "VWAP Bounce", "description": "Price bounce off VWAP with volume", "timeframes": ["1m", "5m", "15m"]},
            {"name": "Breakout", "description": "Bollinger Band breakout with high volume", "timeframes": ["15m", "1h", "4h"]},
            {"name": "Momentum", "description": "Strong ADX trending with MACD confirmation", "timeframes": ["5m", "15m", "1h"]},
            {"name": "Gamma Squeeze", "description": "Unusual options activity near key strikes", "timeframes": ["1m", "5m"]},
        ]
    }
