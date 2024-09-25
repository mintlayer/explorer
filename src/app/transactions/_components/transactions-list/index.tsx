"use client";
import { Table } from "@/app/_components/table";

export function TransactionsList({ transactions, skeleton, offset, setOffset, itemsPerPage }: any) {
  const txFrom = offset + 1;
  const txTo = offset + 1 + itemsPerPage;

  return (
    <div>
      <Table data={transactions} title="Latest Transactions" handleMore={() => {}} skeleton={skeleton} itemsPerPage={itemsPerPage} />
      <div className="flex justify-center mt-5">
        <div className="flex items-center justify-center mb-8 gap-8 bg-white w-full p-6">
          <span className="text-primary-100 cursor-pointer" onClick={() => setOffset(offset + itemsPerPage)}>
            {"<"} Previous transactions
          </span>
          <span></span>
          {offset > 0 && (
            <span className="text-primary-100 cursor-pointer" onClick={() => setOffset(offset - itemsPerPage)}>
              Next transactions {">"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
