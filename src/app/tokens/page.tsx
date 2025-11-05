import { Hero } from "@/app/_components/hero";
import Link from "next/link";
import {TokenIcon} from "@/app/tokens/_components/TokenIcon";
import {formatML} from "@/utils/numbers";

async function getData() {
  const res = await fetch(process.env.SERVER_URL + "/api/token", {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
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
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Tokens</div>
          </div>
          <div className="md:col-span-12 -mx-5"></div>

          <div>
            Total {data.length} token found
          </div>
        </div>
      </Hero>
      <div>
        <div className="max-w-6xl md:mx-auto py-6 px-5">
          <div className="table w-full bg-white">
            <div className="table-header-group bg-primary-100 text-white font-semibold">
              <div className="table-cell px-2 py-1 text-center">#</div>
              <div className="table-cell px-2 py-1"></div>
              <div className="table-cell px-2 py-1">Token</div>
              <div className="table-cell px-2 py-1">Frozen</div>
              <div className="table-cell px-2 py-1">Locked</div>
              <div className="table-cell px-2 py-1">Freezable</div>
              <div className="table-cell px-2 py-1">Unfreezable</div>
              <div className="table-cell px-2 py-1 text-right">Total Supply</div>
              <div className="table-cell px-2 py-1 text-right">Circulating Supply</div>
            </div>
            {data.map((token: any, index: number) => (
              <div className="table-row hover:bg-secondary-100" key={token.id}>
                <div className="table-cell px-2 py-1 text-center align-middle">{index + 1}</div>
                <div className="table-cell py-1 text-center align-middle">
                  <TokenIcon metadata_uri={token.metadata_uri} metadata={token.metadata} ticker={token.token_ticker} />
                </div>
                <div className="table-cell px-2 py-1 align-middle">
                  <Link className="text-primary-100 font-bold" href={`/token/${token.id}`}>

                    {
                      token?.metadata?.name ? (
                        token?.metadata?.name + ' (' + token.token_ticker + ')'
                      ) : token.token_ticker
                    }
                  </Link>
                </div>
                <div className="table-cell px-2 py-1 align-middle">{token.frozen ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 align-middle">{token.is_locked ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 align-middle">{token.is_token_freezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 align-middle">{token.is_token_unfreezable ? "yes" : "no"}</div>
                <div className="table-cell px-2 py-1 align-middle text-right">{isNaN(token.total_supply) ? token.total_supply : formatML(token.total_supply)}</div>
                <div className="table-cell px-2 py-1 align-middle text-right">{formatML(token.circulating_supply)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
