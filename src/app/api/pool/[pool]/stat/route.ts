import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const pool = params.pool;
  const searchParams = new URL(request.url).searchParams;

  let from = Math.floor(Date.now() / 1000) - 86400;

  if (searchParams.get("7d")) {
    from = Math.floor(Date.now() / 1000) - 604800;
  }

  const to = Math.floor(Date.now() / 1000);

  const res = await fetch(NODE_API_URL + "/pool/" + pool + "/block-stats?from=" + from + "&to=" + to, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  let response: any = {};

  response.pool = pool;
  response.cost_per_block = data.cost_per_block.decimal;
  response.margin_ratio_per_thousand = data.margin_ratio_per_thousand;
  response.staker_balance = data.staker_balance.decimal.toFixed(4);
  response.vrf_public_key = data.vrf_public_key;
  response.decommission_destination = data.decommission_destination;
  response.mark = 0;

  return NextResponse.json(response);
}
