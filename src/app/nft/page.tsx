import { Hero } from "@/app/_components/hero";
import Link from "next/link";

async function getData() {
  const res = await fetch(process.env.SERVER_URL + "/api/nft", {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();

  return { data };
}

export default async function Nfts() {
  const { data }: any = await getData();

  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">NFTs</div>
          </div>
          <div className="md:col-span-12 -mx-5"></div>

          <div>Total {data.length} NFT found</div>
        </div>
      </Hero>
      <div>
        <div className="max-w-6xl md:mx-auto py-6 px-5">
          {!data.length ? (
            <div className="bg-white p-6">No NFTs found</div>
          ) : (
            <div className="table w-full bg-white">
              <div className="table-header-group bg-primary-100 text-white font-semibold">
                <div className="table-cell px-2 py-1 text-center">#</div>
                <div className="table-cell px-2 py-1">NFT</div>
                <div className="table-cell px-2 py-1">Name</div>
                <div className="table-cell px-2 py-1">Ticker</div>
                <div className="table-cell px-2 py-1">Creator</div>
                <div className="table-cell px-2 py-1">Owner</div>
                <div className="table-cell px-2 py-1">Metadata</div>
              </div>
              {data.map((nft: any, index: number) => (
                <div className="table-row hover:bg-secondary-100" key={nft.id}>
                  <div className="table-cell px-2 py-1 text-center align-middle">{index + 1}</div>
                  <div className="table-cell px-2 py-1 align-middle">
                    <Link className="text-primary-100 font-bold" href={`/nft/${nft.id}`}>
                      {nft.id}
                    </Link>
                  </div>
                  <div className="table-cell px-2 py-1 align-middle">{nft.name || "-"}</div>
                  <div className="table-cell px-2 py-1 align-middle">{nft.ticker || "-"}</div>
                  <div className="table-cell px-2 py-1 align-middle">{nft.creator || "-"}</div>
                  <div className="table-cell px-2 py-1 align-middle">{nft.owner || "-"}</div>
                  <div className="table-cell px-2 py-1 align-middle">
                    {nft.additional_metadata_uri ? (
                      <a className="text-primary-100 font-bold" href={nft.additional_metadata_uri} target="_blank" rel="noreferrer">
                        open
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
