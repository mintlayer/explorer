"use client";
import { useEffect, useState } from "react";

import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import community from "@/app/(homepage)/_icons/24px/community.svg";
import txs from "@/app/(homepage)/_icons/24px/txs.svg";
import fee from "@/app/(homepage)/_icons/24px/fee.svg";
import { Icon } from "@/app/_components/heading_box/icon";

export function Summary() {
  const [data, setData] = useState<any>(null);
  const [data_transaction, setDataTransaction] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const resarray = Promise.all([
        fetch("/api/pool/summary", {
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/transaction/total", {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      const [res, res_transactions] = await resarray;
      const [data, data_transaction] = await Promise.all([res.json(), res_transactions.json()]);
      setData(data);
      setDataTransaction(data_transaction);
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="col-span-2">
        <HeadingBox
          title={data ? `${data.total_apy}%` : <div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
          subtitle="Current APY"
          icon={<Icon src={fee} />}
          button={{ label: "Start staking", link: "/pools" }}
          iconTooltip="Current APY"
        />
      </div>
      <div>
        <HeadingBox
          title={data ? data.validators_count : <div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
          subtitle="Validators"
          icon={<Icon src={community} />}
          iconTooltip="Validators"
        />
      </div>
      <div>
        <HeadingBox
          title={data_transaction ? data_transaction : <div className="bg-secondary-100 w-20 h-4 mt-1 mb-1 rounded block animate-pulse"></div>}
          subtitle="Total transactions"
          icon={<Icon src={txs} />}
          iconTooltip="Total transactions"
        />
      </div>
    </>
  );
}
