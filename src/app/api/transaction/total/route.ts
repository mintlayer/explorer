import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";
import { fetch } from "next/dist/compiled/@edge-runtime/primitives";

export const revalidate = 120;

const NODE_API_URL = getUrl();

const TRANSACTION_MAX_START_SEARCH: number = 80_000;

// @ts-ignore
async function getTransactionRecursive(min_offset: number, max_offset: number) {
  const mid_offset = Math.round(min_offset + (max_offset - min_offset) / 2);
  const url = NODE_API_URL + "/transaction?offset=" + mid_offset;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (data.length === 1) {
    return mid_offset;
  } else if (data.length > 1) {
    return await getTransactionRecursive(Math.round(min_offset + (max_offset - min_offset) / 2), max_offset);
  } else if (data.length === 0) {
    return await getTransactionRecursive(min_offset, Math.round(min_offset + (max_offset - min_offset) / 2));
  }
}

export async function GET(request: Request, { params }: { params: { block: string } }) {
  // bisect lookup for the last transaction offset
  const transaction_amount: any = await getTransactionRecursive(0, TRANSACTION_MAX_START_SEARCH);

  let response = transaction_amount;

  return NextResponse.json(response);
}
