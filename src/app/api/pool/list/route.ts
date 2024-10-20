import { NextResponse } from "next/server";
import { getUrl, isMainNetwork } from "@/utils/network";
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

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") || 0;

  const cachedData = cache.get("list");
  if (cachedData) {
    console.log("POOLS LIST: Returning cached data");
    return NextResponse.json(cachedData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  console.log("POOLS LIST: Gather data");

  const network = isMainNetwork ? Network.Mainnet : Network.Testnet;

  const data = await getPoolsRecursive(0);
  let stats1d: any = {};
  let stats7d: any = {};
  let delegations: any = {};

  if (searchParams.get("withStats1d")) {
    const from = Math.floor(Date.now() / 1000) - 86400;
    const to = Math.floor(Date.now() / 1000);
    await Promise.all(
      data.map(async (pool: any) => {
        const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/block-stats?from=" + from + "&to=" + to, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        stats1d[pool.pool_id] = await res.json();
      }),
    );
  }

  if (searchParams.get("withStats7d")) {
    const from = Math.floor(Date.now() / 1000) - 604800;
    const to = Math.floor(Date.now() / 1000);
    await Promise.all(
      data.map(async (pool: any) => {
        const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/block-stats?from=" + from + "&to=" + to, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        stats7d[pool.pool_id] = await res.json();
      }),
    );
  }

  if (searchParams.get("withBalance")) {
    await Promise.all(
      data.map(async (pool: any) => {
        const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/delegations", {
          headers: {
            "Content-Type": "application/json",
          },
          next: {
            revalidate: 60 * 2,
          },
        });
        if (delegations[pool.pool_id]) {
          delegations[pool.pool_id].push(...(await res.json()));
        } else {
          delegations[pool.pool_id] = await res.json();
        }
      }),
    );
  }

  let response: any = {};

  response = data.map((pool: any) => {
    if (stats1d[pool.pool_id]) {
      pool.stats = {
        ...pool.stats,
        blocks_1d: stats1d[pool.pool_id].block_count,
      };
    }

    if (stats7d[pool.pool_id]) {
      pool.stats = {
        ...pool.stats,
        blocks_7d: stats7d[pool.pool_id].block_count,
      };
    }

    if (delegations[pool.pool_id] && delegations[pool.pool_id]?.length > 0) {
      pool.delegations_amount_atoms = delegations[pool.pool_id].reduce((acc: number, delegation: any) => +acc + parseInt(delegation.balance.atoms), 0);
      pool.delegations_amount = delegations[pool.pool_id].reduce((acc: number, delegation: any) => +acc + parseFloat(delegation.balance.decimal), 0);
      pool.delegations_count = delegations[pool.pool_id].length;
    } else {
      pool.delegations_amount_atoms = 0;
      pool.delegations_amount = 0;
      pool.delegations_count = 0;
    }

    const pool_balance = (BigInt(pool.staker_balance.atoms) + BigInt(pool.delegations_amount_atoms.toString())).toString();
    const staker_balance = pool.staker_balance;
    pool.margin_ratio = (pool.margin_ratio_per_thousand.replace("%", "") * 10) / 1000;
    pool.cost_per_block = parseFloat(pool.cost_per_block.decimal);

    pool.staker_balance = parseFloat(staker_balance.decimal);
    pool.balance = parseInt(pool_balance) / 1e11;
    pool.effective_pool_balance = parseInt(effective_pool_balance(network, staker_balance.atoms, pool_balance));

    return pool;
  });

  cache.set("list", response);

  return NextResponse.json(response);
}
