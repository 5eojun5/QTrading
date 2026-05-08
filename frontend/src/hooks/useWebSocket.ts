"use client";
import { useEffect, useRef, useCallback } from "react";
import { useMarketStore } from "@/store/marketStore";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setConnected, updateQuote, addSignal } = useMarketStore();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "quote":
              updateQuote(data.symbol, data.data);
              break;
            case "signal":
              addSignal(data.data);
              break;
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectRef.current = setTimeout(connect, 5000);
    }
  }, [setConnected, updateQuote, addSignal]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef.current;
}
