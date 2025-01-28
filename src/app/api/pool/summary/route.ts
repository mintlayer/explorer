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

const rewards = [
  { start: 0      , end: 262800 , reward: 202 },
  { start: 262800 , end: 525600 , reward: 151 },
  { start: 525600 , end: 788400 , reward: 113 },
  { start: 788400 , end: 1051200, reward: 85 },
  { start: 1051200, end: 1314000, reward: 64 },
  { start: 1314000, end: 1576800, reward: 48 },
  { start: 1576800, end: 1839600, reward: 36 },
  { start: 1839600, end: 2102400, reward: 27 },
  { start: 2102400, end: 2365200, reward: 20 },
  { start: 2365200, end: 2628000, reward: 15 },
  { start: 2628000, end: Infinity,reward: 0 }
];

/*
  This code calculates the annual reward based on block height.

  ┌──────────────────────────────────────────────────────────────┐
  │  Rewards Timeline (Blocks and Rewards per Period)            │
  │                                                              │
  │  start     end       reward                                  │
  │  ─────────────────────────────────────────────────────────  │
  │  0        262800    202                                     │
  │  262800   525600    151                                     │
  │  525600   788400    113                                     │
  │  788400   1051200   85                                      │
  │  1051200  1314000   64                                      │
  │  1314000  1576800   48                                      │
  │  1576800  1839600   36                                      │
  │  1839600  2102400   27                                      │
  │  2102400  2365200   20                                      │
  │  2365200  2628000   15                                      │
  │  2628000  ∞         0                                       │
  └──────────────────────────────────────────────────────────────┘

  Example Calculation:
  ───────────────────────────────────────────────────────────────
  Suppose:
  - `current_block_height = 300000`

  Step 1: Find current reward period:
  - `current` points to index 1 (since 262800 <= 300000 < 525600)
  - `current_reward = 151`
  - `current_reward_end = 525600`
  - `future_reward = 113`

  Step 2: Compute current reward portion:
  - Blocks remaining in this period = 525600 - 300000 = 225600
  - `current_reward_part = 151 * 225600 = 34,065,600`

  Step 3: Compute future reward portion:
  - `total_blocks_in_year = 720 * 365 = 262800`
  - Future blocks in year = 262800 - 225600 = 37200
  - `future_reward_part = 113 * 37200 = 4,203,600`

  Step 4: Calculate total annual reward:
  - `annual_reward = 34,065,600 + 4,203,600 = 38,269,200`

  ┌─────────────────────────────────────────────────────────────┐
  │  Visual Representation                                      │
  │                                                             │
  │  ────────────────┬───────────────┬───────────────┬───────   │
  │      202         │   *  151      │     113       │ ...      │
  │  ────────────────┴───────────────┴───────────────┴───────   │
  │  0                262800          525600          788400    │
  │       Past       Current         Future                     │
  └─────────────────────────────────────────────────────────────┘

  The `annual_reward` considers both the current and future rewards
  weighted by how long each is active within a year.
*/

const get_annual_reward =  (block_height: number) => {
  const current = rewards.findIndex((r) => r.start <= block_height && r.end > block_height);
  const current_reward = rewards[current]?.reward;
  const current_reward_end = rewards[current]?.end || 1_000_000_000_000_000;
  const future_reward = rewards[current + 1]?.reward || 0;
  const total_blocks_in_year = 720 * 365;
  const current_reward_part = current_reward * (current_reward_end - block_height);
  const future_reward_part = future_reward * (total_blocks_in_year - (current_reward_end - block_height));
  return current_reward_part + future_reward_part;
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

  // get last block height
  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();
  const current_block_height = chain_tip_data.block_height;

  const annual_reward = get_annual_reward(current_block_height);

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
