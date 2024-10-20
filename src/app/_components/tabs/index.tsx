"use client";
import { useState } from "react";
import classNames from "classnames";

export const Tabs = ({ settings }: any) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = settings[selectedIndex];

  return (
    <div>
      <div className="flex justify-center gap-6 mb-4">
        {settings.map(({ label, disabled = false }: any, i: number) => {
          const onClick = () => {
            if (!disabled) {
              setSelectedIndex(i);
            }
          };

          const className = classNames(
            "text-xl cursor-pointer",
            disabled ? "text-base-gray40" : "text-gray-700 font-semibold",
            i === selectedIndex && "border-b-2 border-primary-100",
          );

          return (
            <div key={i} className={className} onClick={onClick}>
              {label}
            </div>
          );
        })}
      </div>
      <div>{selected.content}</div>
    </div>
  );
};
