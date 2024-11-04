import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";
import { fetch } from "next/dist/compiled/@edge-runtime/primitives";
import { formatML } from "@/utils/numbers";

export const dynamic = "force-dynamic";

const NODE_API_URL = getUrl();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") || 0;

  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();

  const { block_height } = chain_tip_data;

  const res = await fetch(NODE_API_URL + "/transaction?offset=" + offset, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  const transactions = data;

  const response = [];

  for (let i = 0; i < transactions.length; i++) {
    const amount = transactions[i]?.outputs?.reduce((acc: any, value: any) => {
      if (value?.type === "Transfer") {
        if (value?.value?.type === 'Coin') {
          return BigInt(value?.value?.amount?.atoms) + acc;
        }
      }
      if (value?.type === "DelegateStaking") {
        return BigInt(value?.amount?.atoms) + acc;
      }
      if (value?.type === "LockThenTransfer") {
        return BigInt(value?.value?.amount?.atoms) + acc;
      }
      if (value?.type === "CreateStakePool") {
        return BigInt(value?.data?.amount?.atoms) + acc;
      }
      return acc;
    }, BigInt(0));

    response.push({
      block: block_height - transactions[i].confirmations,
      fee: transactions[i].fee.decimal,
      transaction: transactions[i].id,
      // label is used to display, ellipsis in the middile
      label: transactions[i].id.slice(0, 5) + "..." + transactions[i].id.slice(-5),
      input: transactions[i].inputs.length,
      output: transactions[i].outputs.length,
      timestamp: transactions[i].timestamp,
      amount: formatML((Number(amount) / 1e11).toString()),
    });
  }

  return NextResponse.json(response);
}
