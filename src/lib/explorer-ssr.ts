import "server-only";

import { get_annual_subsidy } from "@/utils/emission";
import { getUrl } from "@/utils/network";
import { fetchAllPoolsFromApi, fetchChainTip, fetchMempoolTransactionsFromApi, fetchRecentBlocksFromApi, fetchRecentTransactionsFromApi } from "@/lib/explorer-source";
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
import { withCache } from "@/lib/server-cache";

const NODE_API_URL = getUrl();

const POOLS_SNAPSHOT_TTL_MS = Number(process.env.EXPLORER_POOLS_CACHE_SECONDS || 120) * 1000;
const POOL_SUMMARY_TTL_MS = Number(process.env.EXPLORER_POOL_SUMMARY_CACHE_SECONDS || 30) * 1000;
const MEMPOOL_TTL_MS = Number(process.env.EXPLORER_MEMPOOL_CACHE_SECONDS || 10) * 1000;
const TRANSACTION_TOTAL_TTL_MS = Number(process.env.EXPLORER_TX_TOTAL_CACHE_SECONDS || 60) * 1000;

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

export function getHomepageMempoolTransactions(limit = 10) {
  return withCache(`mempool:${limit}`, MEMPOOL_TTL_MS, () => fetchMempoolTransactionsFromApi(limit));
}

/**
 * Single shared pool snapshot for every server-side consumer (homepage
 * summary, /pools page, /api/pool/list, /api/pool/summary).
 *
 * Postgres-backed deployments (mainnet) keep their existing behavior: the DB
 * is populated by cron workers and always read first. API-backed deployments
 * (testnet) crawl the upstream API at most once per TTL; concurrent and
 * subsequent renders are served from the stale-while-revalidate cache instead
 * of fanning out to the upstream API on every render.
 */
export function getPoolsSnapshot() {
  return withCache("pools:snapshot", POOLS_SNAPSHOT_TTL_MS, async () => {
    let pools = await getPoolsFromDb();

    if (!pools.length) {
      pools = await fetchAllPoolsFromApi();
      await savePoolsToDb(pools, { pruneMissing: true });
    }

    return pools;
  });
}

function buildPoolSummary(pools: any[], currentBlockHeight: number) {
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

export function getPoolSummaryData() {
  return withCache("pools:summary", POOL_SUMMARY_TTL_MS, async () => {
    const pools = await getPoolsSnapshot();
    const currentBlockHeight = (await getLatestBlockHeightFromDb()) ?? (await fetchChainTip()).block_height;
    return buildPoolSummary(pools, currentBlockHeight);
  });
}

export function getTransactionTotal() {
  return withCache("transaction:total", TRANSACTION_TOTAL_TTL_MS, async () => {
    const response = await fetch(`${NODE_API_URL}/transaction`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 120 },
    });

    const [transaction] = await response.json();
    return transaction?.tx_global_index ?? 0;
  });
}

export async function getPoolsListData() {
  const pools = await getPoolsSnapshot();
  const blocks = await getHomepageBlocks(1);
  const latestBlock = blocks[0] || null;

  return {
    pools,
    blockHeight: latestBlock?.block ?? 0,
    difficulty: latestBlock?.target_difficulty ?? 0,
  };
}
