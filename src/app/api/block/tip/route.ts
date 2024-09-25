import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

export const dynamic = "force-dynamic";

const NODE_API_URL = getUrl();

export async function GET(request: Request, { params }: { params: { block: string } }) {
  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();

  const { block_height, block_id } = chain_tip_data;

  const response = {
    block_height: block_height,
  };

  return NextResponse.json(response);
}
