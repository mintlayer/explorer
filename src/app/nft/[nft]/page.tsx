import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { InfoExpand } from "./_components/info_expand";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";

async function getData(nft: any) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/nft/" + nft, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();

  return { data };
}

export default async function Token({ params }: { params: { nft: string } }) {
  const nft = params.nft;
  const { data }: any = await getData(nft);

  if (!data) {
    return <></>;
  }

  if (data.error && data.error === "Invalid token Id") {
    return <NotFound title={"Token not found"} subtitle={"Token not found"} />;
  }

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">NFT</div>
          </div>
          <div className="mb-8">
            <Summary
              data={[
                { title: 'Ticker', value: data.ticker.string, icon: icon_info },
                { title: 'Description', value: data.description.string, icon: icon_info },
              ]}
            />
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto">
        <InfoExpand title={"Additional info & Documentation"}>
          <div className="max-w-2xl">
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>Ticker</div>
              <div>{data.ticker.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>Name</div>
              <div>{data.name.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>Owner</div>
              <div>{data.owner}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>Creator</div>
              <div>{data.creator}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>description</div>
              <div>{data.description.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>Additional metadata uri</div>
              <div>{data.additional_metadata_uri.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>media_uri</div>
              <div>{data.media_uri.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>icon_uri</div>
              <div>{data.icon_uri.string}</div>
            </div>
          </div>
        </InfoExpand>
      </div>
    </>
  );
}
