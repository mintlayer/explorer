import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";
import { fetch } from "next/dist/compiled/@edge-runtime/primitives";

export const revalidate = 120;

const NODE_API_URL = getUrl();

export async function GET(request: Request, { params }: { params: { block: string } }) {
  const res = await fetch(NODE_API_URL + "/transaction", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [transaction] = await res.json();

  const transaction_amount = transaction.tx_global_index;

  let response = transaction_amount;

  return NextResponse.json(response);
}
