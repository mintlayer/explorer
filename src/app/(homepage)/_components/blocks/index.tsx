"use client";
import { useState } from "react";

import { Block } from "@/app/(homepage)/_components/block";

export function Blocks({ initialBlocks }: { initialBlocks: any[] }) {
  const [blocks, setBlocks] = useState<any[]>(initialBlocks);
  const [beforeBlocks, setBeforeBlocks] = useState<number | null>(initialBlocks[initialBlocks.length - 1]?.block ? initialBlocks[initialBlocks.length - 1].block - 1 : null);

  const getBlocks = async () => {
    const res = await fetch("/api/block/last" + (beforeBlocks ? "?before=" + beforeBlocks : ""), { cache: "no-store" });
    const data = await res.json();
    setBlocks([...blocks, ...data]);
    if (data.length > 0) {
      setBeforeBlocks(data[data.length - 1].block - 1);
    }
  };

  const maxTransactions = blocks?.reduce((max: number, block: any) => {
    return Math.max(max, block.transactions);
  }, 0);

  return (
    <>
      {blocks?.map((value: any, i: number) => <Block maxTransactions={maxTransactions} key={value.block} {...value} />)}
      <div className="flex justify-center mt-5">
        <button className="border-2 px-2 py-2 font-bold" onClick={getBlocks}>
          Show 10 more block
        </button>
      </div>
    </>
  );
}
