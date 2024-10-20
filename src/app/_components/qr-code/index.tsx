"use client";

import React, { useState } from "react";
import { useQRCode } from "next-qrcode";
import Image from "next/image";
import classnames from "classnames";

import icon from "@/../public/images/qr-code.png";

export const QRCode = ({ text }: { text: string }) => {
  const { Canvas } = useQRCode();

  const [active, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  return (
    <div className="inline-block relative" onMouseEnter={showTip} onMouseLeave={hideTip}>
      <div className={classnames("w-10 p-2 border-[3px] border-background", active && "bg-background")}>
        <Image src={icon} alt="" width={24} />
      </div>
      {active && (
        <>
          <span
            className="absolute left-[10px] bottom-[-20px] w-0 h-0 border-[10px] border-solid border-transparent border-b-[#C9CCCB] z-100"
            aria-hidden="true"
          ></span>
          <div className="inline-block absolute border-1 border-solid rounded p-1 mt-[20px] z-100 right-0 border-[#C9CCCB] [text-decoration:none] bg-white">
            <Canvas
              text={text}
              options={{
                errorCorrectionLevel: "M",
                margin: 3,
                scale: 4,
                width: 170,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
              }}
            />
          </div>
          <span
            className="absolute left-[11px] bottom-[-21px] w-0 h-0 border-[9px] border-solid border-transparent [border-bottom-color:white] z-100"
            aria-hidden="true"
          ></span>
        </>
      )}
    </div>
  );
};
