import Image from "next/image";
import Link from "next/link";
import React, {useEffect} from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";

// icons
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import notfound from "@/../public/images/broken.svg";

import { Delegations } from "@/app/pool/[pool]/_components/delegations";
import { getCoin } from "@/utils/network";
import check_icon from "@/app/(homepage)/_icons/24px/check.svg";
import { FormatML } from "@/app/_components/number";
import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { isMainNetwork, MAINNET_EXPLORER_URL, TESTNET_EXPLORER_URL } from "@/utils/network";
import { Remark } from "@/app/_components/remark";
import { InfoExpand } from "@/app/token/[token]/_components/info_expand";
import { Tabs } from "@/app/_components/tabs";
import { readFile } from "@/utils/files";
import { Icon } from "@/app/_components/heading_box/icon";
import { WalletConnect } from "@/app/_components/wallet_connect";
import { NotFound } from "@/app/_components/not-found";

import { StakeButton } from "./_components/stake_button";
import { Stats } from "@/app/pool/[pool]/_components/stats";

const coin = getCoin();

async function getData(pool: any) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/pool/" + pool, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();

  const res_delegations = await fetch(process.env.SERVER_URL + "/api/pool/" + pool + "/delegations", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data_delegations = await res_delegations.json();
  const instruction = readFile("public/staking.md");
  const guiInstruction = readFile("public/delegator_gui.md");

  return { data, data_delegations: data_delegations.delegations, instruction, guiInstruction };
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  // read route params
  const id = params.block;
  return {
    title: "Mintlayer Staking Pool | " + params.pool,
  };
}

export default async function Pool({ params }: { params: { pool: string } }) {
  const pool = params.pool;
  const { data, data_delegations, instruction, guiInstruction }: any = await getData(pool);

  const { error } = data;

  if (error === "Invalid pool Id") {
    return <NotFound title={"Pool not found"} subtitle={"Pool not found"} />;
  }

  if (error === "Pool found in another network") {
    return <NotFound title={"Pool not found"} subtitle={"Pool found in another network"} id={pool} linkUrl={`/pool/${pool}`} />;
  }

  if (data.staker_balance < 1) {
    return (
      <>
        <Hero>
          <div className="w-full max-w-6xl md:mx-auto px-5">
            <div className="md:col-span-7 flex md:gap-4 flex-col md:flex-row md:items-center">
              <Link href="/pools" className="text-3xl md:text-5xl font-bold mt-4 md:mb-8 md:leading-[4rem] text-primary-100">
                Pools
              </Link>
              <div className="text-3xl md:text-5xl font-bold md:mt-4 mb-8 md:leading-[4rem]">/ {data.pool.slice(0, 6) + "..." + data.pool.slice(-6)}</div>
            </div>
            <div className="grid md:grid-cols-12 gap-4 mb-8">
              <div className="md:col-span-12 md:mr-20 relative">
                {data.mark && data.mark === 1 ? (
                  <div className="mark bg-primary-100 w-5 h-5 flex items-center justify-center rounded-full absolute top-5 right-5">
                    <Image src={check_icon} alt="" />
                  </div>
                ) : (
                  <></>
                )}
                <Summary
                  data={[
                    {
                      title: "Pool",
                      value: data.pool,
                      icon: icon_hash,
                      iconTooltip: "Pool",
                      qrCode: data.pool,
                      copy: data.pool,
                    },
                    {
                      title: "VRF public key",
                      value: data.vrf_public_key,
                      icon: icon_time,
                      iconTooltip: "VRF public key",
                    },
                    {
                      title: "Decommission Address",
                      value: data.decommission_destination,
                      icon: icon_time,
                      iconTooltip: "Decommission Address",
                      link: data.decommission_destination ? `/address/${data.decommission_destination}` : undefined,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </Hero>
        <div className="w-full max-w-6xl mx-auto mt-5 px-5">
          <div>
            <div className="text-3xl md:text-5xl font-bold md:mt-4 mb-8 md:leading-[4rem] text-primary-100">This pool is not active</div>
          </div>
          <div>
            <p className="mb-5">The pool has been decommissioned. You can still see the pool details and delegations.</p>
            <p>
              If you have delegated coins to this pool, you should withdraw them, as staking has ceased and no more rewards will be generated. After withdrawal,
              your coins will be locked for 7200 blocks (around 10 days)
            </p>
          </div>
        </div>
        <Delegations data={data_delegations} />
      </>
    );
  }

  const total = Number(data?.staker_balance) + Number(data?.delegations_balance);

  return (
    <>
      <Hero>
        <div className="w-full max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7 flex md:gap-4 flex-col md:flex-row md:items-center">
            <Link href="/pools" className="text-3xl md:text-5xl font-bold mt-4 md:mb-8 md:leading-[4rem] text-primary-100">
              Pools
            </Link>
            <div className="text-3xl md:text-5xl font-bold md:mt-4 mb-8 md:leading-[4rem]">/ {data.pool.slice(0, 6) + "..." + data.pool.slice(-6)}</div>
          </div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-10 md:mr-20 relative">
              {data.mark && data.mark === 1 ? (
                <div className="mark bg-primary-100 w-5 h-5 flex items-center justify-center rounded-full absolute top-5 right-5">
                  <Image src={check_icon} alt="" />
                </div>
              ) : (
                <></>
              )}
              <div className="flex flex-col h-full">
                <Summary
                  data={[
                    {
                      title: "Pool",
                      value: data.pool,
                      icon: icon_hash,
                      iconTooltip: "Pool",
                      qrCode: data.pool,
                      copy: data.pool,
                    },
                    {
                      title: "VRF public key",
                      value: data.vrf_public_key,
                      icon: icon_time,
                      iconTooltip: "VRF public key",
                    },
                    {
                      title: "Decommission Address",
                      value: data.decommission_destination,
                      icon: icon_time,
                      iconTooltip: "Decommission Address",
                      link: data.decommission_destination ? `/address/${data.decommission_destination}` : undefined,
                    },
                  ]}
                />
                <Stats pool_id={data.pool} />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 grid-rows-3 gap-4 md:-ml-20">
              <HeadingBox
                title={`${data.cost_per_block} ${coin}`}
                subtitle="Cost per block"
                icon={<Icon src={icon_fee} />}
                iconTooltip={`Pool takes ${data?.cost_per_block} ML of the reward before splitting`}
              />
              <HeadingBox
                title={`${data.margin_ratio_percent}`}
                subtitle="Margin ratio"
                icon={<Icon src={icon_fee} />}
                iconTooltip={`${((1 - data.margin_ratio) * 100).toFixed(1)}% of the reward after fixed pool reward goes to delegators group`}
              />
              <HeadingBox
                title={<FormatML value={data.staker_balance} />}
                subtitle="Pledge"
                icon={<Icon src={icon_fee} />}
                iconTooltip="Pool pledge ML amount"
              />
              <HeadingBox
                title={<FormatML value={total} />}
                subtitle="Balance"
                icon={<Icon src={icon_fee} />}
                iconTooltip="Pool pledge ML amount together with delegations"
              />
              <HeadingBox
                title={<FormatML value={data.effective_pool_balance} />}
                subtitle="Effective Balance"
                icon={<Icon src={icon_fee} />}
                iconTooltip="The effective balance is a value proportional to the balance, which has properties that prevent centralization of pools"
              />
            </div>
          </div>
        </div>
      </Hero>

      {/*<DelegateButton poolId={pool} />*/}

      <div className="w-full max-w-6xl mx-auto mt-0 px-5">
        <InfoExpand title={"How to become a delegator"}>
          <Tabs
            settings={[
              {
                label: "Browser Extension",
                content: (
                  <div className="remark">
                    <Remark>{guiInstruction}</Remark>
                  </div>
                ),
              },
              {
                label: "Command Line",
                content: (
                  <div className="remark">
                    <Remark>{instruction}</Remark>
                  </div>
                ),
              },
              {
                label: "GUI",
                content: (
                  <div>
                    <div>Watch our video instruction to find how to stake with GUI</div>
                    <div className="text-center">
                      <iframe
                        className="inline-block mt-4 aspect-video w-3/4"
                        src="https://www.youtube.com/embed/_PH1peISEfk?si=8htrAWcVsPPcTUTq"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </InfoExpand>
      </div>
      <Delegations data={data_delegations} />
    </>
  );
}
