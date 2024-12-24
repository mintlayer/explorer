"use client";
import { Fragment, useState } from "react";

import { formatML } from "@/utils/numbers";
import { getCoin } from "@/utils/network";
import { formatDate } from "@/utils/format";
import Link from "next/link";

import styles from "./styles.module.css";

const coin = getCoin();

const sorter = (a: any, b: any) => {
  if (a.unlock_time < b.unlock_time) return -1;
  if (a.unlock_time > b.unlock_time) return 1;
  return 0;
};

export const Wallet = ({ data }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white px-4 py-4 h-full custom-wallet-clip-path">
      <div className="font-bold text-2xl my-4 mx-4">Assets</div>
      <div className="flex flex-col gap-4">
        <table className="w-full">
          <thead className="bg-secondary-100 font-normal">
            <tr className="border-b border-secondary-100 last:border-b-0">
              <th className="text-left font-normal text-base-gray px-4 py-2">Asset</th>
              <th className="text-left font-normal px-4 py-2"></th>
              <th className="text-left font-normal px-4 py-2">Type</th>
              <th className="text-left font-normal px-4 py-2">Amount</th>
              <th className="font-normal text-right px-4 py-2">Lock</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <Fragment key={index}>
                <tr className="border-b border-secondary-100 last:border-b-0">
                  <td className={`px-4 py-2 text-base-gray font-bold ${expanded && "bg-primary-100"}`} colSpan={2}>
                    {item.type === "Coin" ? (
                      <span className={expanded ? `text-white` : `text-primary-100`}>{item.symbol}</span>
                    ) : (
                      <Link href={`/${item.type === 'NFT' ? 'nft' : ''}${item.type === 'Coin' ? 'token' : ''}/${item.token_id}`} className={expanded ? `text-white` : `text-primary-100`}>
                        {item.symbol}
                      </Link>
                    )}
                  </td>
                  <td className={`px-4 py-2 ${expanded && "bg-primary-100"}`}>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-secondary-100 text-primary-110">{item.type}</span>
                  </td>
                  <td className={`px-4 py-2 font-medium ${expanded && "bg-primary-100"}`}>
                    <span className={expanded ? `text-white` : `text-gray-700`}>
                      {formatML(item.amount.toString())} {item.coin}
                      {item.amount_locked > 0 ? (
                        <span className="">
                          {" "}
                          ({formatML(item.amount_locked.toString())} {coin} locked)
                        </span>
                      ) : (
                        <></>
                      )}
                    </span>
                  </td>
                  <td className={`px-4 py-2 text-right ${expanded && "bg-primary-100"}`}>
                    {item.vesting && item.vesting.length > 0 ? (
                      <span className={(expanded ? `text-white` : `text-primary-100`) + " cursor-pointer"} onClick={() => setExpanded(!expanded)}>
                        Details
                      </span>
                    ) : (
                      "No lock"
                    )}
                  </td>
                </tr>
                {expanded && item.vesting && item.vesting.length > 0 ? (
                  <>
                    <tr className="bg-secondary-100 text-[12px]">
                      <td className="px-4 py-2">#</td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2">Release date</td>
                      <td className="px-4 py-2">Amount</td>
                      <td></td>
                    </tr>
                    {item.vesting.sort(sorter).map((vesting: any, index: number) => (
                      <tr key={index} className="bg-secondary-100 text-[12px]">
                        <td className="px-4 py-2 border-b border-white">{index + 1}</td>
                        <td className="px-4 py-2 border-b border-white"></td>
                        <td className="px-4 py-2 border-b border-white">
                          {vesting.unlock_block && vesting.unlock_block > 0 ? "Block #" + vesting.unlock_block + " or approx. " : <></>}
                          {formatDate(vesting.unlock_time)}
                        </td>
                        <td className="px-4 py-2 border-b border-white">
                          {formatML(vesting.amount.toString())} {coin}
                        </td>
                        <td className="px-4 py-2 border-b border-white"></td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
