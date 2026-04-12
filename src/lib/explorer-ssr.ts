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
    await savePoolsToDb(pools);
  }

  const currentBlockHeight = (await getLatestBlockHeightFromDb()) ?? (await fetchChainTip()).block_height;
  const annualSubsidy = get_annual_subsidy(currentBlockHeight);

  let poolsAmount = 0;
  let delegationsAmount = 0;
  let effectivePoolsAmount = 0;
  let totalAmount = 0;
  let delegationCount = 0;

  for (const pool of pools) {
    poolsAmount += parseFloat(pool.staker_balance);
    delegationsAmount += pool.delegations_amount;
    delegationCount += pool.delegations_count;
    effectivePoolsAmount += pool.effective_pool_balance;
    totalAmount += parseFloat(pool.balance);
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
    await savePoolsToDb(pools);
  }

  const blocks = await getHomepageBlocks(1);
  const latestBlock = blocks[0] || null;

  return {
    pools,
    blockHeight: latestBlock?.block ?? 0,
    difficulty: latestBlock?.target_difficulty ?? 0,
  };
}
