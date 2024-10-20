/**
 * total reward is determined by the following table
 * TODO: add link to the core source code
 */

export function total_reward(blockNumber: number) {
  const rewards = [
    { end: 262800, reward: 202 },
    { end: 525600, reward: 151 },
    { end: 788400, reward: 113 },
    { end: 1051200, reward: 85 },
    { end: 1314000, reward: 64 },
    { end: 1576800, reward: 48 },
    { end: 1839600, reward: 36 },
    { end: 2102400, reward: 27 },
    { end: 2365200, reward: 20 },
    { end: 2628000, reward: 15 },
  ];

  let total = 0;
  let previousEnd = 0;

  for (let i = 0; i < rewards.length; i++) {
    const currentEnd = rewards[i].end;
    const reward = rewards[i].reward;

    if (blockNumber < currentEnd) {
      total += (blockNumber - previousEnd) * reward;
      return total;
    } else {
      total += (currentEnd - previousEnd) * reward;
      previousEnd = currentEnd;
    }
  }

  return total;
}
