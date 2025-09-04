"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Block = ({ number, percent, active, parent }: any) => {
  return (
    <div className="flex flex-col relative">
      <div
        className={`custom-block-box-path hover:cursor-pointer hover:bg-primary-110 ${active ? "bg-primary-110 p-[2px] mb-[-3px]" : `${parent ? "bg-primary-110 p-[2px]" : "bg-base-gray p-[1px]"}`}`}
      >
        <Link
          href={`/block/${number}`}
          className={`relative flex justify-center items-end custom-block-box-path bg-white ${active ? "w-[60px] h-[50px]" : "w-[50px] h-[40px]"}`}
        >
          <div className={`absolute left-0 top-0 bottom-0 z-5 ${active ? "bg-primary-100" : "bg-secondary-100"}`} style={{ width: percent * 100 + "%" }}></div>
          {parent ? <span className="text-[12px] text-base-gray z-10">parent</span> : ""}
        </Link>
      </div>
      <div
        className={`relative text-center mt-5 before:content-[""] before:absolute before:left-1/2
        ${
          active
            ? "text-primary-110 text-[14px] font-medium mb-[-3px] before:bg-primary-100 before:w-[11px] before:h-[11px] before:ml-[-6px] before:top-[-12px]"
            : `text-[12px] ${parent ? "text-base-black font-semibold" : "text-base-gray font-normal"} before:w-[7px] before:h-[7px] before:bg-base-gray before:ml-[-3px] before:top-[-10px]`
        }`}
      >
        #{number}
      </div>
    </div>
  );
};

const generateSequence = (last: number, current: number, count: number) => {
  const getBlock = (n: number) => {
    return {
      number: n,
      active: n === current,
      percent: 0.8,
      parent: n === current - 1,
    };
  };

  const sequence = [getBlock(current)];

  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return sequence;
  }

  for (let i = 1; true; i++) {
    if (current + i <= last) {
      sequence.push(getBlock(current + i));
      if (sequence.length >= count) {
        return sequence;
      }
    }

    if (current - i >= 1) {
      sequence.unshift(getBlock(current - i));
      if (sequence.length >= count) {
        return sequence;
      }
    }
  }
};

const getBlockCount = (availableWidth: number) => {
  const rules = {
    0: 5,
    490: 6,
    560: 7,
    610: 8,
    700: 9,
    750: 10,
    770: 11,
  };

  let res = 11;
  Object.entries(rules).forEach(([width, count]) => {
    if (availableWidth > Number(width)) {
      res = count;
    }
  });

  return res;
};

export const BlockSequence = ({ current, last }: { last: number; current: number }) => {
  const [blocksCount, setBlocksCount] = useState(0);

  useEffect(() => {
    const handler = () => {
      setBlocksCount(getBlockCount(window.document.body.clientWidth));
    };

    handler();
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  const sequence = generateSequence(last, current, blocksCount);

  return (
    <div className="w-full h-40 -mt-10 mb-10">
      <div className={`my-5 absolute left-0 right-0`}>
        <div className="flex justify-between items-center my-4 mx-5">
          <div>{current - 1} previous</div>
          <div>{last - current} subsequent</div>
        </div>

        {sequence.length > 0 && <div className="absolute left-0 bottom-[36px] md:bottom-9 h-[1px] bg-base-gray w-full" aria-hidden></div>}
        <div className="relative px-5 py-3 flex flex-row items-end justify-between gap-4 overflow-hidden">
          {sequence.map((item) => (
            <Block key={"block" + item.number} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};
