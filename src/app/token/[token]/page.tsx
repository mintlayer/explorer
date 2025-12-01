import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { InfoExpand } from "./_components/info_expand";
import { redirect } from "next/navigation";
import { TokenTransactionsList } from "./_components/token_transactions";
import { Copy } from "@/app/tx/[tx]/_components/copy";
import { TokenSidebarSummary } from "@/app/tokens/_components/TokenSidebarSummary";


// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import { headers } from "next/headers";
import { NotFound } from "@/app/_components/not-found";
import React from "react";
import {Metadata} from "@/app/nft/[nft]/_components/metadata";
import {formatML} from "@/utils/numbers";
import {TransactionsList} from "@/app/address/[address]/_components/transactions-list";
import {TokenIcon} from "@/app/tokens/_components/TokenIcon";

async function getData(token: any) {
  const headersList = await headers();
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
  const token = (await params).token;
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

  const displayTokenName = data.metadata?.name ? data.metadata.name : data.token_ticker.string;

  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="flex gap-2 mb-8 items-center">
              <TokenIcon
                metadata_uri={data.metadata_uri.string}
                metadata={data.metadata}
                ticker={data.token_ticker.string}
                size="large"
              />
              <div className="flex flex-col">
                <div className="text-3xl font-bold">{displayTokenName} ({data.token_ticker.string})</div>
                <div className="text-sm font-mono no-wrap flex items-center">{token.slice(0, 6)}...{token.slice(-6)} <Copy text={token} /></div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Summary
              data={[
                {title: 'Ticker', value: data.token_ticker.string, icon: icon_info},
                {title: "Decimals", value: data.number_of_decimals, icon: icon_info, iconTooltip: "Decimals"},
                {title: "Metadata URL", value: data.metadata_uri.string + (data.metadata_invalid ? ' (Invalid)' : ''), icon: icon_info, iconTooltip: "Metadata"},
                ...(totalSupplyValue === null ? [{
                  title: "Total Supply Type",
                  value: totalSupplyType,
                  icon: icon_info,
                  iconTooltip: ""
                }] : []),
                ...(totalSupplyValue !== null ? [{
                  title: "Max Total Supply",
                  value: formatML((totalSupplyValue / Math.pow(10, data.number_of_decimals)).toString()) + " (" + totalSupplyType + ")",
                  icon: icon_info,
                  iconTooltip: ""
                }] : []),
              ]}
            />
          </div>

          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-8">
              <TokenTransactionsList token_id={token} />
            </div>

            <div className="md:col-span-4">
              <TokenSidebarSummary
                data={[
                  {title: 'Authority', value: data.authority.slice(0, 8) + "..." + data.authority.slice(-8), link: `/address/${data.authority}`, icon: icon_info, copy: data.authority},
                  {title: "Circulating Supply", value: data.circulating_supply.decimal, icon: icon_info, iconTooltip: ""},
                  {title: "Frozen", value: data.frozen ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                  {title: "Locked", value: data.is_locked ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                  {title: "Freezable", value: data.is_token_freezable ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                  {title: "Unfreezable", value: data.is_token_unfreezable ? "yes" : "no", icon: icon_info, iconTooltip: ""},
                  {title: "Burned", value: data.burned.decimal, icon: icon_info, iconTooltip: ""},
                  {title: "Preminted", value: data.preminted.decimal, icon: icon_info, iconTooltip: ""},
                  {title: "Staked", value: data.staked.decimal, icon: icon_info, iconTooltip: ""},
                ]}
              />
            </div>
          </div>
        </div>
      </Hero>
    </>
  );
}
