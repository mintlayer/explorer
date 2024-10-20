"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ColumnBox } from "@/app/(homepage)/_components/column_box";
import transactionIcon from "@/app/(homepage)/_icons/24px/transactions.svg";

import { TransactionsList } from "../transactions-list";
import { TransactionsListMobile } from "../transactions-list-mobile";

const mapToTransaction = ({ amount, block, fee, input, label, output, timestamp, transaction }: any) => {
  return {
    transaction,
    label,
    block,
    input,
    output,
    amount,
    fee,
    timestamp,
    tx_hash: transaction,
    input_output: input + " inputs, " + output + " outputs",
    date: timestamp,
  };
};

const itemsPerPage = 10;

export const List = () => {
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<any>(0);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const res = await fetch("/api/transaction/last" + (offset ? "?offset=" + offset : ""), { cache: "no-store" });
      const data = await res.json();
      setTransactions(data.map(mapToTransaction));
      setLoading(false);
    };
    getData();
  }, [offset]);

  return (
    <div className="py-4 md:py-8">
      <div className="hidden max-w-6xl md:mx-auto md:block px-5">
        <TransactionsList transactions={transactions} skeleton={loading} itemsPerPage={itemsPerPage} offset={offset} setOffset={setOffset} />
      </div>
      <div className="flex max-w-6xl md:mx-auto md:hidden bg-white px-4 justify-center">
        <ColumnBox innerStyle=" " title={`Latest Transactions`} icon={<Image src={transactionIcon} alt="arrows symbolizing transaction" />}>
          <TransactionsListMobile transactions={transactions} skeleton={loading} itemsPerPage={itemsPerPage} offset={offset} setOffset={setOffset} />
        </ColumnBox>
      </div>
    </div>
  );
};
