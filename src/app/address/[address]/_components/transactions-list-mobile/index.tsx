"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/app/(homepage)/_components/transaction";

const convertToTransactionsArray = (data: any[]) => {
  const newArray = data.map((el) => {
    return {
      amount: el?.amount,
      block: el.block_height,
      fee: el.fee,
      input: el.inputs.length,
      label: el.hash.slice(0, 4) + "..." + el.hash.slice(-4),
      output: el.outputs.length,
      timestamp: el.timestamp,
      transaction: el.hash,
    };
  });

  return newArray;
};

const getTransactionData = async (tx: string) => {
  try {
    const res = await fetch("/api/transaction/" + tx, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return { [tx]: data };
  } catch (error) {
    console.error("Error fetching data for transaction", tx, error);
    return null;
  }
};

export function TransactionsListMobile({ transactions }: any) {
  const [data, setData] = useState({});
  const [page, setPage] = useState(1);
  const [transactionsArray, setTransactionsArray] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const per_page = 10;
  const lastPage = Math.ceil(transactions.length / per_page);
  const limit = per_page * page < transactions.length ? per_page * page : transactions.length;

  useEffect(() => {
    setLoading(true);

    const promises = transactions.slice(page * per_page - per_page, limit).map((tx: string) => getTransactionData(tx));

    Promise.all(promises)
      .then((results) => {
        const newData = results.reduce((acc, result) => {
          if (result) {
            return { ...acc, ...result };
          }
          return acc;
        }, {});

        setData((prevData) => ({ ...prevData, ...newData }));
      })
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });
  }, [transactions, page, limit]);

  useEffect(() => {
    setTransactionsArray(convertToTransactionsArray(Object.values(data)));
    setLoading(false);
  }, [data]);

  if (!transactionsArray.length)
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
      {transactionsArray?.map((value: any, i: number) => <Transaction key={value.transaction} {...value} />)}
      {page < lastPage && (
        <div className="flex justify-center my-4">
          <button disabled={loading} className={`border-2 px-2 py-2 font-bold ${loading && "text-gray-500"}`} onClick={() => setPage(page + 1)}>
            {page === lastPage - 1 ? "Show remaining transactions" : "Show 10 more transactions"}
          </button>
        </div>
      )}
    </>
  );
}
