"use client";

import { useRouter } from "next/navigation";

interface PaginationProps {
  page: number;
  itemsCount: number;
  itemsPerPage: number;
  block: string;
}

export const Pagination = ({ page, block, itemsCount, itemsPerPage }: PaginationProps) => {
  const { push } = useRouter();
  const totalPageCount = Math.ceil(itemsCount / itemsPerPage);

  const showPrev = page > 1;
  const showNext = page < totalPageCount;

  if (!totalPageCount || (!showPrev && !showNext)) {
    return null;
  }

  const txFrom = (page - 1) * itemsPerPage + 1;
  const txTo = page * itemsPerPage < itemsCount ? page * itemsPerPage : itemsCount;

  return (
    <div className="flex items-center justify-center mb-8 gap-8">
      {showPrev && (
        <span className="text-primary-100 cursor-pointer" onClick={() => push(`/block/${block}?transactionsPage=${page - 1}#transactions`)}>
          {"<"} Previous transactions
        </span>
      )}

      {txFrom !== txTo ? (
        <span>
          Transactions {txFrom} - {txTo} of {itemsCount}
        </span>
      ) : (
        <span>
          Transaction {txFrom} of {itemsCount}
        </span>
      )}

      {showNext && (
        <span className="text-primary-100 cursor-pointer" onClick={() => push(`/block/${block}?transactionsPage=${page + 1}#transactions`)}>
          Next transactions {">"}
        </span>
      )}
    </div>
  );
};
