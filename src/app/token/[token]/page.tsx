import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { InfoExpand } from "./_components/info_expand";
import { redirect } from "next/navigation";
import Link from "next/link";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";
// import {Metadata} from "@/app/nft/[nft]/_components/metadata";
import TokenMetadataViewer from "@/app/_components/token-metadata-viewer";

// Example list of verified token IDs
const VERIFIED_TOKENS = [
  "mmltk1rch870scvx0pa9ymkftj28jusqx2r8llxnfl20y06e6exalxuhkqv2arc2",
  "tmltk1aa3vvztufv5m054klp960p6f6pf59ugxp394x7n42v0clgwhrw3q3mpcq3",
  // Add more verified token IDs here
];

const isTokenVerified = (tokenId: string): boolean => {
  return VERIFIED_TOKENS.includes(tokenId);
};

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

  // Упрощенная функция - просто возвращает исходный URL для обработки в клиентском компоненте
  const ipfsToHttps = (url: string) => {
    if (!url) return '';
    return url;
  }

  const metadataUrl = ipfsToHttps(data.metadata_uri.string);

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <div className="text-5xl font-bold leading-[4rem]">{data.token_ticker.string}</div>
              
              {isTokenVerified(token) ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md text-green-500 font-medium">
                  <svg 
                    className="w-5 h-5" 
                    fill="#37DB8C" 
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="#37DB8C"
                  >
                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                  </svg>
                  Already Verified
                </div>
              ) : (
                <Link href={`/token-verify?tokenId=${token}`}>
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
              )}
            </div>
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
                  title: "Total Supply",
                  value: Object.keys(data.total_supply).map((key) => (`${key}: ${data.total_supply[key].atoms / data.circulating_supply.decimal}`)),
                  icon: icon_info,
                  iconTooltip: ""
                },
              ]}
            />
          </div>

          <div className="mb-2 w-full">
            <Summary
              data={[
                {title: 'Metadata', value: data.metadata_uri.string || '-', icon: icon_info},
              ]}
            />

            <TokenMetadataViewer metadataUrl={metadataUrl}/>
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto">
        {/* TODO add chain data */}
      </div>
    </>
  );
}
