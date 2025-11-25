import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

// @ts-ignore
import cache from "@/app/api/_utils/cache";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";
export const revalidate = 120;
// @ts-ignore
async function getBlocksRecursive(block_id: string, limit: number) {
  let blocks = [];
  if (limit > 0) {
    const block_response = await fetch(NODE_API_URL + "/block/" + block_id, {
      cache: "force-cache", // block content is not changing
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await block_response.json();

    blocks.push(data);
    blocks = blocks.concat(await getBlocksRecursive(data.header.previous_block_id, limit - 1));
  }
  return blocks;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const before: number | null = searchParams.get("before") ? parseInt(searchParams.get("before") as string) : null;
  let height: number, id: string;

  const cachedData = cache.get("list" + before);
  if (cachedData) {
    console.log("BLOCK LIST: Returning cached data");
    return NextResponse.json(cachedData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  console.log("BLOCK LIST: Gather data");

  if (!before) {
    const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const chain_tip_data = await chain_tip.json();

    const { block_height, block_id } = chain_tip_data;

    height = block_height;
    id = block_id;
  } else {
    const block_response = await fetch(NODE_API_URL + "/chain/" + before, {
      cache: "force-cache", // block hash is not changing
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await block_response.json();

    height = before;
    id = data;
  }

  const limit = 10;

  const blocks = await getBlocksRecursive(id, limit);

  const response = blocks.map((value: any, index: number) => {
    return {
      block: height - index,
      datetime: value.header.timestamp.timestamp,
      transactions: value.body.transactions.length,
      pool: value.body.reward[0].pool_id,
      pool_label: value.body.reward[0].pool_id.slice(0, 8) + "..." + value.body.reward[0].pool_id.slice(-8),
      target_difficulty: parseInt(value.header.consensus_data.target, 16) / (Math.pow(2, 256) - 1),
    };
  });

  cache.set("list" + before, response);

  return NextResponse.json(response);
}
