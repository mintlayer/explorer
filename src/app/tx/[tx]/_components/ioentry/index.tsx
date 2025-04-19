import Image from "next/image";
import { Copy } from "@/app/tx/[tx]/_components/copy";

// icons
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import Link from "next/link";
import { getCoin } from "@/utils/network";
import { formatML } from "@/utils/numbers";

export const IOEntry = ({ data, expand, type, metadata }: any) => {
  let amount;
  let label = "";
  let link = "/";
  let coin = getCoin();

  if (type === "input") {
    if (data?.utxo?.value?.type === "TokenV1") {
      if (metadata?.tokens && metadata?.tokens[data?.utxo?.value?.token_id]) {
        coin = metadata.tokens[data?.utxo?.value?.token_id].token_ticker.string;
      } else {
        coin = "";
      }
    }

    if (data?.input) {
      if (data?.input?.source_type === "Transaction") {
        amount = data?.utxo?.value?.amount ? data?.utxo?.value?.amount?.decimal : "";
        label = data.input.source_id + ":" + data.input.index;
        link = `/tx/${data.input.source_id}#${data.input.index}`;
      }

      if (data?.input?.input_type === "Account") {
        amount = data?.input?.amount?.decimal;
        label = data?.input?.delegation_id;
        link = `/delegation/${label}`;
      }

      if (data?.input?.Utxo?.id?.BlockReward) {
        amount = "";
        label = "Stake reward";
        link = "";
      }
    }
  }

  if (type === "output") {
    if (data?.value?.type === "TokenV1") {
      if (metadata?.tokens && metadata?.tokens[data.value.token_id]) {
        coin = metadata.tokens[data?.value?.token_id].token_ticker.string;
      } else {
        coin = "";
      }
    }

    if (data.type === "Transfer") {
      amount = data.value.amount?.decimal;
      label = data.destination;
      link = `/address/${label}`;
    }

    if (data.type === "DelegateStaking") {
      amount = data.amount?.decimal;
      label = data.delegation_id;
      link = `/delegation/${label}`;
    }

    if (data.type === "CreateDelegationId") {
      amount = "";
      label = data.pool_id;
      link = `/pool/${label}`;
    }

    if (data.type === "CreateStakePool") {
      amount = data.data.amount?.decimal;
      label = data.data.staker;
      link = `/address/${label}`;
    }

    if (data.type === "LockThenTransfer" && !data.destination) { // TODO: fake LockThenTransfer, Burn in fact!
      amount = data.value.amount?.decimal;
      label = '';
      data.type = "Burn";
      link = `/address/${label}`;
    }

    if (data.type === "LockThenTransfer" && data.destination) { // true LockThenTransfer
      amount = data.value.amount?.decimal;
      label = data.destination;
      link = `/address/${label}`;
    }
  }

  const short_label = label.length > 20 ? label.substr(0, 10) + "..." + label.substr(label.length - 10, label.length) : label;

  const head = {
    label,
    short_label,
    amount,
  };

  return (
    <div className="mb-6">
      <div className={`flex items-center justify-between px-4 py-4 h-full transition-all duration-300 ${expand ? "bg-primary-100" : "bg-white"}`}>
        <div className={`flex items-center gap-1 font-medium ${expand ? "text-white" : "text-primary-110"}`}>
          <Image className={`${expand && "grayscale brightness-[1000%]"}`} src={icon_hash} alt={""} />
          {link ? <Link href={link}>{head.short_label}</Link> : <>{head.short_label}</>}
          <Copy imageStyle={`${expand && "grayscale brightness-[1000%]"}`} text={head.label} />
        </div>
        {amount && (
          <div className={`text-[14px] font-medium ${expand ? "text-white" : "text-black"}`}>
            {formatML(head.amount)} {coin}
          </div>
        )}
      </div>
      {expand ? (
        <div className="bg-white px-4 py-4 h-full">
          {Object.keys(data).map((item: any, index: number) => {
            return (
              <div key={index} className={type === "input" ? "grid grid-cols-2 gap-4 mb-4" : "grid grid-cols-4 gap-4 mb-4"}>
                <div className="col-span-1 flex text-base-black font-medium text-[12px] items-start">
                  <Image className="mr-2" src={icon_info} alt={""} />
                  {item.toLowerCase()}
                </div>
                <div className={"word-wrap-break-word col-span-3 text-base-gray text-[12px] overflow-scroll"}>
                  {typeof data[item] === "string" ? data[item] : <pre>{JSON.stringify(data[item], null, 2)}</pre>}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
