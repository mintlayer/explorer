"use client";
import { useEffect, useState } from "react";
import { Table } from "@/app/_components/table";
import Image from "next/image";

import arrow from "@/app/(homepage)/_icons/16px/arrow.svg";

export function TransactionsList({ transactions }: any) {
  const [data, setData] = useState({});
  const [page, setPage] = useState(1);
  const [showMoreButton, setShowMoreButton] = useState(false);

  const per_page = 10;

  useEffect(() => {
    const getData = async (tx: any) => {
      const res = await fetch("/api/transaction/" + tx, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      return data;
    };

    const limit = per_page * page < transactions.length ? per_page * page : transactions.length;

    if (per_page * page < transactions.length) {
      setShowMoreButton(true);
    } else {
      setShowMoreButton(false);
    }

    for (let i = page * per_page - per_page; i < limit; i++) {
      getData(transactions[i]).then((data: any) => {
        setData((prevData: any) => {
          return {
            ...prevData,
            [transactions[i]]: data,
          };
        });
      });
    }
  }, [transactions, page]);

  const table_data = Object.values(data).map((item: any) => {
    return {
      tx_hash: item.hash,
      block: item.block_height,
      amount: item.amount || 0,
      fee: item.fee,
      input_output: (
        <div className="flex flex-row whitespace-nowrap gap-1">
          <span className="font-medium">{item.inputs.length}</span> inputs
          <Image src={arrow} alt="" />
          <span className="font-medium">{item.outputs.length}</span> outputs
        </div>
      ),
      date: item.timestamp,
    };
  });

  const handleMore = () => {
    setPage(page + 1);
  };

  table_data.sort((a: any, b: any) => {
    return b.date - a.date;
  });

  return (
    <div>
      <Table data={table_data} title="Transactions" handleMore={handleMore} showMoreButton={showMoreButton} />
    </div>
  );
}
