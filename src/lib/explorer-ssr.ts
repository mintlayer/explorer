import "server-only";

import { get_annual_subsidy } from "@/utils/emission";
import { getUrl } from "@/utils/network";
import { fetchAllPoolsFromApi, fetchChainTip, fetchRecentBlocksFromApi, fetchRecentTransactionsFromApi } from "@/lib/explorer-source";
import {
  getLatestBlockHeightFromDb,
  getPoolsFromDb,
  getRecentBlocksFromDb,
  getRecentTransactionsFromDb,
  savePoolsToDb,
  saveRecentBlocksToDb,
  saveRecentTransactionsToDb,
} from "@/lib/explorer-store";
import { sumPoolField } from "@/lib/pool-normalization";

const NODE_API_URL = getUrl();

export async function getHomepageTransactions(limit = 10) {
  const cached = await getRecentTransactionsFromDb(0, limit);
  if (cached.length > 0) {
    return cached;
  }

  const transactions = await fetchRecentTransactionsFromApi(0);
  await saveRecentTransactionsToDb(transactions);
  return transactions.slice(0, limit);
}

export async function getHomepageBlocks(limit = 10) {
  const cached = await getRecentBlocksFromDb(null, limit);
  if (cached.length > 0) {
    return cached;
  }

  const blocks = await fetchRecentBlocksFromApi(null, limit);
  await saveRecentBlocksToDb(blocks);
  return blocks;
}

export async function getPoolSummaryData() {
  let pools = await getPoolsFromDb();

  if (!pools.length) {
    pools = await fetchAllPoolsFromApi();
    await savePoolsToDb(pools, { pruneMissing: true });
  }

  const currentBlockHeight = (await getLatestBlockHeightFromDb()) ?? (await fetchChainTip()).block_height;
  const annualSubsidy = get_annual_subsidy(currentBlockHeight);

  const poolsAmount = sumPoolField(pools, "staker_balance");
  const delegationsAmount = sumPoolField(pools, "delegations_amount");
  const effectivePoolsAmount = sumPoolField(pools, "effective_pool_balance");
  const totalAmount = sumPoolField(pools, "balance");
  let delegationCount = 0;

  for (const pool of pools) {
    delegationCount += Number.isFinite(pool.delegations_count) ? pool.delegations_count : 0;
  }

  return {
    validators_count: pools.length,
    delegation_count: delegationCount,
    pools_amount: poolsAmount,
    delegations_amount: delegationsAmount,
    total_amount: totalAmount,
    total_effective_amount: effectivePoolsAmount,
    total_apy: totalAmount > 0 ? ((annualSubsidy / totalAmount) * 100).toFixed(2) : 0,
    updated_at: Date.now(),
  };
}

export async function getTransactionTotal() {
  const response = await fetch(`${NODE_API_URL}/transaction`, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 120 },
  });

  const [transaction] = await response.json();
  return transaction?.tx_global_index ?? 0;
}

export async function getPoolsListData() {
  let pools = await getPoolsFromDb();

  if (!pools.length) {
    pools = await fetchAllPoolsFromApi();
    await savePoolsToDb(pools, { pruneMissing: true });
  }

  const blocks = await getHomepageBlocks(1);
  const latestBlock = blocks[0] || null;

  return {
    pools,
    blockHeight: latestBlock?.block ?? 0,
    difficulty: latestBlock?.target_difficulty ?? 0,
  };
}
