import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { nft: string } }) {
  const res = await fetch(NODE_API_URL + "/nft/" + params.nft, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  if(data.error === 'nft not found') {
    const res_nft = await fetch(NODE_API_URL + "/nft/" + params.nft, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data_nft = await res_nft.json();

    const response = {
      ...data_nft,
      nft_ticker: data_nft.ticker,
    };

    return NextResponse.json(response);
  }

  let response: any = {};

  response = {
    ...data,
  };

  return NextResponse.json(response);
}
