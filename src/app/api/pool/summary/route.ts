import { get_annual_subsidy } from "@/utils/emission";
import { fetchAllPoolsFromApi, fetchChainTip } from "@/lib/explorer-source";
import { getLatestBlockHeightFromDb, getPoolsFromDb, savePoolsToDb } from "@/lib/explorer-store";
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let pools = await getPoolsFromDb();

  if (!pools.length) {
    pools = await fetchAllPoolsFromApi();
    await savePoolsToDb(pools);
  }

  const currentBlockHeight = (await getLatestBlockHeightFromDb()) ?? (await fetchChainTip()).block_height;
  const annual_subsidy = get_annual_subsidy(currentBlockHeight);

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

  const total_apy = total_amount > 0 ? ((annual_subsidy / total_amount) * 100).toFixed(2) : 0;

  const response = {
    validators_count: pools.length,
    delegation_count: delegation_count,
    pools_amount: pools_amount,
    delegations_amount: delegations_amount,
    total_amount: total_amount,
    total_effective_amount: effective_pools_amount,
    total_apy: total_apy,
    updated_at: Date.now(),
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
