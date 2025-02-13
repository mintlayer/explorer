export const EMISSION_TABLE = [
  { start: 0      , end: 262800 , reward: 202 },
  { start: 262801 , end: 525600 , reward: 151 },
  { start: 525601 , end: 788400 , reward: 113 },
  { start: 788401 , end: 1051200, reward: 85 },
  { start: 1051201, end: 1314000, reward: 64 },
  { start: 1314001, end: 1576800, reward: 48 },
  { start: 1576801, end: 1839600, reward: 36 },
  { start: 1839601, end: 2102400, reward: 27 },
  { start: 2102401, end: 2365200, reward: 20 },
  { start: 2365201, end: 2628000, reward: 15 },
  { start: 2628001, end: Infinity,reward: 0 }
];

export function get_total_subsidy(blockNumber: number) {
  let total = 0;
  let previousEnd = 0;

  for (const { start, end, reward } of EMISSION_TABLE) {
    if (blockNumber < start) {
      break;
    }

    const currentEnd = Math.min(end, blockNumber);
    total += (currentEnd - previousEnd) * reward;
    previousEnd = currentEnd;
  }

  return total;
}

export const block_subsidy_at_height = (block_height: number) => {
  const current = EMISSION_TABLE.findIndex((r) => r.start <= block_height && r.end >= block_height);
  return EMISSION_TABLE[current]?.reward;
}

export const get_annual_subsidy =  (block_height: number) => {
  const current = EMISSION_TABLE.findIndex((r) => r.start <= block_height && r.end >= block_height);
  const current_subsidy = EMISSION_TABLE[current]?.reward;
  const current_subsidy_end = EMISSION_TABLE[current]?.end || Infinity;
  const future_subsidy = EMISSION_TABLE[current + 1]?.reward || 0;
  const total_blocks_in_year = 720 * 365;
  const current_subsidy_part = current_subsidy * (current_subsidy_end - block_height);
  const future_subsidy_part = future_subsidy * (total_blocks_in_year - (current_subsidy_end - block_height));
  return current_subsidy_part + future_subsidy_part;
}

export const get_annual_subsidy_delegator =  (block_height: number, pool: any, part: any) => {
  const current = EMISSION_TABLE.findIndex((r) => r.start <= block_height && r.end > block_height);
  const current_reward = (EMISSION_TABLE[current]?.reward - pool.cost_per_block) * (1 - pool.margin_ratio) * part;
  const current_reward_end = EMISSION_TABLE[current]?.end || Infinity;
  const future_reward = EMISSION_TABLE[current + 1]?.reward ? (EMISSION_TABLE[current + 1]?.reward - pool.cost_per_block) * (1 - pool.margin_ratio) * part : 0;
  const total_blocks_in_year = 720 * 365;
  const current_reward_part = current_reward * (current_reward_end - block_height);
  const future_reward_part = future_reward * (total_blocks_in_year - (current_reward_end - block_height));
  return current_reward_part + future_reward_part;
}
