"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getCoin } from "@/utils/network";

type Balance = { atoms?: string; decimal?: string };
type Currency = { type?: string; token_id?: string };
type Order = {
  order_id: string;
  ask_balance: Balance;
  ask_currency: Currency;
  give_balance: Balance;
  give_currency: Currency;
};

type Level = {
  orderId: string;
  price: number;
  baseAmount: number;
  quoteAmount: number;
};

const COIN_DECIMALS = 11;
const REFRESH_MS = 20_000;

function decimalAmount(balance: Balance, decimals: number): number {
  if (balance.decimal !== undefined) {
    const value = Number(balance.decimal);
    if (Number.isFinite(value)) return value;
  }

  const atoms = balance.atoms;
  if (!atoms || !/^\d+$/.test(atoms)) return 0;
  const normalized = atoms.padStart(decimals + 1, "0");
  const whole = normalized.slice(0, -decimals);
  const fraction = normalized.slice(-decimals).replace(/0+$/, "");
  const value = Number(fraction ? `${whole}.${fraction}` : whole);
  return Number.isFinite(value) ? value : 0;
}

function asOrders(payload: unknown): Order[] {
  if (Array.isArray(payload)) return payload as Order[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Order[] }).data;
  }
  return [];
}

function toLevel(order: Order, tokenId: string, tokenDecimals: number): { side: "ask" | "bid"; level: Level } | null {
  const tokenGiven = order.give_currency?.token_id === tokenId;
  const tokenAsked = order.ask_currency?.token_id === tokenId;
  const coinGiven = order.give_currency?.type === "Coin";
  const coinAsked = order.ask_currency?.type === "Coin";

  const given = decimalAmount(order.give_balance || {}, tokenGiven ? tokenDecimals : COIN_DECIMALS);
  const asked = decimalAmount(order.ask_balance || {}, tokenAsked ? tokenDecimals : COIN_DECIMALS);
  if (given <= 0 || asked <= 0) return null;

  if (tokenGiven && coinAsked) {
    return { side: "ask", level: { orderId: order.order_id, price: asked / given, baseAmount: given, quoteAmount: asked } };
  }
  if (coinGiven && tokenAsked) {
    return { side: "bid", level: { orderId: order.order_id, price: given / asked, baseAmount: asked, quoteAmount: given } };
  }
  return null;
}

function format(value: number, maximumFractionDigits = 8) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

function OrderRows({ levels, side }: { levels: Level[]; side: "ask" | "bid" }) {
  return (
    <div>
      <div className={`px-3 py-1 text-xs font-bold uppercase ${side === "ask" ? "text-red-700" : "text-green-700"}`}>{side === "ask" ? "Asks" : "Bids"}</div>
      {levels.map((level) => (
        <div key={level.orderId} className="grid grid-cols-3 gap-2 border-t border-gray-100 px-3 py-1 text-xs">
          <Link href={`/order/${level.orderId}`} className="font-mono text-primary hover:underline" title={level.orderId}>{format(level.price)}</Link>
          <span className="text-right">{format(level.baseAmount)}</span>
          <span className="text-right">{format(level.quoteAmount)}</span>
        </div>
      ))}
    </div>
  );
}

export function OrderBook({ tokenId, tokenDecimals, ticker }: { tokenId: string; tokenDecimals: number; ticker: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const coin = getCoin();

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/order/pair/${encodeURIComponent(tokenId)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Unable to load order book: ${response.status}`);
      setOrders(asOrders(payload));
    } catch {
      // Keep the last successful book visible; an unavailable book stays hidden.
    }
  }, [tokenId]);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  const asks: Level[] = [];
  const bids: Level[] = [];
  orders.forEach((order) => {
    const result = toLevel(order, tokenId, tokenDecimals);
    if (result) (result.side === "ask" ? asks : bids).push(result.level);
  });
  asks.sort((a, b) => a.price - b.price);
  bids.sort((a, b) => b.price - a.price);
  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;
  const spread = bestAsk !== undefined && bestBid !== undefined ? bestAsk - bestBid : undefined;

  if (asks.length === 0 && bids.length === 0) return null;

  return <section className="mb-4 bg-white px-3 py-3">
    <div className="mb-2 flex items-baseline justify-between">
      <h2 className="text-lg font-bold">Order Book</h2>
      <span className="text-xs text-gray-500">{ticker} / {coin}</span>
    </div>
    <div className="grid grid-cols-3 gap-2 bg-secondary-100 px-3 py-1 text-[10px] font-bold uppercase"><span>Price ({coin})</span><span className="text-right">Amount</span><span className="text-right">Total ({coin})</span></div>
    {asks.length > 0 && <OrderRows levels={asks} side="ask" />}
    <div className="my-1 bg-secondary-100 px-3 py-1 text-xs">{spread !== undefined ? <>Spread: <strong>{format(spread)} {coin}</strong> ({format((spread / bestAsk!) * 100, 2)}%)</> : bestAsk !== undefined ? <>Best ask: <strong>{format(bestAsk)} {coin}</strong></> : <>Best bid: <strong>{format(bestBid!)} {coin}</strong></>}</div>
    {bids.length > 0 && <OrderRows levels={bids} side="bid" />}
  </section>;
}
