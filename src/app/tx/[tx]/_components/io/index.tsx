"use client";
import React, { useState } from "react";
import { Switch } from "@/app/tx/[tx]/_components/switch";
import Image from "next/image";
import icon_arrow from "@/app/tx/[tx]/arrow.svg";
import icon_input from "@/app/tx/[tx]/input.svg";
import { IOEntry } from "@/app/tx/[tx]/_components/ioentry";
import icon_output from "@/app/tx/[tx]/output.svg";
import Link from "next/link";

interface IoProps {
  data: any;
  title?: any;
  tokens?: any;
}

const TransactionLink = ({ txId }: { txId: string }) => {
  return (
    <div className="flex justify-center mt-5">
      <Link className="hover:text-primary-100 " href={"/tx/" + txId}>
        <button className="border-2 px-2 py-2 font-bold bg-white">Show all transaction info</button>
      </Link>
    </div>
  );
};

// @ts-ignore
export function Io({ data, title, tokens }: IoProps) {
  const [expand, setExpand] = useState(false);

  if (data?.inputs?.length === 0 && data?.outputs?.length === 0) return <></>;

  return (
    <div>
      <div className="max-w-6xl py-8 md:mx-auto px-5">
        <div className="flex justify-between mb-8 flex-col md:flex-row">
          <div className="text-2xl font-bold">{title || "Input and output details"}</div>
          <div className="flex items-center md:mt-0 mt-5 ml-auto">
            <span className="mr-3">More details</span>
            <Switch checked={expand} onChange={() => setExpand(!expand)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-10 relative">
          <Image src={icon_arrow} className="absolute left-1/2 top-1/2 -mt-8 md:-mt-3 -ml-3 rotate-90 md:rotate-0" alt="" />
          <div>
            <div className="flex items-center my-6 ml-3 text-2xl">
              <Image className="mr-2" src={icon_input} alt={""} /> Input
            </div>
            {data?.inputs?.map((input: any, index: number) => <IOEntry type="input" key={index} data={input} expand={expand} metadata={{ tokens }} />)}
            {data.inputs.length < data.total_inputs && <TransactionLink txId={data.id} />}
          </div>
          <div>
            <div className="flex items-center my-6 ml-3 text-2xl">
              <Image className="mr-2" src={icon_output} alt={""} />
              Output
            </div>
            {data?.outputs?.map((output: any, index: number) => <IOEntry type="output" key={index} data={output} expand={expand} metadata={{ tokens }} />)}
            {data.outputs.length < data.total_outputs && <TransactionLink txId={data.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
