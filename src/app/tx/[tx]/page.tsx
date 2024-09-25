import { headers } from "next/headers";

import { Summary } from "@/app/_components/summary";
import { Hero } from "@/app/_components/hero";
import { Io } from "@/app/tx/[tx]/_components/io";
import { HeadingBox } from "@/app/_components/heading_box";
import { getCoin } from "@/utils/network";
import { formatDate } from "@/utils/format";
import { formatML } from "@/utils/numbers";

// icons
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_size from "@/app/(homepage)/_icons/16px/size.svg";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import icon_transfer from "@/app/(homepage)/_icons/24px/transfer.svg";
import icon_from_to from "@/app/(homepage)/_icons/24px/from_to.svg";
import icon_transactions from "@/app/(homepage)/_icons/24px/txs.svg";
import { NotFound } from "@/app/_components/not-found";
import { Icon } from "@/app/_components/heading_box/icon";

const coin = getCoin();

export const metadata = {
  title: "Mintlayer Transaction Details",
  description: "Transaction details",
};

async function getData(tx: any) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/transaction/" + tx, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });

  const data = await res.json();

  if (res.status === 400 || res.status === 404) {
    return { data };
  }

  const tokens: any = {};

  // fetch tokens based on data.used_tokens
  for (const token of data.used_tokens) {
    const res = await fetch(process.env.SERVER_URL + "/api/token/" + token, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
    });
    const tokenData = await res.json();
    tokens[token] = tokenData;
  }

  return { data, tokens };
}

export default async function Tx({ params }: { params: { tx: string } }) {
  const tx = params.tx;
  const { data, tokens }: any = await getData(tx);

  if (!data || data.error === "Invalid Txn hash") {
    return <NotFound title={"Transaction not found"} subtitle={"Invalid Transaction Id"} />;
  }

  if (data.error === "Transaction not found") {
    return <NotFound title={"Transaction not found"} subtitle={"Transaction not found"} id={tx} />;
  }

  if (data.error === "Transaction found in another network") {
    return <NotFound title={"Transaction not found"} subtitle={"Transaction found in another network"} id={tx} linkUrl={`/tx/${tx}`} />;
  }

  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Transaction</div>
          </div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-8 md:mr-20">
              <Summary
                layout="narrow"
                data={[
                  {
                    title: "Transaction hash",
                    icon: icon_hash,
                    iconTooltip: "Transaction hash",
                    value: data.hash,
                    qrCode: data.hash,
                    copy: data.hash,
                  },
                  ...(data.timestamp && [
                    {
                      title: "Timestamp",
                      value: formatDate(data.timestamp),
                      icon: icon_time,
                      iconTooltip: "Timestamp",
                    },
                  ]),
                  {
                    title: "Block",
                    value: <span className="text-primary-100 font-bold text-base">{data.block_height}</span>,
                    icon: icon_block,
                    iconTooltip: "Block",
                    link: `/block/${data.block_height}`,
                  },
                  ...(data.timestamp === "" && data.confirmations === 0
                    ? [
                        {
                          title: "Status",
                          value: "Unconfirmed",
                          icon: icon_time,
                          iconTooltip: "Status",
                        },
                      ]
                    : []),
                  {
                    title: "Version",
                    value: data.version_byte,
                    icon: icon_size,
                    iconTooltip: "Version",
                  },
                ]}
              />
            </div>
            <div className="md:col-span-4 grid md:grid-cols-2 grid-cols-1 grid-rows-2 gap-4 md:-ml-20">
              <div>
                <HeadingBox
                  title={data.confirmations <= 10 ? `${data.confirmations}/10 blocks` : `${data.confirmations} blocks`}
                  subtitle="Confirmation status"
                  icon={<Icon src={icon_transactions} />}
                  progress={[data.confirmations, 10]}
                  iconTooltip="Confirmation status"
                />
              </div>
              <div>
                <HeadingBox
                  info={[
                    { title: data.inputs.length, subtitle: "Input" },
                    { title: data.outputs.length, subtitle: "Output" },
                  ]}
                  icon={<Icon src={icon_from_to} />}
                  iconTooltip="Input Output"
                />
              </div>
              <div>
                <HeadingBox
                  title={`${formatML(data.fee || 0)} ${coin}`}
                  subtitle="Transaction fee"
                  icon={<Icon src={icon_fee} />}
                  iconTooltip="Transaction fee"
                />
              </div>
              <div>
                <HeadingBox
                  title={`${formatML(data.amount)} ${coin}`}
                  subtitle="Total value transferred"
                  icon={<Icon src={icon_transfer} />}
                  iconTooltip="Total value transferred"
                />
              </div>
            </div>
          </div>
        </div>
      </Hero>
      <Io data={{ inputs: data.inputs, outputs: data.outputs }} tokens={tokens} />
    </>
  );
}
