import Image from "next/image";
import Link from "next/link";

import icon_tx from "@/app/(homepage)/_icons/16px/transactions.svg";
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_coin from "@/app/(homepage)/_icons/16px/coin.svg";
import icon_fee from "@/app/(homepage)/_icons/16px/fee.svg";
import icon_io from "@/app/(homepage)/_icons/16px/from_to.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_check from "@/app/(homepage)/_icons/24px/check.svg";
import { formatML } from "@/utils/numbers";
import { formatDate } from "@/utils/format";

import styles from "./styles.module.css";

export const Table = ({ data, title, handleMore, skeleton, itemsPerPage, showMoreButton = false }: any) => {
  return (
    <div className="bg-white px-4 py-4 h-full">
      <div className="font-bold text-2xl mb-4">{title}</div>
      {/*<div className="flex items-center gap-2 mb-4">*/}
      {/*  <div className="mr-4"}>Sort by:</div>*/}
      {/*  <div className="flex items-center gap-2">*/}
      {/*    <div className="flex items-center gap-2 bg-secondary-100 text-black rounded-3xl px-4 py-1.5 text-[14px] bg-primary-100 text-white"><Image className="w-4 h-4" src={icon_check} alt={''} /> Most recent</div>*/}
      {/*    <div className="flex items-center gap-2 bg-secondary-100 text-black rounded-3xl px-4 py-1.5 text-[14px]">Highest value</div>*/}
      {/*    <div className="flex items-center gap-2 bg-secondary-100 text-black rounded-3xl px-4 py-1.5 text-[14px]">Highest fee</div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <table className="w-full">
        <thead className="bg-secondary-100">
          <tr>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Transaction hash" className="m-auto" alt="" src={icon_tx} />
              <span className="hidden">Tx Hash</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Block height" className="m-auto" alt="" src={icon_block} />
              <span className="hidden">Block</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Amount transfered" className="m-auto" alt="" src={icon_coin} />
              <span className="hidden">Amount</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Transaction fee" className="m-auto" alt="" src={icon_fee} />
              <span className="hidden">Fee</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Inputs and outputs" className="m-auto" alt="" src={icon_io} />
              <span className="hidden">Input Output</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-base-dark uppercase px-6">
              <Image data-tooltip-id="tooltip" data-tooltip-content="Date and time" className="m-auto" alt="" src={icon_time} />
              <span className="hidden">Date</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {skeleton
            ? Array(itemsPerPage)
                .fill(null)
                .map((v, index) => {
                  return (
                    <tr key={index} className={"border-b border-gray-100"}>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                    </tr>
                  );
                })
            : data.map((item: any, index: number) => {
                return (
                  <tr className="border-b border-gray-100" key={index}>
                    <td className="text-center py-4 px-6">
                      <Link className="text-primary-110 font-semibold" href={`/tx/${item.tx_hash}`}>
                        {item.tx_hash.substr(0, 5)}&hellip;
                        {item.tx_hash.substr(item.tx_hash.length - 5, item.tx_hash.length)}
                      </Link>
                    </td>
                    <td className="text-center py-4 px-6">
                      <Link className="text-primary-110 font-semibold" href={`/block/${item.block}`}>
                        #{item.block}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-xs">{formatML(item.amount)}</td>
                    <td className="text-center py-4 px-6 font-medium text-xs">{item.fee}</td>
                    <td className="text-center py-4 px-6 text-xs">{item.input_output}</td>
                    <td className="text-center py-4 px-6 text-xs">{formatDate(item.date)}</td>
                  </tr>
                );
              })}
        </tbody>
      </table>
      {showMoreButton && (
        <div>
          <div className="flex items-center justify-center mt-4">
            <div className="border-2 px-2 py-2 font-bold cursor-pointer hover:bg-secondary-100" onClick={handleMore}>
              Show 10 more transactions
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
