import Image from "next/image";
import { headers } from "next/headers";
import React from "react";

import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { getCoin } from "@/utils/network";
import check_icon from "@/app/(homepage)/_icons/24px/check.svg";

// icons
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import { NotFound } from "@/app/_components/not-found";
import { Icon } from "@/app/_components/heading_box/icon";
import { formatML } from "@/utils/numbers";
import Link from "next/link";
import { formatDate } from "@/utils/format";

const coin = getCoin();

async function getData(delegation: any) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/delegation/" + delegation, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();
  return { data };
}

export default async function Delegation({ params }: { params: { delegation: string } }) {
  const delegation = params.delegation;
  const { data }: any = await getData(delegation);
  const { error } = data;

  if (error === "Invalid pool Id") {
    return <NotFound title={"Delegation not found"} subtitle={"Delegation not found"} />;
  }

  if (error === "Delegation found in another network") {
    return <NotFound title={"Delegation not found"} subtitle={"Delegation found in another network"} id={delegation} linkUrl={`/delegation/${delegation}`} />;
  }

  return (
    <>
      <Hero>
        <div className="w-full max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Delegation</div>
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

              <Summary
                data={[
                  { title: "Delegation", icon: icon_hash, value: delegation, qrCode: delegation, copy: delegation, iconTooltip: "Delegation" },
                  {
                    title: "Pool",
                    value: data.pool_id,
                    icon: icon_hash,
                    iconTooltip: "Pool",
                    link: `/pool/${data.pool_id}`,
                  },
                  {
                    title: "Pool Status",
                    value: data.pool_data?.staker_balance?.decimal > 0 ? "Active" : <span className="text-red-800 font-bold">Decommissioned</span>,
                    icon: icon_hash,
                    iconTooltip: "Pool",
                    link: `/pool/${data.pool_id}`,
                  },
                  {
                    title: "Next Nonce",
                    value: data.next_nonce,
                    icon: icon_hash,
                    iconTooltip: "Next Nonce",
                  },
                  {
                    title: "Control address",
                    value: (
                      <Link href={`/address/${data.spend_destination}`} className="text-primary-100">
                        {data.spend_destination}
                      </Link>
                    ),
                    icon: icon_hash,
                    iconTooltip: "Address delegation is controlled by",
                  },
                  {
                    title: "Creation Date",
                    value: formatDate(data.delegation_creation_date),
                    icon: icon_hash,
                    iconTooltip: "Date delegation was created",
                  },
                  {
                    title: "Creation Block Height",
                    value: (
                      <Link href={`/block/${data.creation_block_height}`} className="text-primary-100 font-bold">
                        #{data.creation_block_height}
                      </Link>
                    ),
                    icon: icon_hash,
                    iconTooltip: "Block height delegation was created",
                  },
                ]}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 grid-rows-3 gap-4 md:-ml-20">
              <div>
                <HeadingBox title={`${formatML(data.balance)} ${coin}`} subtitle="Balance" icon={<Icon src={icon_fee} />} iconTooltip="Balance" />
              </div>
            </div>
          </div>
        </div>
      </Hero>
    </>
  );
}
