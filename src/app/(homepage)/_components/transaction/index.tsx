import Link from "next/link";
import Image from "next/image";

import { getCoin } from "@/utils/network";
import { formatDate } from "@/utils/format";

import i_transactions from "../../_icons/16px/transactions.svg";
import i_coin from "../../_icons/16px/coin.svg";
import i_fee from "../../_icons/16px/fee.svg";
import i_block from "../../_icons/16px/block.svg";
import i_time from "../../_icons/16px/time.svg";
import i_from_to from "../../_icons/16px/from_to.svg";
import i_copy from "../../_icons/16px/copy.svg";
import icon_arrow from "../../_icons/16px/arrow.svg";

import styles from "./styles.module.css";
import { Copy } from "@/app/tx/[tx]/_components/copy";

const coin = getCoin();

export const Transaction = ({ transaction, amount, fee, block, timestamp, input, output, label, skeleton }: any) => {
  if (skeleton)
    return (
      <div className="bg-white pb-5 pt-6 px-6 grid grid-cols-2 gap-2 border-b-2 border-secondary-100 md:px-0 animate-pulse">
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-20 h-4 rounded block"></div>
        </div>
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-24 h-4 rounded block"></div>
        </div>
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-16 h-4 rounded block"></div>
        </div>
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-16 h-4 rounded block"></div>
        </div>
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-20 h-4 rounded block"></div>
        </div>
        <div className="flex flex-row items-center text-xs">
          <div className="bg-secondary-100 w-4 h-4 rounded-full mr-2 block"></div>
          <div className="bg-secondary-100 w-24 h-4 rounded block"></div>
        </div>
      </div>
    );

  return (
    <div className="bg-white pb-5 pt-6 px-6 grid grid-cols-2 gap-2 border-b-2 border-secondary-100 md:px-0">
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_transactions} alt="" data-tooltip-id="tooltip" data-tooltip-content="Transaction ID" />{" "}
        <Link className="font-bold text-base text-primary-110" href={`/tx/${transaction}`}>
          {label}
        </Link>{" "}
        <Copy text={transaction} />
      </div>
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_block} alt="" data-tooltip-id="tooltip" data-tooltip-content="Block height" />{" "}
        <Link className="font-bold text-base text-primary-110" href={`/block/${block}`}>
          #{block}
        </Link>
      </div>
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_coin} alt="" data-tooltip-id="tooltip" data-tooltip-content="Transfer amount" /> {amount} {coin}
      </div>
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_time} alt="" data-tooltip-id="tooltip" data-tooltip-content="Transaction date and time" />{" "}
        {formatDate(timestamp)}
      </div>
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_fee} alt="" data-tooltip-id="tooltip" data-tooltip-content="Fee" /> {fee || 0} {coin}
      </div>
      <div className="flex flex-row items-center text-xs">
        <Image className="w-4 h-4 mr-2" src={i_from_to} alt="" /> <b className="mr-[2px] font-semibold">{input}</b> inputs{" "}
        <Image className="w-4 h-4 mx-2" src={icon_arrow} alt={""} /> <b className="mr-[2px] font-semibold">{output}</b> outputs
      </div>
    </div>
  );
};
