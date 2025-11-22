import { NextResponse } from "next/server";
import { getUrl, getUrlSide } from "@/utils/network";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { delegation: string } }) {
  const getDelegation = async (apiUrl: string) => {
    const delegation = (await params).delegation;
    const res = await fetch(apiUrl + "/delegation/" + delegation, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };

  const data = await getDelegation(NODE_API_URL);

  if (data.error === "Invalid pool Id") {
    const anotherNodeData = await getDelegation(NODE_SIDE_API_URL);

    if (anotherNodeData.pool_id) {
      return NextResponse.json({ error: "Delegation found in another network" }, { status: 404 });
    }
    return NextResponse.json({ error: "Invalid pool Id" }, { status: 404 });
  }

  const res_pool = await fetch(NODE_API_URL + "/pool/" + data.pool_id, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const pool_data = await res_pool.json();

  const res_chain = await fetch(NODE_API_URL + "/chain/" + data.creation_block_height, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const block_hash = await res_chain.json();

  const res_block = await fetch(NODE_API_URL + "/block/" + block_hash + "/header", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const block_data = await res_block.json();

  let response: any = {};

  response = data;
  response.balance = data.balance.decimal;
  response.pool_data = pool_data;
  response.delegation_creation_date = block_data.timestamp.timestamp;

  return NextResponse.json(response);
}
