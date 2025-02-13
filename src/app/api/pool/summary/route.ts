import { NextResponse } from "next/server";
import { getUrl, isMainNetwork, network } from "@/utils/network";
import { effective_pool_balance, Network } from "@/utils/mintlayer-crypto/pkg";
import { get_annual_subsidy } from "@/utils/emission";

// @ts-ignore
import cache from "@/app/api/_utils/cache";

const NODE_API_URL = getUrl();
export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getPools(): Promise<any[]> {
  let offset = 0;
  const seenPools = new Set(); // To track unique pool_ids
  const allPools: any[] = [];

  while (true) {
    try {
      const res = await fetch(`${NODE_API_URL}/pool?offset=${offset}`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        console.error(`Error fetching offset ${offset}: ${res.statusText}`);
        break;
      }

      const data: any[] = await res.json();

      if (data.length === 0) break;

      for (const pool of data) {
        if (!seenPools.has(pool.pool_id)) {
          seenPools.add(pool.pool_id);
          allPools.push(pool);
        }
      }

      offset += 10;
    } catch (err) {
      console.error(`Failed to fetch pools at offset ${offset}:`, err);
      break;
    }
  }

  console.timeEnd("Fetching pools");
  return allPools;
}

async function fetchDelegations(pools: any[]) {
  const delegations: Record<string, any[]> = {};
  const delegations_flatlist: any[] = [];

  // Запускаем все запросы параллельно с обработкой ошибок
  const responses = await Promise.allSettled(
    pools.map((pool) =>
      fetch(`${NODE_API_URL}/pool/${pool.pool_id}/delegations`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      }).then((res) => res.json()) // Преобразуем ответ сразу
    )
  );

  responses.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const poolId = pools[index].pool_id;
      delegations[poolId] = result.value;
      if(result.value.length > 0) {
        delegations_flatlist.push(...result.value);
      }
    } else {
      console.error(`Failed to fetch delegations for pool ${pools[index].pool_id}:`, result.reason);
    }
  });

  return { delegations, delegations_flatlist };
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();

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

  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();
  const current_block_height = chain_tip_data.block_height;

  const annual_subsidy = get_annual_subsidy(current_block_height);

  const pools = await getPools();

  const {
    delegations,
  } = await fetchDelegations(pools);

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

  const total_apy = ((annual_subsidy / (total_amount / 1e11)) * 100).toFixed(2);

  const response = {
    validators_count: pools.length,
    delegation_count: delegation_count,
    pools_amount: pools_amount,
    delegations_amount: delegations_amount / 1e11,
    total_amount: total_amount / 1e11,
    total_effective_amount: effective_pools_amount,
    total_apy: total_apy,
  };

  cache.set("summary", response, 1 * 60 * 60 * 1000); // 3 hours only for summary

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
