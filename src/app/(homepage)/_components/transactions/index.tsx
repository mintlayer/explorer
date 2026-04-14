"use client";
import { useState } from "react";

import { Transaction } from "@/app/(homepage)/_components/transaction";

export function Transactions({
  initialTransactions,
  initialMempoolTransactions = [],
}: {
  initialTransactions: any[];
  initialMempoolTransactions?: any[];
}) {
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(initialTransactions.length);

  const getBlocks = async () => {
    setLoading(true);
    const res = await fetch("/api/transaction/last" + (offset ? "?offset=" + offset : ""), { cache: "no-store" });
    const data = await res.json();
    setTransactions([...transactions, ...data]);
    setOffset(offset + 10);
    setLoading(false);
  };

  return (
    <>
      {initialMempoolTransactions?.map((value: any) => <Transaction key={`mempool-${value.transaction}`} {...value} />)}
      {transactions?.map((value: any, i: number) => <Transaction key={value.transaction} {...value} />)}
      <div className="flex justify-center mt-5">
        <button disabled={loading} className="border-2 px-2 py-2 font-bold" onClick={getBlocks}>
          Show 10 more transactions
        </button>
      </div>
    </>
  );
}
