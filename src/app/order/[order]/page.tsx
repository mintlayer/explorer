import { Hero } from "@/app/_components/hero";
import { NotFound } from "@/app/_components/not-found";
import { getUrl } from "@/utils/network";

function amount(balance: { decimal?: string; atoms?: string } | undefined) {
  return balance?.decimal ?? balance?.atoms ?? "—";
}

function currency(currency: { type?: string; token_id?: string } | undefined) {
  return currency?.type === "Coin" ? "ML/TML" : currency?.token_id ?? currency?.type ?? "—";
}

export default async function Order({ params }: { params: Promise<{ order: string }> }) {
  const { order } = await params;
  let data: Record<string, any> | null = null;

  try {
    const response = await fetch(`${getUrl()}/order/${encodeURIComponent(order)}`, { cache: "no-store" });
    if (response.ok) data = await response.json();
  } catch {
    data = null;
  }

  if (!data || data.error) {
    return <NotFound title="Order not found" subtitle="This order is unavailable or has concluded." />;
  }

  return <Hero>
    <div className="max-w-6xl px-5 py-8 md:mx-auto">
      <h1 className="mb-2 text-3xl font-bold">Order</h1>
      <p className="mb-6 break-all font-mono text-sm text-gray-600">{data.order_id ?? order}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-5">
          <h2 className="mb-4 text-xl font-bold">Remaining liquidity</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Giving</dt><dd className="font-medium">{amount(data.give_balance)} {currency(data.give_currency)}</dd></div>
            <div><dt className="text-gray-500">Asking</dt><dd className="font-medium">{amount(data.ask_balance)} {currency(data.ask_currency)}</dd></div>
          </dl>
        </div>
        <div className="bg-white p-5">
          <h2 className="mb-4 text-xl font-bold">Order details</h2>
          <dl className="space-y-3 break-all text-sm">
            <div><dt className="text-gray-500">Maker / conclusion destination</dt><dd className="font-mono">{data.conclude_destination ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Nonce</dt><dd>{data.nonce ?? "—"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </Hero>;
}
