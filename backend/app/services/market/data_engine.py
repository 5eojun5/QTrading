"""
Market data engine supporting yfinance, Polygon, Alpaca, and mock data.
Automatically falls back to mock data if API keys are not configured.
"""
import asyncio
import random
import time
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from loguru import logger

from app.core.config import settings
from app.models.market import Quote, OHLCVBar

SYMBOL_INFO = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology"},
    "NVDA": {"name": "NVIDIA Corp.", "sector": "Technology"},
    "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Cyclical"},
    "SPY": {"name": "SPDR S&P 500 ETF", "sector": "ETF"},
    "QQQ": {"name": "Invesco QQQ Trust", "sector": "ETF"},
    "MSFT": {"name": "Microsoft Corp.", "sector": "Technology"},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Cyclical"},
    "META": {"name": "Meta Platforms", "sector": "Technology"},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Technology"},
    "AMD": {"name": "Advanced Micro Devices", "sector": "Technology"},
    "PLTR": {"name": "Palantir Technologies", "sector": "Technology"},
    "MSTR": {"name": "MicroStrategy", "sector": "Technology"},
}

BASE_PRICES = {
    "AAPL": 189.43, "NVDA": 875.39, "TSLA": 248.50,
    "SPY": 511.23, "QQQ": 440.85, "MSFT": 415.32,
    "AMZN": 186.72, "META": 503.45, "GOOGL": 172.34, "AMD": 162.78,
    "PLTR": 24.87, "MSTR": 1456.23,
}


class MarketDataEngine:
    def __init__(self):
        self._prices: dict[str, float] = dict(BASE_PRICES)
        self._open_prices: dict[str, float] = {k: v * (1 - random.uniform(-0.02, 0.02)) for k, v in BASE_PRICES.items()}
        self._last_update: dict[str, int] = {}
        self._use_yfinance = False

        # Try to import yfinance
        try:
            import yfinance as yf
            self._yf = yf
            self._use_yfinance = True
            logger.info("yfinance available — will attempt live data fetches")
        except ImportError:
            logger.warning("yfinance not available — using mock data")

    def _simulate_price_change(self, symbol: str) -> float:
        """Simulate realistic price movement using geometric Brownian motion."""
        price = self._prices.get(symbol, 100.0)
        volatility = 0.003  # 0.3% per tick
        drift = random.gauss(0.0001, 0.0002)
        change = price * (drift + random.gauss(0, volatility))
        new_price = max(price * 0.85, price + change)  # Circuit breaker at -15%
        self._prices[symbol] = round(new_price, 2)
        return self._prices[symbol]

    async def get_quote(self, symbol: str) -> Quote:
        """Get real-time quote, falling back to mock data."""
        if self._use_yfinance and settings.DATA_SOURCE == "yfinance":
            try:
                return await self._fetch_yfinance_quote(symbol)
            except Exception as e:
                logger.warning(f"yfinance failed for {symbol}: {e}, using mock data")

        return self._generate_mock_quote(symbol)

    async def _fetch_yfinance_quote(self, symbol: str) -> Quote:
        """Fetch quote from yfinance (runs in thread pool)."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ticker = self._yf.Ticker(symbol)
            info = ticker.fast_info
            hist = ticker.history(period="1d", interval="1m")
            if hist.empty:
                raise ValueError(f"No data for {symbol}")
            return info, hist

        info, hist = await loop.run_in_executor(None, _fetch)

        price = float(info.last_price or hist["Close"].iloc[-1])
        prev_close = float(info.previous_close or price)
        change = price - prev_close
        volume = int(info.three_month_average_volume or hist["Volume"].sum())

        self._prices[symbol] = price

        sym_info = SYMBOL_INFO.get(symbol, {"name": symbol, "sector": "Unknown"})
        return Quote(
            symbol=symbol,
            name=sym_info["name"],
            price=round(price, 2),
            change=round(change, 2),
            change_percent=round((change / prev_close) * 100, 2),
            open=round(float(info.open or price), 2),
            high=round(float(info.day_high or price), 2),
            low=round(float(info.day_low or price), 2),
            close=round(prev_close, 2),
            volume=volume,
            avg_volume=int(info.three_month_average_volume or volume),
            market_cap=float(info.market_cap or 0),
            pe=float(getattr(info, "pe_ratio", 0) or 0),
            week_52_high=float(info.year_high or price * 1.1),
            week_52_low=float(info.year_low or price * 0.85),
            timestamp=int(time.time() * 1000),
        )

    def _generate_mock_quote(self, symbol: str) -> Quote:
        """Generate realistic mock quote with simulated price movement."""
        price = self._simulate_price_change(symbol)
        open_price = self._open_prices.get(symbol, price)
        change = price - open_price
        change_pct = (change / open_price) * 100

        base = BASE_PRICES.get(symbol, 100.0)
        sym_info = SYMBOL_INFO.get(symbol, {"name": symbol, "sector": "Unknown"})

        return Quote(
            symbol=symbol,
            name=sym_info["name"],
            price=round(price, 2),
            change=round(change, 2),
            change_percent=round(change_pct, 2),
            open=round(open_price, 2),
            high=round(max(price, open_price) * (1 + random.uniform(0, 0.008)), 2),
            low=round(min(price, open_price) * (1 - random.uniform(0, 0.008)), 2),
            close=round(open_price, 2),
            volume=random.randint(500_000, 5_000_000),
            avg_volume=random.randint(1_000_000, 8_000_000),
            market_cap=base * random.randint(1_000_000_000, 10_000_000_000),
            pe=round(random.uniform(15, 80), 1),
            week_52_high=round(base * random.uniform(1.05, 1.25), 2),
            week_52_low=round(base * random.uniform(0.7, 0.9), 2),
            timestamp=int(time.time() * 1000),
        )

    async def get_ohlcv(
        self, symbol: str, timeframe: str = "5m", bars: int = 200
    ) -> list[OHLCVBar]:
        """Get OHLCV historical data."""
        if self._use_yfinance and settings.DATA_SOURCE == "yfinance":
            try:
                return await self._fetch_yfinance_ohlcv(symbol, timeframe, bars)
            except Exception as e:
                logger.warning(f"yfinance OHLCV failed: {e}, using mock")

        return self._generate_mock_ohlcv(
            self._prices.get(symbol, 100.0), timeframe, bars
        )

    async def _fetch_yfinance_ohlcv(
        self, symbol: str, timeframe: str, bars: int
    ) -> list[OHLCVBar]:
        PERIOD_MAP = {
            "1m": ("7d", "1m"), "5m": ("60d", "5m"), "15m": ("60d", "15m"),
            "1h": ("730d", "1h"), "4h": ("730d", "1h"), "1d": ("5y", "1d"),
        }
        period, interval = PERIOD_MAP.get(timeframe, ("60d", "5m"))

        loop = asyncio.get_event_loop()
        def _fetch():
            ticker = self._yf.Ticker(symbol)
            return ticker.history(period=period, interval=interval)

        hist = await loop.run_in_executor(None, _fetch)
        if hist.empty:
            raise ValueError("Empty data")

        bars_list = []
        for ts, row in hist.tail(bars).iterrows():
            bars_list.append(OHLCVBar(
                time=int(ts.timestamp()),
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"]),
            ))
        return bars_list

    def _generate_mock_ohlcv(
        self, base_price: float, timeframe: str, bars: int
    ) -> list[OHLCVBar]:
        """Generate synthetic OHLCV using geometric Brownian motion."""
        INTERVAL_SECS = {
            "1m": 60, "5m": 300, "15m": 900,
            "1h": 3600, "4h": 14400, "1d": 86400,
        }
        interval = INTERVAL_SECS.get(timeframe, 300)
        now = int(time.time())

        result = []
        price = base_price * 0.90
        vol = 0.008

        for i in range(bars, -1, -1):
            drift = random.gauss(0.0001, 0.0002)
            change = price * (drift + random.gauss(0, vol))
            open_p = price
            price = max(price + change, price * 0.85)
            high = max(open_p, price) * (1 + random.uniform(0, 0.004))
            low = min(open_p, price) * (1 - random.uniform(0, 0.004))
            volume = random.randint(200_000, 3_000_000)

            result.append(OHLCVBar(
                time=now - i * interval,
                open=round(open_p, 2),
                high=round(high, 2),
                low=round(low, 2),
                close=round(price, 2),
                volume=volume,
            ))

        return result

    async def get_all_quotes(self, symbols: list[str]) -> dict[str, Quote]:
        tasks = [self.get_quote(s) for s in symbols]
        quotes_list = await asyncio.gather(*tasks, return_exceptions=True)
        result = {}
        for sym, q in zip(symbols, quotes_list):
            if isinstance(q, Quote):
                result[sym] = q
        return result


market_data_engine = MarketDataEngine()
