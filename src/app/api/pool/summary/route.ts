import { NextResponse } from "next/server";
import { getUrl, isMainNetwork, network } from "@/utils/network";
import { effective_pool_balance, Network } from "@/utils/mintlayer-crypto/pkg";

// @ts-ignore
import cache from "@/app/api/_utils/cache";

const NODE_API_URL = getUrl();
export const dynamic = "force-dynamic";
export const revalidate = 120;

async function getPoolsRecursive(offset: number, pools: any = []): Promise<any> {
  const res = await fetch(NODE_API_URL + "/pool?offset=" + offset, {
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60 * 2,
    },
  });
  const data = await res.json();

  const updated_pools = [...pools, ...data];

  if (data.length > 0) {
    return await getPoolsRecursive(offset + 10, updated_pools);
  }

  return updated_pools.reduce((acc: any, pool: any) => {
    if (!acc.find((p: any) => p.pool_id === pool.pool_id)) {
      acc.push(pool);
    }
    return acc;
  }, []);
}

export async function GET(request: Request) {
  const delegations: any = {};

  const cachedData = cache.get("summary");
  if (cachedData) {
    console.log("POOLS: Returning cached data");
    return NextResponse.json(cachedData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  console.log("POOLS: Gather data");

  const pools = await getPoolsRecursive(0);

  // fetch all delegations in parallel
  const promises = pools.map(async (pool: any) => {
    const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/delegations", {
      // cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60 * 2,
      },
    });
    const data = await res.json();

    delegations[pool.pool_id] = data;
  });

  await Promise.all(promises);

  const network = isMainNetwork ? Network.Mainnet : Network.Testnet;

  let pools_amount = 0;
  let delegations_amount = 0;
  let effective_pools_amount = 0;
  let total_amount = 0;
  let delegation_count = 0;

  for (const pool of pools) {
    pools_amount += parseFloat(pool.staker_balance.decimal);

    const pool_delegations =
      delegations[pool.pool_id] && delegations[pool.pool_id].length > 0
        ? delegations[pool.pool_id].reduce((acc: number, delegation: any) => {
            delegation_count += 1;
            return acc + parseInt(delegation.balance.atoms);
          }, 0)
        : 0;

    const total_pool_balance = BigInt(pool.staker_balance.atoms) + BigInt(pool_delegations);

    effective_pools_amount += parseInt(effective_pool_balance(network, pool.staker_balance.atoms, total_pool_balance.toString()));
    total_amount += pool_delegations + parseInt(pool.staker_balance.atoms);
  }

  const annual_reward = 202 * 720 * 365;
  // @ts-ignore
  const total_apy = ((annual_reward / (total_amount / 1e11)) * 100).toFixed(2);

  const response = {
    validators_count: pools.length,
    delegation_count: delegation_count,
    pools_amount: pools_amount,
    delegations_amount: delegations_amount / 1e11,
    total_amount: total_amount / 1e11,
    total_effective_amount: effective_pools_amount,
    total_apy: total_apy,
  };

  cache.set("summary", response, 3 * 60 * 60 * 1000); // 3 hours only for summary

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
