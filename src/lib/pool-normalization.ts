function toFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace("%", "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toInteger(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function normalizePoolPayload(pool: any) {
  if (!pool || typeof pool !== "object") {
    return pool;
  }

  const stakerBalance = toFiniteNumber(pool.staker_balance);
  const delegationsAmount = toFiniteNumber(pool.delegations_amount, toFiniteNumber(pool.delegations_balance));
  const balance = toFiniteNumber(pool.balance, toFiniteNumber(pool.pool_balance, stakerBalance + delegationsAmount));
  const effectivePoolBalance = toFiniteNumber(pool.effective_pool_balance, balance);

  const marginRatio =
    pool.margin_ratio != null
      ? toFiniteNumber(pool.margin_ratio)
      : pool.margin_ratio_per_thousand != null
        ? (toFiniteNumber(pool.margin_ratio_per_thousand) * 10) / 1000
        : 0;

  return {
    ...pool,
    pool: pool.pool ?? pool.pool_id,
    pool_id: pool.pool_id ?? pool.pool,
    cost_per_block: toFiniteNumber(pool.cost_per_block),
    staker_balance: stakerBalance,
    delegations_amount: delegationsAmount,
    delegations_balance: toFiniteNumber(pool.delegations_balance, delegationsAmount).toString(),
    delegations_count: toInteger(pool.delegations_count),
    balance,
    pool_balance: toFiniteNumber(pool.pool_balance, balance).toString(),
    effective_pool_balance: effectivePoolBalance,
    margin_ratio: marginRatio,
    margin_ratio_percent: pool.margin_ratio_percent ?? pool.margin_ratio_per_thousand ?? "0%",
    mark: toInteger(pool.mark),
  };
}

export function sumPoolField(pools: any[], field: string) {
  return pools.reduce((total, pool) => total + toFiniteNumber(pool?.[field]), 0);
}
