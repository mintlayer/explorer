"use client";
import { Table } from "../table";

export function BlocksList({ blocks, skeleton, itemsPerPage, lastBlock, setBefore }: any) {
  const from = blocks[blocks.length - 1]?.block;
  const to = blocks[0]?.block;

  const onNext = () => {
    if (skeleton) {
      return;
    }
    const nextBefore = blocks[blocks.length - 1]?.block - 1 + itemsPerPage * 2;
    setBefore(nextBefore === lastBlock ? 0 : nextBefore);
  };

  const onPrevious = () => {
    if (skeleton) {
      return;
    }
    setBefore(blocks[blocks.length - 1]?.block - 1);
  };

  return (
    <div>
      <Table data={blocks} title="Latest Blocks" skeleton={skeleton} itemsPerPage={itemsPerPage} />
      <div className="flex justify-center mt-5">
        <div className="flex items-center justify-center mb-8 gap-8 bg-white w-full p-6">
          <span className="text-primary-100 cursor-pointer" onClick={onPrevious}>
            {"<"}&nbsp;Previous
          </span>
          <span>
            Blocks {from} - {to}
          </span>
          {to !== lastBlock && (
            <span className="text-primary-100 cursor-pointer" onClick={onNext}>
              Next&nbsp;{">"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
