import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const ticker = (await params).ticker;
  const res = await fetch(NODE_API_URL + "/token/ticker/" + ticker, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  // if(data.error === 'Token not found') {
  //   const res_nft = await fetch(NODE_API_URL + "/nft/" + params.ticker, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const data_nft = await res_nft.json();
  //
  //   const response = {
  //     type: 'nft',
  //     ...data_nft,
  //     token_ticker: data_nft.ticker,
  //   };
  //
  //   return NextResponse.json(response);
  // }

  const token_id = data.id;

  const res_stats = await fetch(NODE_API_URL + "/statistics/token/" + token_id, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data_stats = await res_stats.json();

  let response: any = {};

  response = {
    type: 'token',
    ...data,
    ...data_stats,
  };

  return NextResponse.json(response);
}
