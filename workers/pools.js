const Database = require("better-sqlite3");
const {effective_pool_balance} = require("../src/utils/mintlayer-crypto/pkg");

const dotenv = require('dotenv');

dotenv.config();

const isMainNetwork = process.env.NETWORK === "mainnet";

console.log('process.env.NETWORK', process.env.NETWORK);

const db = new Database("data.db", { verbose: console.log });
db.exec(`
  CREATE TABLE IF NOT EXISTS pools (
    id INTEGER PRIMARY KEY,
    status TEXT CHECK(status IN ('pending', 'processing', 'done')),
    result TEXT,
    updated_at INTEGER
  );
`);
db.pragma("max_page_count = 2147483646");
db.pragma("cache_size = -64000");
db.pragma("journal_mode = WAL");

const NODE_API_URL = `https://api-server${isMainNetwork?'':'-lovelace'}.mintlayer.org/api/v2`;

console.log('NODE_API_URL', NODE_API_URL);

async function fetchWithRetry(url, retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        return res;
      }
      console.warn(`Attempt ${i + 1} failed: ${res.statusText}`);
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function getPools(retries = 3) {
  let offset = 0;
  const seenPools = new Set(); // To track unique pool_ids
  const allPools = [];

  console.time("Fetching pools");
  while (true) {
    try {
      const res = await fetchWithRetry(`${NODE_API_URL}/pool?offset=${offset}`, retries);

      if (!res.ok) {
        console.error(`Error fetching offset ${offset}: ${res.statusText}`);
        break;
      }

      const data = await res.json();

      if (data.length === 0) break;

      for (const pool of data) {
        if (!seenPools.has(pool.pool_id)) {
          seenPools.add(pool.pool_id);
          allPools.push(pool);
        }
      }

      offset += 10;
    } catch (err) {
      console.error(`Failed to fetch pools at offset ${offset}:`, err);
      break;
    }
  }

  console.timeEnd("Fetching pools");
  return allPools;
}

async function fetchDelegations(poolIds, retries = 3) {
  const batchSize = 10;
  const results = {};

  for (let i = 0; i < poolIds.length; i += batchSize) {
    const batch = poolIds.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (poolId) => {
        try {
          const res = await fetchWithRetry(`${NODE_API_URL}/pool/${poolId}/delegations`, retries);
          results[poolId] = await res.json();
        } catch (err) {
          console.error(`Failed to fetch delegations for pool ${poolId}:`, err);
        }
      })
    );
  }

  return results;
}

const processPools = async () => {
  console.log("Gathering data...");

  const network = isMainNetwork ? 0 : 1;

  const data = await getPools();
  console.log('Pools fetched:', data.length);
  let stats1d = {};
  let stats7d = {};

  // if (searchParams.get("withStats1d")) {
  //   const from = Math.floor(Date.now() / 1000) - 86400;
  //   const to = Math.floor(Date.now() / 1000);
  //   await Promise.all(
  //     data.map(async (pool) => {
  //       const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/block-stats?from=" + from + "&to=" + to, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       stats1d[pool.pool_id] = await res.json();
  //     }),
  //   );
  // }

  // if (searchParams.get("withStats7d")) {
  //   const from = Math.floor(Date.now() / 1000) - 604800;
  //   const to = Math.floor(Date.now() / 1000);
  //   await Promise.all(
  //     data.map(async (pool) => {
  //       const res = await fetch(NODE_API_URL + "/pool/" + pool.pool_id + "/block-stats?from=" + from + "&to=" + to, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       stats7d[pool.pool_id] = await res.json();
  //     }),
  //   );
  // }

  const delegations = await fetchDelegations(data.map(pool => pool.pool_id));

  let result = {};

  result = data.map((pool) => {
    if (stats1d[pool.pool_id]) {
      pool.stats = {
        ...pool.stats,
        blocks_1d: stats1d[pool.pool_id].block_count,
      };
    }

    if (stats7d[pool.pool_id]) {
      pool.stats = {
        ...pool.stats,
        blocks_7d: stats7d[pool.pool_id].block_count,
      };
    }

    if (delegations[pool.pool_id]) {
      pool.delegations_amount_atoms = delegations[pool.pool_id].reduce((acc, delegation) => +acc + parseInt(delegation.balance.atoms), 0);
      pool.delegations_amount = delegations[pool.pool_id].reduce((acc, delegation) => +acc + parseFloat(delegation.balance.decimal), 0);
      pool.delegations_count = delegations[pool.pool_id].length;
    } else {
      pool.delegations_amount_atoms = 0;
      pool.delegations_amount = 0;
      pool.delegations_count = 0;
    }

    const pool_balance = (BigInt(pool.staker_balance.atoms) + BigInt(pool.delegations_amount_atoms.toString())).toString();
    const staker_balance = pool.staker_balance;
    pool.margin_ratio = (pool.margin_ratio_per_thousand.replace("%", "") * 10) / 1000;
    pool.cost_per_block = parseFloat(pool.cost_per_block.decimal);

    pool.staker_balance = parseFloat(staker_balance.decimal);
    pool.balance = parseInt(pool_balance) / 1e11;
    pool.effective_pool_balance = parseInt(effective_pool_balance(network, staker_balance.atoms, pool_balance));

    return pool;
  });

  console.log(JSON.stringify(result, null, 2));

  console.log('Saving data to the database...');

  db.prepare(`
  INSERT OR REPLACE INTO pools (id, result, status, updated_at)
  VALUES (1, ?, 'done', ?)
  `).run(JSON.stringify(result), Date.now());

  console.log("Update completed");
};


processPools();
