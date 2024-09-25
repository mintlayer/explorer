import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { Hero } from "@/app/_components/hero";
import { Summary } from "@/app/_components/summary";
import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import { BlockSequence } from "@/app/block/[block]/_components/block_sequence";
import { BlockDetails } from "@/app/block/[block]/_components/block_details";
import { Io } from "@/app/tx/[tx]/_components/io";
import { getCoin } from "@/utils/network";
import { formatML } from "@/utils/numbers";
import { formatDate } from "@/utils/format";
import { NotFound } from "@/app/_components/not-found";

// icons
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_community from "@/app/(homepage)/_icons/16px/community.svg";
import icon_tx from "@/app/(homepage)/_icons/16px/transactions.svg";
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_transactions from "@/app/(homepage)/_icons/24px/transactions.svg";
import icon_input from "@/app/tx/[tx]/input.svg";
import icon_output from "@/app/tx/[tx]/output.svg";

import { Pagination } from "./_components/pagination";
import { Icon } from "@/app/_components/heading_box/icon";

const coin = getCoin();

async function getData(block: string, transactionsPage: string, transactionsPerPage: string) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/block/" + block + `?transactionsPage=${transactionsPage}&transactionsPerPage=${transactionsPerPage}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });

  if (res.status === 404) {
    const data = await res.json();
    return { error: data.error };
  }

  const data = await res.json();

  const resLast = await fetch(process.env.SERVER_URL + "/api/block/tip", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const last = await resLast.json();
  return { data, last: last.block_height };
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  // read route params
  const id = params.block;
  return {
    title: "Mintlayer Block #" + params.block,
  };
}

export default async function Block({
  params,
  searchParams,
}: {
  params: { block: string };
  searchParams: { transactionsPage: string; transactionsPerPage: string };
}) {
  const { transactionsPage = "1", transactionsPerPage = "10" } = searchParams;
  const block = params.block;
  const { data, last, error }: any = await getData(block, transactionsPage, transactionsPerPage);

  console.log("error", error);

  if (error === "Invalid block Id") {
    return <NotFound title={"Invalid block Id"} subtitle={"Invalid block Id"} />;
  }

  if (error === "Block not found") {
    return <NotFound title={"Block not found"} subtitle={"Block not found"} id={`#${block}`} />;
  }

  if (error === "Block found in another network") {
    return <NotFound title={"Block not found"} subtitle={"Block found in another network"} id={`#${block}`} linkUrl={`/block/${block}`} />;
  }

  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Block #{data?.height}</div>
          </div>
          <div className="-mx-5">
            <BlockSequence current={data?.height} last={last} />
          </div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-9">
              <Summary
                data={[
                  {
                    title: "Block hash",
                    icon: icon_hash,
                    iconTooltip: "Block hash",
                    value: data?.hash,
                    copy: data?.hash,
                    qrCode: data?.hash,
                  },
                  {
                    title: "Block height",
                    icon: icon_block,
                    iconTooltip: "Block height",
                    value: "#" + data?.height,
                  },
                  {
                    title: "Validation date",
                    icon: icon_time,
                    iconTooltip: "Validation date",
                    value: formatDate(data?.timestamp),
                  },
                  {
                    title: "Validated by",
                    icon: icon_community,
                    iconTooltip: "Validated by",
                    value: (
                      <Link className="hover:text-primary-100" href={"/pool/" + data?.pool}>
                        {data?.pool}
                      </Link>
                    ),
                  },
                  {
                    title: "Transactions included",
                    icon: icon_tx,
                    iconTooltip: "Transactions included",
                    value: data?.transactions?.length,
                  },
                  {
                    title: "Parent hash",
                    iconTooltip: "Parent hash",
                    icon: icon_hash,
                    value: data?.parent_hash,
                  },
                ]}
              />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 grid-rows-3 gap-4">
              <div>
                <HeadingBox
                  title={`${formatML(data.summary.total_inputs)} ${coin}`}
                  subtitle="Total input value"
                  icon={<Icon src={icon_input} />}
                  iconTooltip="Total input value"
                />
              </div>
              <div>
                <HeadingBox
                  title={`${formatML(data.summary.total_outputs)} ${coin}`}
                  subtitle="Total output value"
                  icon={<Icon src={icon_output} />}
                  iconTooltip="Total output value"
                />
              </div>
              <div>
                <HeadingBox
                  title={`${formatML(data.summary.total_fee)} ${coin}`}
                  subtitle="Total transaction fees"
                  icon={<Icon src={icon_transactions} />}
                  iconTooltip="Total transaction fees"
                />
              </div>
            </div>
          </div>
        </div>
      </Hero>
      <div>
        <div className="max-w-6xl md:mx-auto py-6 px-5">
          <BlockDetails
            data={[
              { title: "Size", value: "-", icon: icon_info },
              { title: "Difficulty", value: "-", icon: icon_info },
              {
                title: "Merkle root",
                value: data?.info?.merkle_root,
                icon: icon_info,
              },
              { title: "Version", value: "-", icon: icon_info },
              { title: "Bits", value: "-", icon: icon_info },
              { title: "Median time", value: "-", icon: icon_info },
            ]}
          />
        </div>
      </div>
      <a className="relative top-[-90px]" id="transactions"></a>
      {data?.transactions.map((value: any, i: number) => {
        const tx_label = value.id.slice(0, 8) + "..." + value.id.slice(-8);

        return (
          <Io
            title={
              <Link className="hover:text-primary-100" href={"/tx/" + value.id}>
                {tx_label}
              </Link>
            }
            key={"tx" + i}
            data={value}
          />
        );
      })}
      <Pagination page={Number(transactionsPage)} itemsPerPage={Number(transactionsPerPage)} itemsCount={data.transactions_count} block={block} />
    </>
  );
}
