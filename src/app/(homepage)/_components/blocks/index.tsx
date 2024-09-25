"use client";
import { useEffect, useState } from "react";

import { Block } from "@/app/(homepage)/_components/block";

export function Blocks() {
  const [blocks, setBlocks] = useState<any>(null);
  const [beforeBlocks, setBeforeBlocks] = useState<any>(null);

  const getBlocks = async () => {
    const res = await fetch("/api/block/last" + (beforeBlocks ? "?before=" + beforeBlocks : ""), { cache: "no-store" });
    const data = await res.json();
    setBlocks([...blocks, ...data]);
    setBeforeBlocks(data[data.length - 1].block - 1);
  };

  useEffect(() => {
    const getBlocks = async () => {
      const res = await fetch("/api/block/last" + (beforeBlocks ? "?before=" + beforeBlocks : ""), { cache: "no-store" });
      const data = await res.json();
      setBlocks(data);
      setBeforeBlocks(data[data.length - 1].block - 1);
    };
    getBlocks();
  }, []);

  const maxTransactions = blocks?.reduce((max: number, block: any) => {
    return Math.max(max, block.transactions);
  }, 0);

  if (!blocks)
    return (
      <>
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
        <Block skeleton />
      </>
    );

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
