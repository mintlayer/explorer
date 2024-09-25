import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { InfoExpand } from "./_components/info_expand";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";

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

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Token</div>
          </div>
          <div className="mb-8">
            <Summary
              data={[
                { title: 'Ticker', value: data.token_ticker.string, icon: icon_info },
                { title: "Circulating Supply", value: data.circulating_supply.decimal, icon: icon_info, iconTooltip: "Circulating Supply" },
                { title: "Decimals", value: data.number_of_decimals, icon: icon_info, iconTooltip: "Decimals" },
                { title: "MetaData URI", value: data.metadata_uri.string, icon: icon_info, iconTooltip: "MetaData URI" },
              ]}
            />
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto">
        <InfoExpand title={"Additional info & Documentation"}>
          <div className="max-w-2xl">
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>authority</div>
              <div>{data.authority}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>circulating_supply.decimal</div>
              <div>{data.circulating_supply.decimal}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>frozen</div>
              <div>{data.frozen ? "yes" : "no"}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>is_locked</div>
              <div>{data.is_locked ? "yes" : "no"}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>is_token_freezable</div>
              <div>{data.is_token_freezable ? "yes" : "no"}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>is_token_unfreezable</div>
              <div>{data.is_token_unfreezable ? "yes" : "no"}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>metadata_uri.string</div>
              <div>{data.metadata_uri.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>number_of_decimals</div>
              <div>{data.number_of_decimals}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>token_ticker.string</div>
              <div>{data.token_ticker.string}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>total_supply</div>
              <div>{JSON.stringify(data.total_supply)}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>burned</div>
              <div>{data.burned.decimal}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>preminted</div>
              <div>{data.preminted.decimal}</div>
            </div>
            <div className="flex gap-2 bg-white py-1 px-3 my-2 justify-between">
              <div>staked</div>
              <div>{data.staked.decimal}</div>
            </div>
          </div>
        </InfoExpand>
      </div>
    </>
  );
}
