"use client";

import { CandlestickSeries, ColorType, createChart, type UTCTimestamp } from "lightweight-charts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCoin } from "@/utils/network";

type Trade = Record<string, unknown>;
type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };

const REFRESH_MS = 20_000;
const CANDLE_INTERVALS = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 5 * 60 },
  { label: "1h", seconds: 60 * 60 },
  { label: "1d", seconds: 24 * 60 * 60 },
];

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function fieldNumber(trade: Trade, names: string[]): number | null {
  for (const name of names) {
    const raw = trade[name];
    const value = numberValue(raw) ?? (raw && typeof raw === "object" ? numberValue((raw as { decimal?: unknown }).decimal) : null);
    if (value !== null) return value;
  }
  return null;
}

function tradeTime(trade: Trade): number | null {
  // Market-data trades use `ts` (an ISO-8601 timestamp).
  const raw = trade.ts ?? trade.timestamp ?? trade.time ?? trade.createdAt ?? trade.created_at ?? trade.executedAt ?? trade.executed_at ?? trade.tradedAt ?? trade.traded_at ?? trade.blockTimestamp ?? trade.date;
  const numeric = numberValue(raw);
  if (numeric !== null) return Math.floor(numeric > 10_000_000_000 ? numeric / 1_000 : numeric);
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? null : Math.floor(parsed / 1_000);
  }
  return null;
}

function tradeRows(payload: unknown): Trade[] {
  if (Array.isArray(payload)) return payload as Trade[];
  if (!payload || typeof payload !== "object") return [];
  const response = payload as { trades?: unknown; data?: unknown; results?: unknown; items?: unknown };
  return [response.trades, response.data, response.results, response.items].find(Array.isArray) as Trade[] || [];
}

function toCandles(payload: unknown, intervalSeconds: number, tokenDecimals: number): Candle[] {
  const buckets = new Map<number, Candle>();
  const parsedTrades = tradeRows(payload)
    .map((trade) => ({
      time: tradeTime(trade),
      price: priceForTrade(trade, tokenDecimals),
    }))
    .filter((trade): trade is { time: number; price: number } => trade.time !== null && trade.price !== null && trade.price > 0)
    .sort((a, b) => a.time - b.time);

  for (const trade of parsedTrades) {
    const time = (Math.floor(trade.time / intervalSeconds) * intervalSeconds) as UTCTimestamp;
    const candle = buckets.get(time);
    if (candle) {
      candle.high = Math.max(candle.high, trade.price);
      candle.low = Math.min(candle.low, trade.price);
      candle.close = trade.price;
    } else {
      buckets.set(time, { time, open: trade.price, high: trade.price, low: trade.price, close: trade.price });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function amountForTrade(trade: Trade, names: string[], decimals: number): number | null {
  for (const name of names) {
    const raw = trade[name];
    const direct = numberValue(raw);
    if (direct !== null) return name.toLowerCase().includes("atom") ? direct / Math.pow(10, decimals) : direct;
    if (raw && typeof raw === "object") {
      const balance = raw as { decimal?: unknown; atoms?: unknown };
      const decimal = numberValue(balance.decimal);
      if (decimal !== null) return decimal;
      const atoms = numberValue(balance.atoms);
      if (atoms !== null) return atoms / Math.pow(10, decimals);
    }
  }
  return null;
}

function priceForTrade(trade: Trade, tokenDecimals: number): number | null {
  const supplied = fieldNumber(trade, ["price", "executionPrice", "execution_price", "quotePrice", "quote_price"]);
  if (supplied !== null) return supplied;

  // The market service may provide execution amounts instead of a computed price.
  // The requested token is the quote asset, so price is native-coin amount per token.
  const base = amountForTrade(trade, ["baseAmount", "base_amount", "baseAssetAmount", "base_asset_amount", "baseAmountAtoms", "base_amount_atoms"], 11);
  const quote = amountForTrade(trade, ["quoteAmount", "quote_amount", "quoteAssetAmount", "quote_asset_amount", "quoteAmountAtoms", "quote_amount_atoms"], tokenDecimals);
  return base !== null && quote !== null && quote > 0 ? base / quote : null;
}

export function TradingChart({ tokenId, tokenDecimals, ticker }: { tokenId: string; tokenDecimals: number; ticker: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [trades, setTrades] = useState<unknown>(null);
  const [intervalSeconds, setIntervalSeconds] = useState(CANDLE_INTERVALS[0].seconds);
  const coin = getCoin();
  const candles = useMemo(() => toCandles(trades, intervalSeconds, tokenDecimals), [trades, intervalSeconds, tokenDecimals]);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/market/trades/${encodeURIComponent(tokenId)}?limit=100`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load trades");
      setTrades(payload);
    } catch {
      setTrades(null);
    }
  }, [tokenId, tokenDecimals]);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!container.current || candles.length === 0) return;
    const chart = createChart(container.current, {
      autoSize: true,
      height: 320,
      layout: { background: { type: ColorType.Solid, color: "#ffffff" }, textColor: "#4b5563" },
      grid: { vertLines: { color: "#f3f4f6" }, horzLines: { color: "#f3f4f6" } },
      rightPriceScale: { borderColor: "#e5e7eb" },
      timeScale: { borderColor: "#e5e7eb", timeVisible: true, secondsVisible: false, barSpacing: 8, minBarSpacing: 4, rightOffset: 4 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });
    series.setData(candles);
    return () => chart.remove();
  }, [candles]);

  if (candles.length === 0) return null;

  return <section className="mb-4 bg-white px-3 py-3">
    <div className="mb-2 flex items-baseline justify-between">
      <h2 className="text-lg font-bold">Trading Chart</h2>
      <div className="flex items-center gap-3">
        <div className="flex rounded border border-gray-200 p-0.5 text-xs">
          {CANDLE_INTERVALS.map((interval) => <button
            key={interval.seconds}
            type="button"
            onClick={() => setIntervalSeconds(interval.seconds)}
            className={`rounded px-2 py-1 font-medium ${intervalSeconds === interval.seconds ? "bg-primary-100 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >{interval.label}</button>)}
        </div>
        <span className="text-xs text-gray-500">{ticker} / {coin}</span>
      </div>
    </div>
    <div ref={container} aria-label={`${ticker} price chart`} />
  </section>;
}
