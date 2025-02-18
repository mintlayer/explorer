import { getUrl } from "@/utils/network";
import { get_annual_subsidy } from "@/utils/emission";

import db from "@/lib/db";

const NODE_API_URL = getUrl();
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const row: any = db.prepare("SELECT * FROM pools WHERE id = 1").get();

  if(!row) {
    const empty_response = {
      validators_count: 0,
      delegation_count: 0,
      pools_amount: 0,
      delegations_amount: 0,
      total_amount: 0,
      total_effective_amount: 0,
      total_apy: 0,
      updated_at: 0,
    };

    return new Response(JSON.stringify(empty_response), {
      headers: {
        "Content-Length": encoder.encode(JSON.stringify(empty_response)).byteLength.toString(),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  const pools = JSON.parse(row.result);

  const updated_at = row.updated_at;

  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();
  const current_block_height = chain_tip_data.block_height;

  const annual_subsidy = get_annual_subsidy(current_block_height);

  let pools_amount = 0;
  let delegations_amount = 0;
  let effective_pools_amount = 0;
  let total_amount = 0;
  let delegation_count = 0;

  for (const pool of pools) {
    pools_amount += parseFloat(pool.staker_balance);
    delegations_amount += pool.delegations_amount;
    delegation_count += pool.delegations_count;
    effective_pools_amount += pool.effective_pool_balance;
    total_amount += parseFloat(pool.balance);
  }

  const total_apy = ((annual_subsidy / (total_amount)) * 100).toFixed(2);

  const response = {
    validators_count: pools.length,
    delegation_count: delegation_count,
    pools_amount: pools_amount,
    delegations_amount: delegations_amount,
    total_amount: total_amount,
    total_effective_amount: effective_pools_amount,
    total_apy: total_apy,
    updated_at,
  };

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Length": encoder.encode(JSON.stringify(response)).byteLength.toString(),
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
