import { Hero } from "@/app/_components/hero";
import { List } from "./_components/list";

export default async function Transactions({
  params,
  searchParams,
}: {
  params: { block: string };
  searchParams: { transactionsPage: string; transactionsPerPage: string };
}) {
  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Transactions</div>
          </div>
          <div className="md:col-span-12 -mx-5"></div>
          <div className="grid md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-9"></div>
            <div className="md:col-span-3 grid grid-cols-1 grid-rows-3 gap-4"></div>
          </div>
        </div>
      </Hero>
      <div>
        <div className="max-w-6xl md:mx-auto py-6 px-5">
          <List />
        </div>
      </div>
    </>
  );
}
