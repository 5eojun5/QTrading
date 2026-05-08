from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta

from app.services.market.data_engine import market_data_engine
from app.services.quant.black_scholes import calculate_option_chain
from app.services.quant.indicators import calculate_all_indicators

router = APIRouter(prefix="/market", tags=["market"])

WATCHLIST = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "MSFT", "AMZN", "META", "GOOGL", "AMD"]


@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    """Get real-time quote for a symbol."""
    quote = await market_data_engine.get_quote(symbol.upper())
    return quote.model_dump()


@router.get("/quotes")
async def get_quotes(symbols: str = Query(default=",".join(WATCHLIST))):
    """Get quotes for multiple symbols."""
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    quotes = await market_data_engine.get_all_quotes(symbol_list)
    return {sym: q.model_dump() for sym, q in quotes.items()}


@router.get("/ohlcv/{symbol}")
async def get_ohlcv(
    symbol: str,
    timeframe: str = Query(default="5m"),
    bars: int = Query(default=200, ge=10, le=1000),
):
    """Get OHLCV candlestick data."""
    data = await market_data_engine.get_ohlcv(symbol.upper(), timeframe, bars)
    return [bar.model_dump() for bar in data]


@router.get("/indicators/{symbol}")
async def get_indicators(
    symbol: str,
    timeframe: str = Query(default="5m"),
):
    """Get technical indicators for a symbol."""
    bars = await market_data_engine.get_ohlcv(symbol.upper(), timeframe, 200)
    bars_dicts = [b.model_dump() for b in bars]
    indicators = calculate_all_indicators(bars_dicts)
    return {"symbol": symbol.upper(), "timeframe": timeframe, "indicators": indicators}


@router.get("/options/{symbol}")
async def get_options_chain(symbol: str):
    """Get options chain with Black-Scholes Greeks."""
    quote = await market_data_engine.get_quote(symbol.upper())
    S = quote.price

    # Generate strikes around current price
    step = 1 if S < 50 else (5 if S < 200 else 10)
    center = round(S / step) * step
    strikes = [center + i * step for i in range(-8, 9)]

    # Next 3 expirations
    today = datetime.now()
    expirations = []
    dte_targets = [7, 21, 45]
    for dte in dte_targets:
        exp = (today + timedelta(days=dte)).strftime("%Y-%m-%d")
        expirations.append(exp)

    contracts = calculate_option_chain(symbol.upper(), S, strikes, expirations)
    return {
        "symbol": symbol.upper(),
        "underlying_price": S,
        "expirations": expirations,
        "contracts": contracts,
        "timestamp": int(datetime.now().timestamp() * 1000),
    }


@router.get("/movers")
async def get_market_movers():
    """Get top gainers and losers."""
    movers_syms = ["PLTR", "SMCI", "MSTR", "GME", "RIVN", "BBBY"]
    quotes = await market_data_engine.get_all_quotes(movers_syms)

    gainers = sorted(
        [q.model_dump() for q in quotes.values() if q.change_percent > 0],
        key=lambda x: x["change_percent"], reverse=True
    )
    losers = sorted(
        [q.model_dump() for q in quotes.values() if q.change_percent <= 0],
        key=lambda x: x["change_percent"]
    )

    return {"gainers": gainers[:5], "losers": losers[:5]}


@router.get("/watchlist")
async def get_watchlist():
    """Get default watchlist quotes."""
    quotes = await market_data_engine.get_all_quotes(WATCHLIST)
    return [q.model_dump() for q in quotes.values()]
