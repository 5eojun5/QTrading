"""
QTrading API - FastAPI backend with WebSocket streaming
"""
import asyncio
import json
import random
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.api.routes import market, signals, trading, ai
from app.ws.manager import ws_manager
from app.services.market.data_engine import market_data_engine
from app.services.quant.indicators import calculate_all_indicators
from app.services.ai.signal_engine import signal_engine
from app.services.trading.paper_trading import paper_trading_engine

WATCHLIST = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "MSFT", "AMZN", "META", "GOOGL", "AMD"]


async def market_data_streamer():
    """Background task: stream market data to all WebSocket clients."""
    logger.info("Market data streamer started")
    signal_scan_counter = 0

    while True:
        try:
            # Fetch latest quotes
            quotes = await market_data_engine.get_all_quotes(WATCHLIST)

            # Update paper trading prices
            prices = {sym: q.price for sym, q in quotes.items()}
            paper_trading_engine.update_prices(prices)

            # Broadcast quotes to all clients
            for sym, quote in quotes.items():
                await ws_manager.broadcast_quote(sym, quote.model_dump())

            # Scan for signals every 10 ticks
            signal_scan_counter += 1
            if signal_scan_counter >= 10:
                signal_scan_counter = 0
                # Pick a random symbol to analyze
                sym = random.choice(WATCHLIST[:6])
                try:
                    quote = quotes.get(sym)
                    if quote:
                        bars = await market_data_engine.get_ohlcv(sym, "5m", 200)
                        indicators = calculate_all_indicators([b.model_dump() for b in bars])
                        signal = await signal_engine.analyze(sym, quote.price, indicators, "5m")
                        if signal:
                            await ws_manager.broadcast_signal(signal.model_dump())
                except Exception as e:
                    logger.debug(f"Signal scan error: {e}")

            # Heartbeat
            await ws_manager.broadcast_heartbeat()

            await asyncio.sleep(settings.REFRESH_INTERVAL_SEC)

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Streamer error: {e}")
            await asyncio.sleep(2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background streamer
    task = asyncio.create_task(market_data_streamer())
    logger.info(f"QTrading API starting on {settings.HOST}:{settings.PORT}")
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    logger.info("QTrading API shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Quantitative options trading platform with AI signal analysis",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(market.router, prefix="/api/v1")
app.include_router(signals.router, prefix="/api/v1")
app.include_router(trading.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "ws": "/ws",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": int(time.time() * 1000)}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time market data streaming."""
    await ws_manager.connect(websocket)
    logger.info(f"New WS client. Total: {len(ws_manager.active_connections)}")

    try:
        # Send initial state
        quotes = await market_data_engine.get_all_quotes(WATCHLIST)
        for sym, quote in quotes.items():
            await ws_manager.send_to(websocket, {
                "type": "quote",
                "symbol": sym,
                "data": quote.model_dump(),
            })

        await ws_manager.send_to(websocket, {"type": "connected", "timestamp": int(time.time() * 1000)})

        # Handle incoming messages
        while True:
            try:
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                msg = json.loads(raw)

                if msg.get("type") == "subscribe":
                    symbols = msg.get("symbols", [])
                    logger.debug(f"Client subscribed to: {symbols}")

                elif msg.get("type") == "ping":
                    await ws_manager.send_to(websocket, {"type": "pong"})

            except asyncio.TimeoutError:
                # Send keepalive
                await ws_manager.send_to(websocket, {"type": "ping"})

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS error: {e}")
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
