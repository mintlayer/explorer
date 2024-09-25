import { NextResponse } from "next/server";
import { getCoin, getMatcher } from "@/utils/network";
import { shortenString } from "@/utils/format";
import { formatML } from "@/utils/numbers";

const block_matcher = getMatcher("block");
const block_hash_matcher = getMatcher("blockHash");
const tx_matcher = getMatcher("tx");
const address_matcher = getMatcher("address");
const pool_matcher = getMatcher("pool");
const delegation_matcher = getMatcher("delegation");

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let response: any = [];

  // get query from body
  const body = await request.json();
  const params = { query: body.query };

  const short_query = shortenString(params.query);

  // is block height
  if (params.query.match(block_matcher) || params.query.match(block_hash_matcher)) {
    const res = await fetch(process.env.SERVER_URL + "/api/block/" + params.query, { cache: "no-store" });
    const block = await res.json();

    if (!block.error) {
      response.push({
        type: "block",
        data: [
          { icon: "block", value: "#" + block.height },
          { icon: "pickaxe", value: "by " + shortenString(block.pool) },
          { icon: "transactions", value: block.transactions.length + " tx" },
          { icon: "time", value: block.timestamp },
        ],
      });
    }
  }

  // is transaction hash
  if (params.query.match(tx_matcher)) {
    const res = await fetch(process.env.SERVER_URL + "/api/transaction/" + params.query, { cache: "no-store" });
    const tx = await res.json();

    if (!tx.error) {
      response.push({
        type: "transaction",
        data: [
          { icon: "transactions", value: shortenString(tx.hash) },
          { icon: "block", value: "#" + tx.block_height },
          { icon: "coin", value: formatML(tx.amount) + " " + getCoin() },
          { icon: "time", value: tx.timestamp },
        ],
      });
    }
  }

  // is address
  if (params.query.match(address_matcher)) {
    const res = await fetch(process.env.SERVER_URL + "/api/address/" + params.query, { cache: "no-store" });
    const address = await res.json();

    if (!address.response.error) {
      response.push({
        type: "address",
        data: [{ icon: "hash", value: short_query }],
      });
    }
  }

  // is pool
  if (params.query.match(pool_matcher)) {
    const res = await fetch(process.env.SERVER_URL + "/api/pool/" + params.query, { cache: "no-store" });
    const pool = await res.json();

    if (!pool.error) {
      response.push({
        type: "pool",
        data: [{ icon: "hash", value: short_query }],
      });
    }
  }

  // is delegation
  if (params.query.match(delegation_matcher)) {
    const res = await fetch(process.env.SERVER_URL + "/api/delegation/" + params.query, { cache: "no-store" });
    const delegation = await res.json();

    if (!delegation.error) {
      response.push({
        type: "delegation",
        data: [{ icon: "hash", value: short_query }],
      });
    }
  }

  return NextResponse.json(response);
}
