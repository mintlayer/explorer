"use client";
import { useEffect, useState } from "react";

import { Transaction } from "@/app/(homepage)/_components/transaction";

export function Transactions() {
  const [transactions, setTransactions] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [offset, setOffset] = useState<any>(0);

  const getBlocks = async () => {
    setLoading(true);
    const res = await fetch("/api/transaction/last" + (offset ? "?offset=" + offset : ""), { cache: "no-store" });
    const data = await res.json();
    setTransactions([...transactions, ...data]);
    setOffset(offset + 10);
    setLoading(false);
  };

  useEffect(() => {
    const getBlocks = async () => {
      const res = await fetch("/api/transaction/last", { cache: "no-store" });
      const data = await res.json();
      setTransactions(data);
      setOffset(offset + 10);
    };
    getBlocks();
  }, []);

  if (!transactions)
    return (
      <>
        <Transaction skeleton />
        <Transaction skeleton />
        <Transaction skeleton />
        <Transaction skeleton />
        <Transaction skeleton />
        <Transaction skeleton />
      </>
    );

  return (
    <>
      {transactions?.map((value: any, i: number) => <Transaction key={value.transaction} {...value} />)}
      <div className="flex justify-center mt-5">
        <button disabled={loading} className="border-2 px-2 py-2 font-bold" onClick={getBlocks}>
          Show 10 more transactions
        </button>
      </div>
    </>
  );
}
