"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Activity, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketStore } from "@/store/marketStore";
import type { OHLCVBar } from "@/types/market";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

type IndicatorKey = "rsi" | "macd" | "ema" | "bb" | "volume";

interface ChartProps {
  symbol?: string;
  height?: number;
}

export function TradingChart({ symbol, height = 450 }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const candleSeriesRef = useRef<unknown>(null);
  const volumeSeriesRef = useRef<unknown>(null);
  const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(new Set<IndicatorKey>(["ema", "volume"]));
  const [isLoading, setIsLoading] = useState(true);

  const chartData = useMarketStore((s) => s.chartData);
  const chartTimeframe = useMarketStore((s) => s.chartTimeframe);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setChartTimeframe = useMarketStore((s) => s.setChartTimeframe);
  const displaySymbol = symbol || selectedSymbol;

  useEffect(() => {
    let chart: unknown, candleSeries: unknown, volumeSeries: unknown;

    const initChart = async () => {
      if (!containerRef.current) return;
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "rgba(148, 163, 184, 0.9)",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.03)" },
          horzLines: { color: "rgba(255, 255, 255, 0.03)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "rgba(0, 200, 83, 0.3)", labelBackgroundColor: "#00C853" },
          horzLine: { color: "rgba(0, 200, 83, 0.3)", labelBackgroundColor: "#00C853" },
        },
        rightPriceScale: {
          borderColor: "rgba(255, 255, 255, 0.05)",
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: "rgba(255, 255, 255, 0.05)",
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: { vertTouchDrag: false },
      });

      // Candlestick series
      candleSeries = (chart as { addCandlestickSeries: (opts: unknown) => unknown }).addCandlestickSeries({
        upColor: "#00C853",
        downColor: "#FF3D57",
        borderUpColor: "#00C853",
        borderDownColor: "#FF3D57",
        wickUpColor: "#00C853",
        wickDownColor: "#FF3D57",
      });

      // Volume series
      volumeSeries = (chart as { addHistogramSeries: (opts: unknown) => unknown }).addHistogramSeries({
        color: "rgba(0, 200, 83, 0.3)",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      (chart as { priceScale: (id: string) => { applyOptions: (opts: unknown) => void } }).priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      // Set data
      if (chartData.length > 0) {
        (candleSeries as { setData: (data: unknown) => void }).setData(chartData);
        (volumeSeries as { setData: (data: unknown) => void }).setData(
          chartData.map((b) => ({
            time: b.time,
            value: b.volume,
            color: b.close >= b.open ? "rgba(0,200,83,0.4)" : "rgba(255,61,87,0.4)",
          }))
        );

        // EMAs
        if (activeIndicators.has("ema")) {
          addEMA(chart as { addLineSeries: (opts: unknown) => { setData: (data: unknown) => void } }, chartData, 20, "#3B82F6");
          addEMA(chart as { addLineSeries: (opts: unknown) => { setData: (data: unknown) => void } }, chartData, 50, "#F59E0B");
        }

        // Bollinger Bands
        if (activeIndicators.has("bb")) {
          addBollingerBands(chart as { addLineSeries: (opts: unknown) => { setData: (data: unknown) => void } }, chartData);
        }

        (chart as { timeScale: () => { fitContent: () => void } }).timeScale().fitContent();
      }

      setIsLoading(false);
    };

    initChart();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        (chartRef.current as { applyOptions: (opts: unknown) => void }).applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove();
        chartRef.current = null;
      }
    };
  }, [displaySymbol, chartTimeframe]);

  useEffect(() => {
    if (candleSeriesRef.current && chartData.length > 0) {
      (candleSeriesRef.current as { setData: (data: unknown) => void }).setData(chartData);
      if (volumeSeriesRef.current) {
        (volumeSeriesRef.current as { setData: (data: unknown) => void }).setData(
          chartData.map((b) => ({
            time: b.time,
            value: b.volume,
            color: b.close >= b.open ? "rgba(0,200,83,0.4)" : "rgba(255,61,87,0.4)",
          }))
        );
      }
    }
  }, [chartData]);

  const toggleIndicator = (key: IndicatorKey) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const INDICATORS: { key: IndicatorKey; label: string }[] = [
    { key: "rsi", label: "RSI" },
    { key: "macd", label: "MACD" },
    { key: "ema", label: "EMA" },
    { key: "bb", label: "BB" },
    { key: "volume", label: "VOL" },
  ];

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Chart toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="font-bold">{displaySymbol}</span>
          </div>
          {/* Timeframe selector */}
          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setChartTimeframe(tf)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  chartTimeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-1">
          {INDICATORS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleIndicator(key)}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors border",
                activeIndicators.has(key)
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:border-border/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

function addEMA(
  chart: { addLineSeries: (opts: unknown) => { setData: (data: unknown) => void } },
  data: OHLCVBar[],
  period: number,
  color: string
) {
  const series = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false });
  const ema: { time: number; value: number }[] = [];
  let multiplier = 2 / (period + 1);
  let emaPrev = data.slice(0, period).reduce((a, b) => a + b.close, 0) / period;

  data.forEach((bar, i) => {
    if (i < period - 1) return;
    const val = i === period - 1 ? emaPrev : bar.close * multiplier + emaPrev * (1 - multiplier);
    emaPrev = val;
    ema.push({ time: bar.time, value: parseFloat(val.toFixed(2)) });
  });
  series.setData(ema);
}

function addBollingerBands(
  chart: { addLineSeries: (opts: unknown) => { setData: (data: unknown) => void } },
  data: OHLCVBar[],
  period = 20
) {
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];

  for (let i = period; i < data.length; i++) {
    const slice = data.slice(i - period, i).map((b) => b.close);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    upper.push({ time: data[i].time, value: parseFloat((mean + 2 * std).toFixed(2)) });
    lower.push({ time: data[i].time, value: parseFloat((mean - 2 * std).toFixed(2)) });
  }

  chart.addLineSeries({ color: "rgba(59,130,246,0.5)", lineWidth: 1, priceLineVisible: false }).setData(upper);
  chart.addLineSeries({ color: "rgba(59,130,246,0.5)", lineWidth: 1, priceLineVisible: false }).setData(lower);
}
