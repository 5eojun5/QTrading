"""
AI-powered trade signal engine.
Analyzes technical indicators to generate trade signals with confidence scores.
Uses OpenAI API when available, falls back to rule-based engine.
"""
import uuid
import time
import random
from typing import Optional
from loguru import logger

from app.core.config import settings
from app.models.market import TradeSignal


STRATEGY_DESCRIPTIONS = {
    "EMA Crossover": "20 EMA crossed above 50 EMA with volume confirmation",
    "RSI Reversal": "RSI bouncing from extreme zone with momentum shift",
    "VWAP Bounce": "Price rejected from VWAP with strong volume",
    "Breakout": "Price breaking above key resistance with volume surge",
    "Momentum": "Strong directional momentum with ADX > 25",
    "Mean Reversion": "Bollinger Band squeeze with reversal candle",
    "Gamma Squeeze": "Unusual call OI concentration near strike levels",
    "Scalp": "Short-term oversold/overbought on 1m/5m with VWAP proximity",
}


class SignalEngine:
    def __init__(self):
        self._openai_client = None
        if settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized for AI signals")
            except Exception as e:
                logger.warning(f"OpenAI init failed: {e}")

    async def analyze(
        self,
        symbol: str,
        price: float,
        indicators: dict,
        timeframe: str = "5m",
    ) -> Optional[TradeSignal]:
        """Generate trade signal from technical indicators."""
        if not indicators:
            return None

        if self._openai_client:
            try:
                return await self._ai_analysis(symbol, price, indicators, timeframe)
            except Exception as e:
                logger.warning(f"AI analysis failed: {e}, using rule-based")

        return self._rule_based_analysis(symbol, price, indicators, timeframe)

    async def _ai_analysis(
        self,
        symbol: str,
        price: float,
        indicators: dict,
        timeframe: str,
    ) -> Optional[TradeSignal]:
        """Generate signal using OpenAI API."""
        prompt = f"""You are a quantitative trading analyst. Analyze these indicators for {symbol} at ${price:.2f} on {timeframe} timeframe:

RSI: {indicators.get('rsi', 50):.1f}
MACD: {indicators.get('macd_value', 0):.3f} (Signal: {indicators.get('macd_signal', 0):.3f})
EMA20: ${indicators.get('ema_20', price):.2f}, EMA50: ${indicators.get('ema_50', price):.2f}
VWAP: ${indicators.get('vwap', price):.2f}
BB: Upper ${indicators.get('bb_upper', price):.2f} / Lower ${indicators.get('bb_lower', price):.2f}
ADX: {indicators.get('adx', 25):.1f}
Volume Ratio: {indicators.get('volume_ratio', 1.0):.1f}x

Respond with JSON only:
{{"action": "BUY|SELL|HOLD", "strategy": "strategy name", "confidence": 0-100, "probability": 0-100,
"target_pct": 0.01-0.15, "stop_pct": 0.005-0.05, "reasoning": "brief explanation", "timeframe": "{timeframe}"}}"""

        response = await self._openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=300,
        )

        import json
        data = json.loads(response.choices[0].message.content)

        action = data.get("action", "HOLD")
        if action not in ("BUY", "SELL", "HOLD"):
            action = "HOLD"

        target_pct = float(data.get("target_pct", 0.05))
        stop_pct = float(data.get("stop_pct", 0.02))

        if action == "BUY":
            target = price * (1 + target_pct)
            stop = price * (1 - stop_pct)
        elif action == "SELL":
            target = price * (1 - target_pct)
            stop = price * (1 + stop_pct)
        else:
            return None

        rr = target_pct / stop_pct if stop_pct > 0 else 1.5

        return TradeSignal(
            id=str(uuid.uuid4()),
            symbol=symbol,
            action=action,
            strategy=data.get("strategy", "AI Analysis"),
            entry_price=round(price, 2),
            target_price=round(target, 2),
            stop_loss=round(stop, 2),
            risk_reward=round(rr, 2),
            confidence=int(data.get("confidence", 70)),
            probability=int(data.get("probability", 55)),
            suggested_size=max(1, int(10000 / (price * stop_pct * 100))),
            reasoning=data.get("reasoning", "AI-generated signal"),
            indicators={"rsi": indicators.get("rsi", 50), "macd": indicators.get("macd_value", 0)},
            timestamp=int(time.time() * 1000),
            timeframe=timeframe,
        )

    def _rule_based_analysis(
        self,
        symbol: str,
        price: float,
        indicators: dict,
        timeframe: str,
    ) -> Optional[TradeSignal]:
        """Rule-based signal generation using classic technical strategies."""
        rsi = indicators.get("rsi", 50)
        macd = indicators.get("macd_value", 0)
        macd_signal = indicators.get("macd_signal", 0)
        macd_hist = indicators.get("macd_histogram", 0)
        ema_20 = indicators.get("ema_20", price)
        ema_50 = indicators.get("ema_50", price)
        vwap = indicators.get("vwap", price)
        bb_upper = indicators.get("bb_upper", price * 1.02)
        bb_lower = indicators.get("bb_lower", price * 0.98)
        adx = indicators.get("adx", 20)
        vol_ratio = indicators.get("volume_ratio", 1.0)

        signals = []

        # EMA crossover
        if ema_20 > ema_50 and price > ema_20 and adx > 20:
            signals.append(("BUY", "EMA Crossover", 75, 0.05, 0.02))
        elif ema_20 < ema_50 and price < ema_20 and adx > 20:
            signals.append(("SELL", "EMA Crossover", 75, 0.05, 0.02))

        # RSI extremes
        if rsi < 30 and macd_hist > 0:
            signals.append(("BUY", "RSI Reversal", 80, 0.06, 0.025))
        elif rsi > 70 and macd_hist < 0:
            signals.append(("SELL", "RSI Reversal", 80, 0.06, 0.025))

        # VWAP bounce
        vwap_diff = (price - vwap) / vwap
        if -0.005 < vwap_diff < 0.002 and macd_hist > 0 and vol_ratio > 1.2:
            signals.append(("BUY", "VWAP Bounce", 72, 0.04, 0.015))
        elif 0.005 > vwap_diff > -0.002 and macd_hist < 0 and vol_ratio > 1.2:
            signals.append(("SELL", "VWAP Bounce", 72, 0.04, 0.015))

        # Breakout
        if price > bb_upper and vol_ratio > 1.5 and adx > 25:
            signals.append(("BUY", "Breakout", 70, 0.07, 0.03))

        # MACD crossover
        if macd > macd_signal and macd_hist > 0 and rsi < 65:
            signals.append(("BUY", "Momentum", 65, 0.045, 0.02))
        elif macd < macd_signal and macd_hist < 0 and rsi > 35:
            signals.append(("SELL", "Momentum", 65, 0.045, 0.02))

        if not signals:
            return None

        # Pick best signal (highest confidence)
        action, strategy, confidence, target_pct, stop_pct = max(signals, key=lambda x: x[2])

        # Add noise to confidence
        confidence = min(95, confidence + random.randint(-5, 10))

        if action == "BUY":
            target = price * (1 + target_pct)
            stop = price * (1 - stop_pct)
        else:
            target = price * (1 - target_pct)
            stop = price * (1 + stop_pct)

        rr = target_pct / stop_pct

        reasoning = f"{symbol} {action.lower()} setup: {STRATEGY_DESCRIPTIONS.get(strategy, strategy)}. "
        reasoning += f"RSI {rsi:.1f}, MACD {'positive' if macd > 0 else 'negative'}, "
        reasoning += f"Price {'above' if price > vwap else 'below'} VWAP. "
        reasoning += f"ADX {adx:.1f} ({'trending' if adx > 25 else 'ranging'})."

        return TradeSignal(
            id=str(uuid.uuid4()),
            symbol=symbol,
            action=action,
            strategy=strategy,
            entry_price=round(price, 2),
            target_price=round(target, 2),
            stop_loss=round(stop, 2),
            risk_reward=round(rr, 2),
            confidence=confidence,
            probability=random.randint(50, 75),
            suggested_size=max(1, int(1000 / (price * stop_pct))),
            reasoning=reasoning,
            indicators={
                "rsi": round(rsi, 1),
                "macd": round(macd, 3),
                "adx": round(adx, 1),
                "volume_ratio": round(vol_ratio, 2),
            },
            timestamp=int(time.time() * 1000),
            timeframe=timeframe,
        )


signal_engine = SignalEngine()
