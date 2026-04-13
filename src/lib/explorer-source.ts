import "server-only";

import { Amount, effective_pool_balance, Network } from "@/utils/mintlayer-crypto/pkg";
import { getNetwork, getUrl, getUrlSide } from "@/utils/network";
import { formatML } from "@/utils/numbers";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();
const activeNetwork = getNetwork() === "mainnet" ? Network.Mainnet : Network.Testnet;

export const ipfsToHttps = (url: string) => {
  if (!url || !url.startsWith("ipfs://")) {
    return url;
  }

  const cleanUrl = url.replace("ipfs://", "").split("/");
  return `https://${cleanUrl[0]}.ipfs.w3s.link${cleanUrl[1] ? `/${cleanUrl[1]}` : ""}`;
};

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}: ${url}`);
  }

  return response.json();
}

async function fetchTokenById(tokenId: string) {
  try {
    return await fetchJson(`${NODE_API_URL}/token/${tokenId}`);
  } catch (_error) {
    return null;
  }
}

async function fetchNftById(tokenId: string) {
  try {
    return await fetchJson(`${NODE_API_URL}/nft/${tokenId}`);
  } catch (_error) {
    return null;
  }
}

export async function fetchChainTip() {
  return fetchJson(`${NODE_API_URL}/chain/tip`, { cache: "no-store" });
}

async function getBlocksRecursive(blockId: string, limit: number): Promise<any[]> {
  const result = [];
  let currentId: string | null = blockId;

  for (let index = 0; index < limit && currentId; index += 1) {
    const data = await fetchJson(`${NODE_API_URL}/block/${currentId}`, {
      cache: "force-cache",
    });
    result.push(data);
    currentId = data?.header?.previous_block_id || null;
  }

  return result;
}

export async function fetchRecentBlocksFromApi(before?: number | null, limit = 10) {
  let height: number;
  let blockId: string;

  if (before == null) {
    const chainTip = await fetchChainTip();
    height = chainTip.block_height;
    blockId = chainTip.block_id;
  } else {
    height = before;
    blockId = await fetchJson(`${NODE_API_URL}/chain/${before}`, {
      cache: "force-cache",
    });
  }

  const blocks = await getBlocksRecursive(blockId, limit);

  return blocks.map((value: any, index: number) => ({
    id: value.id || value.block_id || value.header?.previous_block_id || `${height - index}`,
    block: height - index,
    datetime: value.header.timestamp.timestamp,
    transactions: value.body.transactions.length,
    pool: value.body.reward[0].pool_id,
    pool_label: `${value.body.reward[0].pool_id.slice(0, 8)}...${value.body.reward[0].pool_id.slice(-8)}`,
    target_difficulty: parseInt(value.header.consensus_data.target, 16) / (Math.pow(2, 256) - 1),
  }));
}

export async function fetchRecentTransactionsFromApi(offset = 0) {
  const chainTip = await fetchChainTip();
  const transactions = await fetchJson(`${NODE_API_URL}/transaction?offset=${offset}`);

  return transactions.map((transaction: any) => {
    const amount = transaction.outputs.reduce((acc: bigint, value: any) => {
      if (value?.type === "Transfer" && value?.value?.type === "Coin") {
        return BigInt(value.value.amount.atoms) + acc;
      }

      if (value?.type === "DelegateStaking") {
        return BigInt(value.amount.atoms) + acc;
      }

      if (value?.type === "LockThenTransfer") {
        return BigInt(value.value.amount.atoms) + acc;
      }

      if (value?.type === "CreateStakePool") {
        return BigInt(value.data.amount.atoms) + acc;
      }

      return acc;
    }, BigInt(0));

    return {
      block: chainTip.block_height - transaction.confirmations,
      fee: transaction.fee.decimal,
      transaction: transaction.id,
      label: `${transaction.id.slice(0, 5)}...${transaction.id.slice(-5)}`,
      input: transaction.inputs.length,
      output: transaction.outputs.length,
      timestamp: transaction.timestamp,
      amount: formatML((Number(amount) / 1e11).toString()),
    };
  });
}

export async function fetchPoolDelegationsFromApi(poolId: string) {
  return fetchJson(`${NODE_API_URL}/pool/${poolId}/delegations`, {
    cache: "no-store",
  });
}

export function enrichPool(pool: any, delegations: any[]) {
  const delegationsAmountAtoms = delegations.reduce((acc: bigint, delegation: any) => acc + BigInt(delegation.balance.atoms), BigInt(0));
  const delegationsAmount = delegations.reduce((acc: number, delegation: any) => acc + parseFloat(delegation.balance.decimal), 0);
  const poolBalanceAtoms = BigInt(pool.staker_balance.atoms) + delegationsAmountAtoms;

  return {
    ...pool,
    pool: pool.pool_id,
    pool_id: pool.pool_id,
    delegations_amount_atoms: delegationsAmountAtoms.toString(),
    delegations_amount: delegationsAmount,
    delegations_count: delegations.length,
    margin_ratio: (pool.margin_ratio_per_thousand.replace("%", "") * 10) / 1000,
    margin_ratio_percent: pool.margin_ratio_per_thousand,
    cost_per_block: parseFloat(pool.cost_per_block.decimal),
    staker_balance: parseFloat(pool.staker_balance.decimal),
    balance: Number(poolBalanceAtoms) / 1e11,
    pool_balance: (Number(poolBalanceAtoms) / 1e11).toString(),
    delegations_balance: (Number(delegationsAmountAtoms) / 1e11).toString(),
    mark: 0,
    effective_pool_balance:
      Number(
        effective_pool_balance(
          activeNetwork,
          Amount.from_atoms(pool.staker_balance.atoms),
          Amount.from_atoms(poolBalanceAtoms.toString()),
        ).atoms(),
      ) / 1e11,
  };
}

async function fetchDelegationsForPools(poolIds: string[]) {
  const result: Record<string, any[]> = {};
  const batchSize = 10;

  for (let index = 0; index < poolIds.length; index += batchSize) {
    const batch = poolIds.slice(index, index + batchSize);
    const entries = await Promise.all(batch.map(async (poolId) => [poolId, await fetchPoolDelegationsFromApi(poolId)] as const));

    for (const [poolId, delegations] of entries) {
      result[poolId] = delegations;
    }
  }

  return result;
}

export async function fetchAllPoolsFromApi() {
  let offset = 0;
  const seen = new Set<string>();
  const pools: any[] = [];

  while (true) {
    const page = await fetchJson(`${NODE_API_URL}/pool?offset=${offset}`, {
      cache: "no-store",
    });

    if (!page.length) {
      break;
    }

    for (const pool of page) {
      if (!seen.has(pool.pool_id)) {
        seen.add(pool.pool_id);
        pools.push(pool);
      }
    }

    offset += 10;
  }

  const delegations = await fetchDelegationsForPools(pools.map((pool: any) => pool.pool_id));
  return pools.map((pool: any) => enrichPool(pool, delegations[pool.pool_id] || []));
}

export async function fetchPoolDetailsFromApi(poolId: string) {
  const data = await fetchJson(`${NODE_API_URL}/pool/${poolId}`, {
    cache: "no-store",
  }).catch(async () => {
    const anotherNetwork = await fetchJson(`${NODE_SIDE_API_URL}/pool/${poolId}`, {
      cache: "no-store",
    }).catch(() => null);

    if (anotherNetwork?.vrf_public_key) {
      return { error: "Pool found in another network" };
    }

    return { error: "Invalid pool Id" };
  });

  if (data.error) {
    return data;
  }

  const delegations = await fetchPoolDelegationsFromApi(poolId);
  const delegationsBalanceAtoms = delegations.reduce((acc: bigint, delegation: any) => acc + BigInt(delegation.balance.atoms), BigInt(0));
  const poolBalanceAtoms = BigInt(data.staker_balance.atoms) + delegationsBalanceAtoms;

  return {
    pool: poolId,
    pool_id: poolId,
    pool_balance: (Number(poolBalanceAtoms) / 1e11).toString(),
    effective_pool_balance:
      (
        Number(
          effective_pool_balance(
            activeNetwork,
            Amount.from_atoms(data.staker_balance.atoms),
            Amount.from_atoms(poolBalanceAtoms.toString()),
          ).atoms(),
        ) / 1e11
      ).toString(),
    cost_per_block: data.cost_per_block.decimal,
    margin_ratio_per_thousand: data.margin_ratio_per_thousand.replace("%", "") * 10,
    margin_ratio: (data.margin_ratio_per_thousand.replace("%", "") * 10) / 1000,
    margin_ratio_percent: data.margin_ratio_per_thousand,
    staker_balance: data.staker_balance.decimal,
    vrf_public_key: data.vrf_public_key,
    decommission_destination: data.decommission_destination,
    delegations_balance: (Number(delegationsBalanceAtoms) / 1e11).toString(),
    delegations_count: delegations.length,
    mark: 0,
  };
}

export async function fetchPoolStatsFromApi(poolId: string) {
  const currentTime = Math.floor(Date.now() / 1000);
  const entries = await Promise.all(
    Array.from({ length: 30 }, async (_, index) => {
      const dayEnd = currentTime - index * 86400;
      const dayStart = dayEnd - 86400;
      const data = await fetchJson(`${NODE_API_URL}/pool/${poolId}/block-stats?from=${dayStart}&to=${dayEnd}`, {
        cache: "no-store",
      });

      return [new Date(dayStart * 1000).toISOString().split("T")[0], data] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function fetchTokensFromApi() {
  const network = getNetwork() === "mainnet" ? "mainnet" : "testnet";
  const networkId = network === "mainnet" ? 0 : 1;

  const batch = await fetchJson(`https://mojito-api.mintlayer.org/mintlayer/${network}/batch`, {
    method: "POST",
    body: JSON.stringify({
      ids: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
      type: "/token?offset=:address",
      network: networkId,
    }),
  });

  const ids = Array.from(new Set<string>(batch.results.flat()));
  const tokenData = await Promise.all(ids.map((tokenId: string) => fetchTokenById(tokenId)));

  const metadata = await Promise.all(
    tokenData.map(async (token: any) => {
      if (!token || token.error) {
        return null;
      }

      const metadataUrl = ipfsToHttps(token.metadata_uri.string);
      if (!metadataUrl) {
        return null;
      }

      try {
        const response = await fetch(metadataUrl);
        return await response.json();
      } catch (_error) {
        return null;
      }
    }),
  );

  return ids
    .map((tokenId: string, index: number) => {
      const token = tokenData[index];
      if (!token || token.error) {
        return null;
      }

      return {
        id: tokenId,
        frozen: token.frozen,
        is_locked: token.is_locked,
        is_token_freezable: token.is_token_freezable,
        is_token_unfreezable: token.is_token_unfreezable,
        token_ticker: token.token_ticker.string,
        metadata_uri: token.metadata_uri.string,
        total_supply:
          typeof token.total_supply === "string"
            ? token.total_supply
            : token.total_supply.Fixed.atoms / Math.pow(10, token.number_of_decimals),
        circulating_supply: token.circulating_supply.decimal,
        metadata: metadata[index],
      };
    })
    .filter(Boolean);
}

export async function fetchNftsFromApi() {
  const tokenIds: string[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchJson(`${NODE_API_URL}/token?offset=${offset}`);
    tokenIds.push(...page);

    if (page.length < 10) {
      break;
    }

    offset += 10;
  }

  const ids = Array.from(new Set<string>(tokenIds));
  const tokenData = await Promise.all(ids.map((tokenId: string) => fetchNftById(tokenId)));

  return ids
    .map((tokenId: string, index: number) => {
      const token = tokenData[index];
      if (!token || token.error) {
        return null;
      }

      const ticker = token.ticker?.string;
      if (!ticker) {
        return null;
      }

      return {
        id: tokenId,
        ticker,
        name: token.name?.string || null,
        description: token.description?.string || null,
        creator: token.creator || null,
        owner: token.owner || null,
        media_uri: token.media_uri?.string || null,
        icon_uri: token.icon_uri?.string || null,
        additional_metadata_uri: token.additional_metadata_uri?.string || null,
      };
    })
    .filter(Boolean);
}
