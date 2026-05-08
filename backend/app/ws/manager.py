"""
WebSocket connection manager for broadcasting real-time market data.
"""
import asyncio
import json
import time
from typing import Any
from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.subscriptions: dict[str, set[WebSocket]] = {}

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, ws: WebSocket):
        self.active_connections.remove(ws)
        for subs in self.subscriptions.values():
            subs.discard(ws)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients."""
        if not self.active_connections:
            return

        data = json.dumps(message)
        dead = []
        for ws in self.active_connections:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(ws)

    async def send_to(self, ws: WebSocket, message: dict):
        """Send message to a specific client."""
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send to client: {e}")
            self.disconnect(ws)

    async def broadcast_quote(self, symbol: str, quote: dict):
        await self.broadcast({"type": "quote", "symbol": symbol, "data": quote})

    async def broadcast_signal(self, signal: dict):
        await self.broadcast({"type": "signal", "data": signal})

    async def broadcast_options_alert(self, alert: dict):
        await self.broadcast({"type": "options_alert", "data": alert})

    async def broadcast_heartbeat(self):
        await self.broadcast({"type": "heartbeat", "timestamp": int(time.time() * 1000)})


ws_manager = ConnectionManager()
