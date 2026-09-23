import { NextResponse } from "next/server";
import { withCache } from "@/lib/server-cache";
import { getUrl } from "@/utils/network";

export const dynamic = "force-dynamic";

const ORDER_BOOK_CACHE_MS = Number(process.env.EXPLORER_ORDER_BOOK_CACHE_MS || 15_000);

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const orders = await withCache(`order-book:${getUrl()}:${token}`, ORDER_BOOK_CACHE_MS, async () => {
      // The indexer's native-coin pair slug is TML for both supported networks.
      const response = await fetch(`${getUrl()}/order/pair/${encodeURIComponent(token)}_TML`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Unable to load order book: ${response.status}`);
      }

      return response.json();
    });

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order book";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
