"use client";

import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import { useEffect, useState } from "react";
import icon_community from "@/app/(homepage)/_icons/16px/community.svg";
import { FormatML } from "@/app/_components/number";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import { Icon } from "@/app/_components/heading_box/icon";

async function getData() {
  const res = await fetch("/api/pool/summary", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return { data };
}

export function Summary() {
  const [data, setData] = useState<any>(null);
  const [data_transaction, setDataTransaction] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, data_transaction }: any = await getData();
      setData(data);
      setDataTransaction(data_transaction);
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <>
        <div className="md:col-span-2">
          <HeadingBox
            title={<div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
            subtitle="APY"
            icon={<Icon src={icon_fee} />}
            iconTooltip="APY"
          />
        </div>
        <div className="md:col-span-2">
          <HeadingBox
            title={<div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
            subtitle="Total pools"
            icon={<Icon src={icon_community} />}
            iconTooltip="Total pools"
          />
        </div>
        <div className="md:col-span-2">
          <HeadingBox
            title={<div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
            subtitle="Total delegations"
            icon={<Icon src={icon_community} />}
            iconTooltip="Total delegations"
          />
        </div>
        <div className="md:col-span-3">
          <HeadingBox
            title={<div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
            subtitle="Total stake"
            icon={<Icon src={icon_fee} />}
            iconTooltip="Total stake"
          />
        </div>
        <div className="md:col-span-3">
          <HeadingBox
            title={<div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
            subtitle="Total effective stake"
            icon={<Icon src={icon_fee} />}
            iconTooltip="Total effective stake"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.total_apy} %`} subtitle="APY" icon={<Icon src={icon_fee} />} iconTooltip="APY" />
      </div>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.validators_count}`} subtitle="Total pools" icon={<Icon src={icon_community} />} iconTooltip="Total pools" />
      </div>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.delegation_count}`} subtitle="Total delegations" icon={<Icon src={icon_community} />} iconTooltip="Total delegations" />
      </div>
      <div className="md:col-span-3">
        <HeadingBox title={<FormatML value={data.total_amount} />} subtitle="Total stake" icon={<Icon src={icon_fee} />} iconTooltip="Total stake" />
      </div>
      <div className="md:col-span-3">
        <HeadingBox
          title={<FormatML value={data.total_effective_amount} />}
          subtitle="Total effective stake"
          icon={<Icon src={icon_fee} />}
          iconTooltip="Total effective stake"
        />
      </div>
    </>
  );
}
