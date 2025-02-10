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

  const ipfsToHttps = (url: string) => {
    const cleanUrl = url.replace('ipfs://', '').split('/');
    return `https://${cleanUrl[0]}.ipfs.w3s.link/${cleanUrl[1]}`;
  }

  const imageUrl = ipfsToHttps(data.media_uri.string);
  const iconUrl = ipfsToHttps(data.icon_uri.string);

  const metadataUrl = ipfsToHttps(data.additional_metadata_uri.string);

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">{data.name.string} <span className="text-sm p-0 m-0">non-fungible token</span></div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="f-full">
              <div className="mx-auto mb-5 bg-white p-2">
                <img src={imageUrl}/>
              </div>
            </div>
            <div className="mb-5 w-full">
              <div className="mb-2 w-full relative">
                <img src={iconUrl} className="w-20 h-20 absolute top-2 right-2" alt=""/>
                <Summary
                  data={[
                    { title: 'Ticker', value: data.ticker.string, icon: icon_info },
                    { title: 'Name', value: data.name.string, icon: icon_info },
                    { title: 'Description', value: data.description.string, icon: icon_info },
                  ]}
                />
              </div>
              <div className="mb-2 w-full">
                <Summary
                  data={[
                    { title: 'Creator', value: data.creator || '-', icon: icon_info },
                    { title: 'Owner', value: data.owner || '-', icon: icon_info },
                  ]}
                />
              </div>
              <div className="mb-2 w-full">
                <Summary
                  data={[
                    { title: 'Metadata', value: metadataUrl || '-', icon: icon_info },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Hero>
    </>
  );
}
