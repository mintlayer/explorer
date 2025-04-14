import { Hero } from "@/app/_components/hero";
import Link from "next/link";

// Example list of verified token IDs
const VERIFIED_TOKENS = [
  "mmltk1rch870scvx0pa9ymkftj28jusqx2r8llxnfl20y06e6exalxuhkqv2arc2",
  "tmltk1aa3vvztufv5m054klp960p6f6pf59ugxp394x7n42v0clgwhrw3q3mpcq3",
  // Add more verified token IDs here
];

const isTokenVerified = (tokenId: string): boolean => {
  return VERIFIED_TOKENS.includes(tokenId);
};

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
                <button className="flex items-center gap-2 bg-primary-100 text-white px-4 py-2 text-sm rounded-md hover:bg-primary-110 transition">
                  <svg
                    className="w-5 h-5"
                    fill="#37DB8C"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="#37DB8C"
                  >
                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                  </svg>
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
              <div className="table-cell px-2 py-1 text-center">Frozen</div>
              <div className="table-cell px-2 py-1 text-center">Locked</div>
              <div className="table-cell px-2 py-1 text-center">Freezable</div>
              <div className="table-cell px-2 py-1 text-center">Unfreezable</div>
              <div className="table-cell px-2 py-1">Ticker</div>
              <div className="table-cell px-2 py-1">Total Supply</div>
              <div className="table-cell px-2 py-1">Circulating Supply</div>
              <div className="table-cell px-2 py-1">Verified</div>
            </div>
            {data.map((token: any) => (
              <div className="table-row hover:bg-secondary-100" key={token.id}>
                <div className="table-cell px-2 py-1">
                  <Link className="text-primary-100 font-bold" href={`/token/${token.id}`}>
                    {token.id.slice(0, 6) + "..." + token.id.slice(-6)}
                  </Link>
                </div>
                <div className="table-cell px-2 py-1 text-center">{token.frozen ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 text-center">{token.is_locked ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 text-center">{token.is_token_freezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 text-center">{token.is_token_unfreezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1">{token.token_ticker}</div>
                <div className="table-cell px-2 py-1 text-right">{token.total_supply}</div>
                <div className="table-cell px-2 py-1 text-right">{token.circulating_supply}</div>
                <div className="table-cell px-2 py-1 text-center">
                  {isTokenVerified(token.id) ? (
                    <svg
                      className="inline w-4 h-4"
                      fill="#37DB8C"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                    </svg>
                  ) : (
                    <span className="text-gray-400 text-xs">–</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
