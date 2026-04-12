"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ColumnBox } from "@/app/(homepage)/_components/column_box";
import transactionIcon from "@/app/(homepage)/_icons/24px/transactions.svg";

import { BlocksList } from "../blocks-list";
import { BlocksListMobile } from "../blocks-list-mobile";

const itemsPerPage = 10;

const withMaxTransactions = (blocks: any[]) => {
  const maxTransactions = blocks.reduce((max: number, block: any) => {
    return Math.max(max, block.transactions);
  }, 0);

  return blocks.map((block: any) => ({ ...block, maxTransactions }));
};

export const List = ({ initialBlocks }: { initialBlocks: any[] }) => {
  const [blocks, setBlocks] = useState<any[]>(withMaxTransactions(initialBlocks));
  const [loading, setLoading] = useState<boolean>(false);
  const [before, setBefore] = useState<number>(0);
  const [lastBlock, setLastBlock] = useState<number>(initialBlocks[0]?.block ?? 0);
  const skipInitialFetch = useRef(initialBlocks.length > 0);

  useEffect(() => {
    const getData = async () => {
      if (skipInitialFetch.current && before === 0) {
        skipInitialFetch.current = false;
        return;
      }

      setLoading(true);

      const res = await fetch("/api/block/last" + (before ? "?before=" + before : ""), { cache: "no-store" });
      const data = await res.json();

      setBlocks(withMaxTransactions(data));

      if (!before) {
        setLastBlock(data[0].block);
      }

      setLoading(false);
    };
    getData();
  }, [before]);

  return (
    <div className="py-4 md:py-8">
      <div className="hidden max-w-6xl md:mx-auto md:block px-5">
        <BlocksList blocks={blocks} skeleton={loading} itemsPerPage={itemsPerPage} before={lastBlock} setBefore={setBefore} lastBlock={lastBlock} />
      </div>
      <div className="flex max-w-6xl md:mx-auto md:hidden bg-white px-4 justify-center">
        <ColumnBox innerStyle=" " title={`Latest Blocks`} icon={<Image src={transactionIcon} alt="arrows symbolizing transaction" />}>
          <BlocksListMobile blocks={blocks} skeleton={loading} itemsPerPage={itemsPerPage} before={lastBlock} setBefore={setBefore} lastBlock={lastBlock} />
        </ColumnBox>
      </div>
    </div>
  );
};
