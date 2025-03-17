export const EMISSION_TABLE = [
  { range: [0      , 262800  ], reward: 202 },
  { range: [262801 , 525600  ], reward: 151 },
  { range: [525601 , 788400  ], reward: 113 },
  { range: [788401 , 1051200 ], reward: 85 },
  { range: [1051201, 1314000 ], reward: 64 },
  { range: [1314001, 1576800 ], reward: 48 },
  { range: [1576801, 1839600 ], reward: 36 },
  { range: [1839601, 2102400 ], reward: 27 },
  { range: [2102401, 2365200 ], reward: 20 },
  { range: [2365201, 2628000 ], reward: 15 },
  { range: [2628001, Infinity], reward: 0 }
];

export function get_total_subsidy(blockNumber: number) {
  let total = 0;
  let previousEnd = 0;

  for (const { range, reward } of EMISSION_TABLE) {
    const [start, end] = range;
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
  const current = EMISSION_TABLE.findIndex(({ range }) => range[0] <= block_height && range[1] >= block_height);
  return EMISSION_TABLE[current]?.reward;
}

export const get_annual_subsidy =  (block_height: number) => {
  const current = EMISSION_TABLE.findIndex(({ range }) => range[0] <= block_height && range[1] >= block_height);
  const current_subsidy = EMISSION_TABLE[current]?.reward;
  const current_subsidy_end = EMISSION_TABLE[current]?.range[1] || Infinity;
  const future_subsidy = EMISSION_TABLE[current + 1]?.reward || 0;
  const total_blocks_in_year = 720 * 365;
  const current_subsidy_part = current_subsidy === 0 ? 0 : current_subsidy * (current_subsidy_end - block_height);
  const future_subsidy_part = future_subsidy === 0 ? 0 : future_subsidy * (total_blocks_in_year - (current_subsidy_end - block_height));
  return current_subsidy_part + future_subsidy_part;
}

export const get_annual_subsidy_delegator =  (block_height: number, pool: any, delegator_stake_ratio: number) => {
  const current = EMISSION_TABLE.findIndex(({ range }) => range[0] <= block_height && range[1] > block_height);
  const current_reward = (EMISSION_TABLE[current].reward - pool.cost_per_block) * (1 - pool.margin_ratio) * delegator_stake_ratio;
  const current_reward_end = EMISSION_TABLE[current].range[1] || Infinity;
  const future_reward = EMISSION_TABLE[current + 1] && EMISSION_TABLE[current + 1].reward ? (EMISSION_TABLE[current + 1].reward - pool.cost_per_block) * (1 - pool.margin_ratio) * delegator_stake_ratio : 0;
  const total_blocks_in_year = 720 * 365;
  const current_reward_part = current_reward === 0 ? 0 : current_reward * (current_reward_end - block_height);
  const future_reward_part = future_reward === 0 ? 0 : future_reward * (total_blocks_in_year - (current_reward_end - block_height));
  return current_reward_part + future_reward_part;
}
