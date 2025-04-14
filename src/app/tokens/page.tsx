import { Hero } from "@/app/_components/hero";
import Link from "next/link";

async function getData() {
  const res = await fetch(process.env.SERVER_URL + "/api/token", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return { data };
}

export default async function Tokens({
  params,
  searchParams,
}: {
  params: { block: string };
  searchParams: { transactionsPage: string; transactionsPerPage: string };
}) {
  const { data }: any = await getData();

  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <div className="text-5xl font-bold leading-[4rem]">Tokens</div>
              <Link href="/token-verify">
                <button className="bg-primary-100 text-white px-4 py-2 text-sm rounded-md hover:bg-primary-110 transition">
                  Verify Token on Mintlayer
                </button>
              </Link>
            </div>
          </div>
          <div className="md:col-span-12 -mx-5"></div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-9"></div>
            <div className="md:col-span-3 grid grid-cols-1 grid-rows-3 gap-4"></div>
          </div>
        </div>
      </Hero>
      <div>
        <div className="max-w-6xl md:mx-auto py-6 px-5">
          <div className="table w-full">
            <div className="table-header-group bg-white font-semibold">
              <div className="table-cell px-2 py-1">ID</div>
              <div className="table-cell px-2 py-1">Frozen</div>
              <div className="table-cell px-2 py-1">Locked</div>
              <div className="table-cell px-2 py-1">Freezable</div>
              <div className="table-cell px-2 py-1">Unfreezable</div>
              <div className="table-cell px-2 py-1">Ticker</div>
              <div className="table-cell px-2 py-1">Total Supply</div>
              <div className="table-cell px-2 py-1">Circulating Supply</div>
            </div>
            {data.map((token: any) => (
              <div className="table-row hover:bg-secondary-100" key={token.id}>
                <div className="table-cell px-2 py-1">
                  <Link className="text-primary-100 font-bold" href={`/token/${token.id}`}>
                    {token.id.slice(0, 6) + "..." + token.id.slice(-6)}
                  </Link>
                </div>
                <div className="table-cell px-2 py-1">{token.frozen ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1">{token.is_locked ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1">{token.is_token_freezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1">{token.is_token_unfreezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1">{token.token_ticker}</div>
                <div className="table-cell px-2 py-1 text-right">{token.total_supply}</div>
                <div className="table-cell px-2 py-1 text-right">{token.circulating_supply}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
