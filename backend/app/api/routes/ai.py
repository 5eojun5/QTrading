from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
from fastapi.responses import StreamingResponse
import json

from app.core.config import settings
from app.services.market.data_engine import market_data_engine

router = APIRouter(prefix="/ai", tags=["ai"])

WATCHLIST = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ"]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    symbol: Optional[str] = None


SYSTEM_PROMPT = """You are QTrading AI, an expert quantitative trading and options analyst.

You provide:
- Technical analysis of stocks and options
- Entry/exit strategies with specific price levels
- Options Greeks explanations (Delta, Gamma, Theta, Vega)
- Risk management advice
- Market sentiment analysis
- Strategy recommendations (covered calls, spreads, iron condors, etc.)

Always provide specific, actionable insights with numbers when relevant.
Format responses with clear sections using markdown.
Always remind users this is educational, not financial advice."""


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with the AI trading assistant."""
    if not settings.OPENAI_API_KEY:
        # Fallback response
        return {
            "response": "OpenAI API key not configured. Add OPENAI_API_KEY to your .env file to enable AI analysis. The frontend includes built-in rule-based responses for demo purposes.",
            "model": "rule-based",
        }

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        # Add market context
        context = ""
        if request.symbol:
            quote = await market_data_engine.get_quote(request.symbol.upper())
            context = f"\n\nCurrent market data for {request.symbol.upper()}: Price ${quote.price:.2f}, Change {quote.change_percent:+.2f}%"

        messages = [{"role": "system", "content": SYSTEM_PROMPT + context}]
        messages += [{"role": m.role, "content": m.content} for m in request.messages]

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )

        return {
            "response": response.choices[0].message.content,
            "model": response.model,
            "tokens": response.usage.total_tokens,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment/{symbol}")
async def get_sentiment(symbol: str):
    """Get AI-powered market sentiment for a symbol."""
    quote = await market_data_engine.get_quote(symbol.upper())

    # Mock sentiment analysis
    import random
    score = (quote.change_percent + 5) / 10  # Normalize to 0-1
    score = max(0, min(1, score + random.uniform(-0.1, 0.1)))

    sentiment = "bullish" if score > 0.6 else "bearish" if score < 0.4 else "neutral"

    return {
        "symbol": symbol.upper(),
        "sentiment": sentiment,
        "score": round(score, 3),
        "factors": [
            {"factor": "Price momentum", "impact": "positive" if quote.change_percent > 0 else "negative"},
            {"factor": "Volume", "impact": "positive" if quote.volume > quote.avg_volume else "neutral"},
            {"factor": "Options flow", "impact": "positive"},
        ],
        "summary": f"{symbol.upper()} showing {sentiment} sentiment based on price action and options flow analysis.",
    }
