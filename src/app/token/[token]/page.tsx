import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { InfoExpand } from "./_components/info_expand";
import { redirect } from "next/navigation";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";
import {Metadata} from "@/app/nft/[nft]/_components/metadata";
import {formatML} from "@/utils/numbers";

async function getData(token: any) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/token/" + token, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();

  // check if data.type === 'nft' and redirect to nft page with same id
  if(data.type === 'nft') {
    // redirect to nft page
    redirect(`/nft/${token}`);
  }

  return { data };
}

export default async function Token({ params }: { params: { token: string } }) {
  const token = params.token;
  const { data }: any = await getData(token);

  if (!data) {
    return <></>;
  }

  if (data.error && data.error === "Invalid token Id") {
    return <NotFound title={"Token not found"} subtitle={"Token not found"} />;
  }

  const ipfsToHttps = (url: string) => {
    const cleanUrl = url.replace('ipfs://', '').split('/');
    return `https://${cleanUrl[0]}.ipfs.w3s.link${cleanUrl[1]?'/'+cleanUrl[1]:''}`;
  }

  const metadataUrl = ipfsToHttps(data.metadata_uri.string);

  const totalSupplyType = typeof data.total_supply === 'string' ? data.total_supply : Object.keys(data.total_supply);
  const totalSupplyValue = data.total_supply[totalSupplyType]?.atoms ? data.total_supply[totalSupplyType].atoms : null;

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">{data.token_ticker.string}</div>
          </div>
          <div className="mb-8">
            <Summary
              data={[
                {title: 'Ticker', value: data.token_ticker.string, icon: icon_info},
                {title: "Decimals", value: data.number_of_decimals, icon: icon_info, iconTooltip: "Decimals"},
              ]}
            />
          </div>

          <div className="mb-8">
            <Summary
              data={[
                {title: 'Authority', value: data.authority, icon: icon_info},
                {title: "Circulating Supply", value: data.circulating_supply.decimal, icon: icon_info, iconTooltip: ""},
                {title: "Frozen", value: data.frozen ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                {title: "Locked", value: data.is_locked ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                {title: "Freezable", value: data.is_token_freezable ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                {
                  title: "Unfreezable",
                  value: data.is_token_unfreezable ? "yes" : "no",
                  icon: icon_info,
                  iconTooltip: ""
                },
                {title: "Burned", value: data.burned.decimal, icon: icon_info, iconTooltip: ""},
                {title: "Preminted", value: data.preminted.decimal, icon: icon_info, iconTooltip: ""},
                {title: "Staked", value: data.staked.decimal, icon: icon_info, iconTooltip: ""},
                {
                  title: "Total Supply Type",
                  value: totalSupplyType,
                  icon: icon_info,
                  iconTooltip: ""
                },
                ...(totalSupplyValue !== null ? [{
                  title: "Total Supply",
                  value: formatML((totalSupplyValue / Math.pow(10, data.number_of_decimals)).toString()),
                  icon: icon_info,
                  iconTooltip: ""
                }] : []),
              ]}
            />
          </div>

          <div className="mb-2 w-full">
            <Summary
              data={[
                {title: 'Metadata', value: data.metadata_uri.string || '-', icon: icon_info},
              ]}
            />

            <Metadata metadataUrl={metadataUrl}/>
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto">
        {/* TODO add chain data */}
      </div>
    </>
  );
}
