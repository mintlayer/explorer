"use client";

import { useState } from "react";
import Image from "next/image";

import icon_plus from "./plus.svg";
import icon_minus from "./minus.svg";

export const InfoExpand = ({ title, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="py-8">
      <div
        className="border-t border-base-dark pb-2 mb-4 py-4 flex items-center justify-between text-gray-700 font-bold text-lg cursor-pointer"
        onClick={onClick}
      >
        {title}
        <div className="mr-5">{isOpen ? <Image src={icon_minus} alt={""} /> : <Image src={icon_plus} alt={""} />}</div>
      </div>
      <div className={isOpen ? "" : "hidden"}>{children}</div>
    </div>
  );
};
