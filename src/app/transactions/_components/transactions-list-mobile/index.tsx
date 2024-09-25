"use client";

import { Transaction } from "@/app/(homepage)/_components/transaction";

export function TransactionsListMobile({ transactions, offset, setOffset, itemsPerPage, skeleton }: any) {
  const txFrom = offset + 1;
  const txTo = offset + 1 + itemsPerPage;

  return (
    <>
      {skeleton
        ? Array(itemsPerPage)
            .fill(null)
            .map((v, index) => {
              return <Transaction key={index} skeleton />;
            })
        : transactions?.map((value: any, i: number) => <Transaction key={value.transaction} {...value} />)}
      <div className="flex justify-center mt-5">
        <div className="flex items-center justify-center mb-8 gap-8 bg-white w-full p-6">
          {offset > 0 && (
            <span className="text-primary-100 cursor-pointer" onClick={() => setOffset(offset - itemsPerPage)}>
              {"<"}&nbsp;Previous
            </span>
          )}
          <span>
            Transactions {txFrom} - {txTo}
          </span>
          <span className="text-primary-100 cursor-pointer" onClick={() => setOffset(offset + itemsPerPage)}>
            Next&nbsp;{">"}
          </span>
        </div>
      </div>
    </>
  );
}
