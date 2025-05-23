import { Hero } from "@/app/_components/hero";
import { getCoin } from "@/utils/network";
import { Table } from "@/app/pools/_components/table";
import { Summary } from "@/app/pools/_components/summary";

import { WalletConnect } from "@/app/_components/wallet_connect";
import SaveToLocalStorage from "@/app/pools/_components/savetostorage";

export const metadata = {
  title: "Mintlayer Staking Pools",
};

export default async function Pool() {
  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto  px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Pools</div>
          </div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-12 grid grid-cols-1 md:grid-rows-2 md:grid-cols-6 grid-rows-1 gap-4">
              <Summary />
            </div>
          </div>
        </div>
      </Hero>

      <SaveToLocalStorage />

      <div className="max-w-6xl w-full mx-auto my-8 px-5">
        <Table />
      </div>
    </>
  );
}
