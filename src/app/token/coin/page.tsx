import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";

import {getCoin} from "@/utils/network";

async function getData(token: any) {
  const headersList = await headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/token/coin", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();

  return { data };
}

export default async function Token({ params }: { params: { token: string } }) {
  const token = (await params).token;
  const { data }: any = await getData(token);

  if (!data) {
    return <></>;
  }

  if (data.error && data.error === "Invalid token Id") {
    return <NotFound title={"Token not found"} subtitle={"Token not found"} />;
  }

  const coin = getCoin();

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Mintlayer Coin ({coin})</div>
          </div>
          <div className="mb-8">
            <Summary
              data={[
                {title: 'Ticker', value: coin, icon: icon_info},
                {title: "Decimals", value: 11, icon: icon_info, iconTooltip: "Decimals"},
              ]}
            />
          </div>
          <div className="mb-8">
            <Summary
              data={[
                {title: "Circulating Supply", value: data.circulating_supply.decimal, icon: icon_info, iconTooltip: ""},
                // {title: "Frozen", value: data.frozen ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                // {title: "Locked", value: data.is_locked ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                // {title: "Freezable", value: data.is_token_freezable ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                // {
                //   title: "Unfreezable",
                //   value: data.is_token_unfreezable ? "yes" : "no",
                //   icon: icon_info,
                //   iconTooltip: ""
                // },
                {title: "Burned", value: data.burned.decimal, icon: icon_info, iconTooltip: ""},
                {title: "Preminted", value: data.preminted.decimal, icon: icon_info, iconTooltip: ""},
                {title: "Staked", value: data.staked.decimal, icon: icon_info, iconTooltip: ""},
                // {
                //   title: "Total Supply",
                //   value: Object.keys(data.total_supply).map((key) => (`${key}: ${data.total_supply[key].atoms / data.circulating_supply.decimal}`)),
                //   icon: icon_info,
                //   iconTooltip: ""
                // },
              ]}
            />
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto">

      </div>
    </>
  );
}
