import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatChange(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

export function isPositive(value: number): boolean {
  return value >= 0;
}

export function getPriceColor(change: number): string {
  return change >= 0 ? "text-bull" : "text-bear";
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K`;
  return volume.toString();
}

export function formatDTE(days: number): string {
  if (days <= 0) return "Expired";
  if (days === 1) return "1 DTE";
  if (days < 7) return `${days} DTE`;
  if (days < 30) return `${Math.floor(days / 7)}w ${days % 7}d`;
  return `${Math.floor(days / 30)}m ${days % 30}d`;
}

export function formatGreek(value: number, decimals = 4): string {
  return value.toFixed(decimals);
}

export function getRSIColor(rsi: number): string {
  if (rsi >= 70) return "text-bear";
  if (rsi <= 30) return "text-bull";
  return "text-muted-foreground";
}

export function getSignalColor(action: string): string {
  switch (action) {
    case "BUY": return "text-bull";
    case "SELL": return "text-bear";
    default: return "text-warning";
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-bull";
  if (confidence >= 60) return "text-warning";
  return "text-bear";
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
