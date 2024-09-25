"use client";

import { Block } from "@/app/(homepage)/_components/block";

export function BlocksListMobile({ blocks, setBefore, itemsPerPage, skeleton, lastBlock }: any) {
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
    <>
      {skeleton
        ? Array(itemsPerPage)
            .fill(null)
            .map((v, index) => {
              return <Block key={index} skeleton />;
            })
        : blocks?.map((value: any, i: number) => <Block key={value.transaction} {...value} />)}
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
    </>
  );
}
