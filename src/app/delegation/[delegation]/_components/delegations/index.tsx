"use client";
import { Switch } from "@/app/tx/[tx]/_components/switch";
import { Summary } from "@/app/_components/summary";
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_coin from "@/app/(homepage)/_icons/16px/coin.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_community from "@/app/(homepage)/_icons/16px/community.svg";
import Link from "next/link";
import React from "react";

export const Delegations = ({ data }: any) => {
  const [hideZero, setHideZero] = React.useState(true);
  const data_delegations = data;

  if (data_delegations.length === 0) {
    return <div></div>;
  }

  const balance_filter = (value: any) => {
    if (hideZero) {
      return value?.balance > 1;
    }
    return true;
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-5">
      <div className="flex justify-between mb-8 flex-col md:flex-row">
        <div className="text-xl font-bold">Delegations</div>
        <div className="flex items-center md:mt-0 mt-5 ml-auto">
          <span className="mr-3">Hide zero-balance</span>
          <Switch checked={hideZero} onChange={() => setHideZero(!hideZero)} />
        </div>
      </div>

      {data_delegations?.filter(balance_filter).map((value: any, i: number) => {
        return (
          <div className="mb-6" key={"s" + i}>
            <Summary
              data={[
                {
                  title: "Delegation Id",
                  icon: icon_hash,
                  iconTooltip: "Delegation Id",
                  value: value.delegation_id,
                },
                {
                  title: "Next nonce",
                  icon: icon_time,
                  iconTooltip: "Next nonce",
                  value: value.next_nonce,
                },
                {
                  title: "Spend destination",
                  icon: icon_community,
                  iconTooltip: "Spend destination",
                  value: (
                    <Link className="text-primary-100" href={"/address/" + value.spend_destination}>
                      {value.spend_destination}
                    </Link>
                  ),
                },
                {
                  title: "Balance",
                  icon: icon_coin,
                  iconTooltip: "Balance",
                  value: value?.balance,
                  copy: true,
                },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
};
