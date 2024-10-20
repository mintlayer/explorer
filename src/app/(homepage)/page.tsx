import Image from "next/image";
import Link from "next/link";

import { Search } from "@/app/_components/search";
import { ColumnBox } from "@/app/(homepage)/_components/column_box";

import { Blocks } from "@/app/(homepage)/_components/blocks";
import { Transactions } from "@/app/(homepage)/_components/transactions";
import { Summary } from "@/app/(homepage)/_components/summary";

import transactions from "./_icons/24px/transactions.svg";
import block from "./_icons/24px/block.svg";
import React from "react";

const menuLinks = [
  { label: "Transactions", href: "/transactions" },
  { label: "Blocks", href: "/blocks" },
  { label: "Pools", href: "/pools" },
  { label: "Tokens", href: "/tokens" },
  { label: "NFT", href: "/nft" },
];

export default async function Home() {
  return (
    <>
      <div className="w-full bg-secondary-100">
        <div className="absolute w-full bottom-0 overflow-hidden top-0 h-[350px]">
          <div className="absolute top-[-504px] left-[534px] w-[834px] h-[834px] rounded-[100%] blur-[100px] bg-white opacity-50"></div>
          <div className="absolute top-[-334px] left-[-300px] w-[834px] h-[834px] rounded-[100%] blur-[100px] bg-primary-100 opacity-50"></div>
        </div>

        <div className="w-full max-w-[1016px] px-5 md:mx-auto">
          <div className="relative grid md:grid-cols-12 gap-6 mb-8 z-20 items-end">
            <div className="md:col-span-7 relative z-20">
              <div className="text-2xl md:text-5xl font-bold mt-4 mb-4 md:mb-8 md:leading-[4rem]">Explore the ledger - search for data here</div>
              <Search />
            </div>
            <div className="md:col-span-5 grid grid-cols-2 grid-rows-1 gap-4 md:mt-8">
              <Summary />
              <div className="col-span-2 bg-white text-center text-xs py-1.5 px-3">
                Do you have any data to suggest?{" "}
                <a href="mailto:support@mintlayer.org" className="text-primary-100 underline">
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="w-full max-w-[1016px] px-5 md:mx-auto">
          {/* <div className="flex justify-between gap-6 mt-6 py-4 px-4  bg-white overflow-x-scroll md:overflow-x-hidden -mx-6 md:mx-0">
            {menuLinks.map(({ label, href }, i: number) => {
              return (
                <Link key={i} href={href} className="grow">
                  <div
                    className={
                      "text-xl cursor-pointer px-4 py-2 rounded text-center bg-secondary-100 text-base-black font-semibold hover:bg-primary-100 hover:text-white"
                    }
                  >
                    {label}
                  </div>
                </Link>
              );
            })}
          </div> */}
          <div className="relative grid md:grid-cols-12 gap-6 mb-5 mt-4 md:mt-8 -mx-6 md:mx-0">
            <div className="md:col-span-7 col-span-1">
              <ColumnBox title="Latest Transactions" icon={<Image src={transactions} alt="" />}>
                <Transactions />
              </ColumnBox>
            </div>
            <div className="md:col-span-5 col-span-1">
              <ColumnBox title="Latest Blocks" icon={<Image src={block} alt="" />}>
                <Blocks />
              </ColumnBox>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
