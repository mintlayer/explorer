import Image from "next/image";

import { Summary } from "@/app/_components/summary";
import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import txs from "@/app/(homepage)/_icons/24px/txs.svg";
import { Hero } from "@/app/_components/hero";
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import { headers } from "next/headers";
import { TransactionsList } from "@/app/address/[address]/_components/transactions-list";
import { Delegations } from "@/app/address/[address]/_components/delegations";

import { Wallet } from "./_components/wallet";
import { ColumnBox } from "@/app/(homepage)/_components/column_box";
import transactions from "@/app/(homepage)/_icons/24px/transactions.svg";
import { TransactionsListMobile } from "./_components/transactions-list-mobile";
import { NotFound } from "@/app/_components/not-found";
import { Icon } from "@/app/_components/heading_box/icon";

type WalletData = {
  coin: string;
  symbol: string;
  type: string;
  amount: string;
  amount_locked: string;
  vesting: any[];
};

type AddressData = {
  wallet: WalletData[];
  delegations: any[];
  transaction_history: string[];
  transaction_count: number;
  note: string;
  error: string;
};

async function getData(address: string) {
  const headersList = headers();
  const authorization = headersList.get("Authorization");
  const res = await fetch(process.env.SERVER_URL + "/api/address/" + address, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
  });
  const data = await res.json();
  return data.response;
}

export default async function Address({ params }: { params: { address: string } }) {
  const address = params.address;
  const data: AddressData = await getData(address);

  if (data.error === "Invalid address") {
    return <NotFound title={"Invalid address"} subtitle={"Invalid address"} />;
  }

  if (data.error === "Address found in another network") {
    return <NotFound title={"Address not found"} subtitle={"Address found in another network"} id={address} linkUrl={`/address/${address}`} />;
  }

  if (!data.transaction_count) {
    return <NotFound title={"Address not found"} subtitle={"The address does not exist or has never been used"} id={address} />;
  }

  return (
    <>
      <Hero overlap={true}>
        <div className="max-w-6xl md:mx-auto z-40 relative  px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Address detail</div>
            {data.note && <p className="mb-4">{data.note}</p>}
          </div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-9">
              <Summary
                data={[
                  { title: "Address", icon: icon_hash, value: address, qrCode: address, copy: address, iconTooltip: "Address" },
                ]}
              />
            </div>
            <div className="md:col-span-3">
              <HeadingBox title={data.transaction_count} subtitle="Total transactions" icon={<Icon src={txs} />} iconTooltip="Total transactions" />
            </div>
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full md:mx-auto mb-8 px-5">
        {data.wallet && (
          <div className="w-full">
            <Wallet data={data.wallet} />
          </div>
        )}

        {data.delegations && data.delegations.length > 0 && (
          <div className="w-full mt-8">
            <Delegations data={data.delegations} />
          </div>
        )}
      </div>
      <div className="bg-primary-100 py-4 md:py-8">
        <div className="hidden max-w-6xl md:mx-auto md:block px-5">
          <TransactionsList transactions={data.transaction_history} />
        </div>

        <div className="flex max-w-6xl md:mx-auto md:hidden bg-white px-4 justify-center">
          <ColumnBox
            innerStyle=" "
            title={`Transactions executed by this address (${data.transaction_count})`}
            icon={<Image src={transactions} alt="arrows symbolizing transaction" />}
          >
            <TransactionsListMobile transactions={data.transaction_history} />
          </ColumnBox>
        </div>
      </div>
    </>
  );
}
