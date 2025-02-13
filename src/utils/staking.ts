import {get_annual_subsidy, get_annual_subsidy_delegator} from "@/utils/emission";

type calculateDelegationInfoType = {
  amountToDelegate: number,
  pool: any,
  blockHeight: number,
  difficulty: number,
}

const TOTAL_BLOCKS_PER_DAY = 720;

export const calculateDelegationInfo = ({ amountToDelegate, pool, blockHeight, difficulty }: calculateDelegationInfoType) => {
  const probability_per_second = pool.effective_pool_balance * 1e11 * difficulty;

  // APY estimation
  const pool_blocks_per_day = probability_per_second * 24 * 60 * 60;
  const part = amountToDelegate / (amountToDelegate + pool.delegations_amount + pool.staker_balance);

  const annual_subsidy_delegator = get_annual_subsidy_delegator(blockHeight, pool, part);
  const annual_subsidy_pool = get_annual_subsidy(blockHeight);

  // blocks_per_day / 720 is a part of 720 (total blocks in a day)
  const apy = ((annual_subsidy_delegator * pool_blocks_per_day / TOTAL_BLOCKS_PER_DAY) / amountToDelegate) * 100; // * 100 to display percent

  // other labels
  const reward_per_day_pool = pool_blocks_per_day * (annual_subsidy_pool / (TOTAL_BLOCKS_PER_DAY * 365));
  const reward_per_day_delegator = pool_blocks_per_day * (annual_subsidy_delegator / (TOTAL_BLOCKS_PER_DAY * 365)); // left for approximate reference
  const part_label = (part * 100).toFixed(2);
  const hours_for_block = (1 / probability_per_second / 3600).toFixed(2);

  return {
    apy,
    reward_per_day_pool,
    reward_per_day_delegator,
    part_label,
    hours_for_block,
  };
}
