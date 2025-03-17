import {
  block_subsidy_at_height,
  get_total_subsidy,
  get_annual_subsidy,
  get_annual_subsidy_delegator,
} from "./emission";

describe("block_subsidy_at_height", () => {
  it("should return the correct block subsidy at a given height", () => {
    expect(block_subsidy_at_height(0)).toEqual(202);
    expect(block_subsidy_at_height(10)).toEqual(202);
    expect(block_subsidy_at_height(262800)).toEqual(202);
    expect(block_subsidy_at_height(262801)).toEqual(151);
    expect(block_subsidy_at_height(525600)).toEqual(151);
    expect(block_subsidy_at_height(525601)).toEqual(113);
    expect(block_subsidy_at_height(788400)).toEqual(113);
    expect(block_subsidy_at_height(788401)).toEqual(85);
    expect(block_subsidy_at_height(1051200)).toEqual(85);
    expect(block_subsidy_at_height(1051201)).toEqual(64);
    expect(block_subsidy_at_height(1314000)).toEqual(64);
    expect(block_subsidy_at_height(1314001)).toEqual(48);
    expect(block_subsidy_at_height(1576800)).toEqual(48);
    expect(block_subsidy_at_height(1576801)).toEqual(36);
    expect(block_subsidy_at_height(1839600)).toEqual(36);
    expect(block_subsidy_at_height(1839601)).toEqual(27);
    expect(block_subsidy_at_height(2102400)).toEqual(27);
    expect(block_subsidy_at_height(2102401)).toEqual(20);
    expect(block_subsidy_at_height(2365200)).toEqual(20);
    expect(block_subsidy_at_height(2365201)).toEqual(15);
    expect(block_subsidy_at_height(2628000)).toEqual(15);
    expect(block_subsidy_at_height(2628001)).toEqual(0);
    expect(block_subsidy_at_height(2628301)).toEqual(0);
  });
});

describe("get_total_subsidy", () => {
  it("should return the correct total subsidy at a given height", () => {
    expect(get_total_subsidy(0)).toEqual(0);
    expect(get_total_subsidy(1)).toEqual(202);
    expect(get_total_subsidy(10)).toEqual(2020);
    expect(get_total_subsidy(262800)).toEqual(53085600); // 202 * 262800
    expect(get_total_subsidy(262801)).toEqual(53085751); // 202 * 262800 + 151
    expect(get_total_subsidy(525600)).toEqual(92768400); // 202 * 262800 + 151 * 262800
    expect(get_total_subsidy(525601)).toEqual(92768513); // 202 * 262800 + 151 * 262800 + 113
    expect(get_total_subsidy(788400)).toEqual(122464800); // 202 * 262800 + 151 * 262800 + 113 * 262800
    expect(get_total_subsidy(788401)).toEqual(122464885); // 202 * 262800 + 151 * 262800 + 113 * 262800 + 85
    expect(get_total_subsidy(1051200)).toEqual(144802800); // 202 * 262800 + 151 * 262800 + 113 * 262800 + 85 * 262800
  });
});

describe("get_annual_subsidy", () => {
  it("should return the correct annual subsidy at a given height", () => {
    expect(get_annual_subsidy(0)).toEqual(53085600); // 202 * 262800
    expect(get_annual_subsidy(1)).toEqual(53085549); // 202 * 262799 + 151 * 1
    expect(get_annual_subsidy(10)).toEqual(53085090); // 202 * 262790 + 151 * 10
    expect(get_annual_subsidy(262800)).toEqual(39682800); // 151 * 262800
    expect(get_annual_subsidy(262801)).toEqual(39682762); // 151 * 262799 + 113
    expect(get_annual_subsidy(2627999)).toEqual(15); // 15
    expect(get_annual_subsidy(2628000)).toEqual(0); // 0 because 2628000 is the last block and delegator will not get any reward for it
    expect(get_annual_subsidy(2628001)).toEqual(0); // 0
  });
})

describe("get_annual_subsidy_delegator", () => {
  const profitable_pool = {
    cost_per_block: 0,
    margin_ratio: 0,
  };
  const not_profitable_pool = {
    cost_per_block: 202,
    margin_ratio: 1,
  };

  it("should return the correct annual subsidy for a delegator at a given height", () => {
    const delegator_stake_ratio = 0.5;
    expect(get_annual_subsidy_delegator(0, profitable_pool, delegator_stake_ratio)).toEqual(26542800);
    expect(get_annual_subsidy_delegator(10, profitable_pool, delegator_stake_ratio)).toEqual(26542545);
    expect(get_annual_subsidy_delegator(2628001, profitable_pool, delegator_stake_ratio)).toEqual(0);
  });

  it("should return the zero annual subsidy for a delegation to non profitable pool", () => {
    const delegator_stake_ratio = 0.5;
    const block_height = 0;
    expect(get_annual_subsidy_delegator(block_height, not_profitable_pool, delegator_stake_ratio)).toEqual(0);
  });
});
