import { NextResponse } from "next/server";
import { fetchChainTip } from "@/lib/explorer-source";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Short-TTL cached (5s) with in-flight de-duplication: k8s probes and
  // clients hammering this route never pile up upstream requests, and the
  // route never blocks behind heavier cache loads.
  const chain_tip_data = await fetchChainTip();

  const response = {
    block_height: chain_tip_data.block_height,
  };

  return NextResponse.json(response);
}
