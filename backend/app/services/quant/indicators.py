"""
Technical indicator calculations using pandas + numpy.
Supports RSI, MACD, EMA, VWAP, Bollinger Bands, ATR, ADX, Stochastic.
"""
import numpy as np
import pandas as pd
from typing import Optional


def calculate_rsi(closes: pd.Series, period: int = 14) -> pd.Series:
    """Calculate Relative Strength Index."""
    delta = closes.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()

    rs = avg_gain / avg_loss.where(avg_loss != 0, 1e-10)
    return 100 - (100 / (1 + rs))


def calculate_macd(
    closes: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> pd.DataFrame:
    """Calculate MACD, Signal line, and Histogram."""
    ema_fast = closes.ewm(span=fast, adjust=False).mean()
    ema_slow = closes.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return pd.DataFrame({
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram,
    })


def calculate_ema(closes: pd.Series, period: int) -> pd.Series:
    """Calculate Exponential Moving Average."""
    return closes.ewm(span=period, adjust=False).mean()


def calculate_sma(closes: pd.Series, period: int) -> pd.Series:
    """Calculate Simple Moving Average."""
    return closes.rolling(window=period).mean()


def calculate_bollinger_bands(
    closes: pd.Series, period: int = 20, std_dev: float = 2.0
) -> pd.DataFrame:
    """Calculate Bollinger Bands."""
    middle = closes.rolling(window=period).mean()
    std = closes.rolling(window=period).std()
    upper = middle + std_dev * std
    lower = middle - std_dev * std

    return pd.DataFrame({
        "upper": upper,
        "middle": middle,
        "lower": lower,
    })


def calculate_vwap(df: pd.DataFrame) -> pd.Series:
    """Calculate Volume Weighted Average Price."""
    typical_price = (df["high"] + df["low"] + df["close"]) / 3
    cumulative_tp_vol = (typical_price * df["volume"]).cumsum()
    cumulative_vol = df["volume"].cumsum()
    return cumulative_tp_vol / cumulative_vol.where(cumulative_vol != 0, 1)


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculate Average True Range."""
    high = df["high"]
    low = df["low"]
    close = df["close"]
    prev_close = close.shift(1)

    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low - prev_close).abs(),
    ], axis=1).max(axis=1)

    return tr.ewm(com=period - 1, min_periods=period).mean()


def calculate_adx(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculate Average Directional Index."""
    high = df["high"]
    low = df["low"]
    close = df["close"]

    plus_dm = high.diff()
    minus_dm = -low.diff()

    plus_dm = plus_dm.where((plus_dm > minus_dm) & (plus_dm > 0), 0.0)
    minus_dm = minus_dm.where((minus_dm > plus_dm) & (minus_dm > 0), 0.0)

    atr = calculate_atr(df, period)
    plus_di = 100 * (plus_dm.ewm(com=period-1, min_periods=period).mean() / atr.where(atr != 0, 1))
    minus_di = 100 * (minus_dm.ewm(com=period-1, min_periods=period).mean() / atr.where(atr != 0, 1))

    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di).where((plus_di + minus_di) != 0, 1)
    adx = dx.ewm(com=period-1, min_periods=period).mean()

    return adx


def calculate_stochastic(
    df: pd.DataFrame, k_period: int = 14, d_period: int = 3
) -> pd.DataFrame:
    """Calculate Stochastic Oscillator %K and %D."""
    lowest_low = df["low"].rolling(window=k_period).min()
    highest_high = df["high"].rolling(window=k_period).max()

    k = 100 * (df["close"] - lowest_low) / (highest_high - lowest_low).where(
        (highest_high - lowest_low) != 0, 1
    )
    d = k.rolling(window=d_period).mean()

    return pd.DataFrame({"k": k, "d": d})


def calculate_all_indicators(bars: list[dict]) -> dict:
    """Calculate all technical indicators from OHLCV bars."""
    if len(bars) < 50:
        return {}

    df = pd.DataFrame(bars)
    df.columns = [c.lower() for c in df.columns]

    closes = df["close"]
    rsi = calculate_rsi(closes)
    macd = calculate_macd(closes)
    ema_20 = calculate_ema(closes, 20)
    ema_50 = calculate_ema(closes, 50)
    ema_200 = calculate_ema(closes, 200)
    bb = calculate_bollinger_bands(closes)
    vwap = calculate_vwap(df)
    atr = calculate_atr(df)
    adx = calculate_adx(df)
    stoch = calculate_stochastic(df)

    # Latest values
    i = -1
    return {
        "rsi": round(float(rsi.iloc[i] if not pd.isna(rsi.iloc[i]) else 50), 2),
        "macd_value": round(float(macd["macd"].iloc[i] if not pd.isna(macd["macd"].iloc[i]) else 0), 4),
        "macd_signal": round(float(macd["signal"].iloc[i] if not pd.isna(macd["signal"].iloc[i]) else 0), 4),
        "macd_histogram": round(float(macd["histogram"].iloc[i] if not pd.isna(macd["histogram"].iloc[i]) else 0), 4),
        "ema_20": round(float(ema_20.iloc[i] if not pd.isna(ema_20.iloc[i]) else closes.iloc[i]), 2),
        "ema_50": round(float(ema_50.iloc[i] if not pd.isna(ema_50.iloc[i]) else closes.iloc[i]), 2),
        "ema_200": round(float(ema_200.iloc[i] if not pd.isna(ema_200.iloc[i]) else closes.iloc[i]), 2),
        "bb_upper": round(float(bb["upper"].iloc[i] if not pd.isna(bb["upper"].iloc[i]) else closes.iloc[i] * 1.02), 2),
        "bb_middle": round(float(bb["middle"].iloc[i] if not pd.isna(bb["middle"].iloc[i]) else closes.iloc[i]), 2),
        "bb_lower": round(float(bb["lower"].iloc[i] if not pd.isna(bb["lower"].iloc[i]) else closes.iloc[i] * 0.98), 2),
        "vwap": round(float(vwap.iloc[i] if not pd.isna(vwap.iloc[i]) else closes.iloc[i]), 2),
        "atr": round(float(atr.iloc[i] if not pd.isna(atr.iloc[i]) else 0), 4),
        "adx": round(float(adx.iloc[i] if not pd.isna(adx.iloc[i]) else 25), 2),
        "stoch_k": round(float(stoch["k"].iloc[i] if not pd.isna(stoch["k"].iloc[i]) else 50), 2),
        "stoch_d": round(float(stoch["d"].iloc[i] if not pd.isna(stoch["d"].iloc[i]) else 50), 2),
        "volume": int(df["volume"].iloc[i]),
        "volume_ratio": round(float(df["volume"].iloc[i]) / float(df["volume"].rolling(20).mean().iloc[i]) if not pd.isna(df["volume"].rolling(20).mean().iloc[i]) else 1.0, 2),
    }
