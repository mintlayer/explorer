import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const data = {
    token_ticker: {
      string: "ML"
    }
  };

  const res_stats = await fetch(NODE_API_URL + "/statistics/coin", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data_stats = await res_stats.json();

  let response: any = {};

  response = {
    ...data,
    ...data_stats,
  };

  return NextResponse.json(response);
}
