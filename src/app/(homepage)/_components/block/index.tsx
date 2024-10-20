import Link from "next/link";
import Image from "next/image";

import i_transactions from "../../_icons/16px/transactions.svg";
import i_block from "../../_icons/16px/block.svg";
import i_time from "../../_icons/16px/time.svg";
import i_community from "../../_icons/16px/community.svg";
import { formatDate } from "@/utils/format";

export const Block = ({ block, pool, pool_label, transactions, datetime, skeleton, maxTransactions }: any) => {
  if (skeleton)
    return (
      <div className="bg-secondary-100 p-[2px] mb-[10px] custom-homepage-block-clip-path animate-pulse">
        <div className="inline-block bg-white w-full relative custom-homepage-block-clip-path">
          <div className="absolute top-0 left-0 h-full bg-secondary-100 opacity-70"></div>
          <div className="px-4 py-3 grid grid-cols-5 gap-2 relative">
            <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-2">
              <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
              <div className="bg-secondary-100 w-16 h-5 rounded block"></div>
            </div>
            <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-3">
              <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
              <div className="bg-secondary-100 w-24 h-5 rounded block"></div>
            </div>
            <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-2">
              <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
              <div className="bg-secondary-100 w-8 h-4 rounded block"></div>
            </div>
            <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-3">
              <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
              <div className="bg-secondary-100 w-24 h-4 rounded block"></div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-secondary-100 p-[2px] mb-[10px] custom-homepage-block-clip-path">
      <div className="inline-block bg-white w-full relative custom-homepage-block-clip-path">
        <div className="absolute top-0 left-0 h-full bg-secondary-100 opacity-70" style={{ width: (transactions / maxTransactions) * 100 + "%" }}></div>
        <div className="px-4 py-3 grid grid-cols-5 gap-2 relative">
          <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-2">
            <Image className="w-5 h-5 mr-2" src={i_block} alt="Block height" data-tooltip-id="tooltip" data-tooltip-content="Block height" />{" "}
            <Link className="font-bold text-base text-primary-110" href={`/block/${block}`}>
              #{block}
            </Link>
          </div>
          <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-3">
            <Image className="w-5 h-5 mr-2" src={i_community} alt="Block found by" data-tooltip-id="tooltip" data-tooltip-content="Block found by" /> by{" "}
            <Link className="text-[12px] ml-1 text-primary-110" href={`/pool/${pool}`}>
              {pool_label}
            </Link>
          </div>
          <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-2">
            <Image
              className="w-5 h-5 mr-2"
              src={i_transactions}
              alt="Amount of transactions"
              data-tooltip-id="tooltip"
              data-tooltip-content="Amount of transactions"
            />
            <b className="font-semibold mr-[2px]">{transactions}</b> tx
          </div>
          <div className="flex flex-row items-center text-xs whitespace-nowrap col-span-3">
            <Image className="w-5 h-5 mr-2" src={i_time} alt="" data-tooltip-id="tooltip" data-tooltip-content="Block date and time" /> {formatDate(datetime)}
          </div>
        </div>
      </div>
    </div>
  );
};
