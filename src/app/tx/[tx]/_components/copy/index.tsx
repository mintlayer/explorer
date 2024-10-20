"use client";

import Image from "next/image";
import icon_copy from "@/app/(homepage)/_icons/16px/copy.svg";
import { useState } from "react";

type CopyProps = {
  text: string;
  imageStyle?: string;
};

export const Copy = ({ text, imageStyle = "" }: CopyProps) => {
  const [copy, setCopy] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 1000);
  };
  return (
    <span data-tooltip-id="tooltip" onClick={handleCopy} data-tooltip-content={copy ? "Copied!" : "Copy to clipboard"}>
      <Image src={icon_copy} className={`max-w-none ${imageStyle}`} alt={""} />
    </span>
  );
};
