const fs = require("fs");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const { effective_pool_balance, Amount } = require("../src/utils/mintlayer-crypto/pkg");

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL or POSTGRES_URL is required");
  process.exit(1);
}

const isMainNetwork = process.env.NETWORK === "mainnet";
const network = isMainNetwork ? 0 : 1;
const NODE_API_URL = process.env.NODE_API_URL || `https://api-server${isMainNetwork ? "" : "-lovelace"}.mintlayer.org/api/v2`;
const RECENT_TRANSACTIONS_LIMIT = Number(process.env.EXPLORER_RECENT_TRANSACTIONS_LIMIT || 100);
const RECENT_BLOCKS_LIMIT = Number(process.env.EXPLORER_RECENT_BLOCKS_LIMIT || 100);

const pg = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.POSTGRES_POOL_SIZE || 10),
});

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }

  return response.json();
}

async function ensureSchema() {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS explorer_recent_transactions (
      transaction_id TEXT PRIMARY KEY,
      block_height BIGINT,
      timestamp BIGINT,
      payload JSONB NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS explorer_recent_blocks (
      block_height BIGINT PRIMARY KEY,
      block_id TEXT UNIQUE NOT NULL,
      block_timestamp BIGINT,
      payload JSONB NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS explorer_pools (
      pool_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS explorer_pool_delegations (
      pool_id TEXT NOT NULL,
      delegation_id TEXT NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (pool_id, delegation_id)
    );

    CREATE TABLE IF NOT EXISTS explorer_pool_daily_stats (
      pool_id TEXT NOT NULL,
      stat_date DATE NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (pool_id, stat_date)
    );

    CREATE TABLE IF NOT EXISTS explorer_tokens (
      token_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS explorer_nfts (
      nft_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function ipfsToHttps(url) {
  if (!url || !url.startsWith("ipfs://")) {
    return url;
  }

  const cleanUrl = url.replace("ipfs://", "").split("/");
  return `https://${cleanUrl[0]}.ipfs.w3s.link${cleanUrl[1] ? `/${cleanUrl[1]}` : ""}`;
}

async function fetchChainTip() {
  return fetchJson(`${NODE_API_URL}/chain/tip`);
}

async function fetchRecentTransactions() {
  const chainTip = await fetchChainTip();
  const transactions = await fetchJson(`${NODE_API_URL}/transaction?offset=0`);

  return transactions.map((transaction) => {
    const amount = transaction.outputs.reduce((acc, value) => {
      if (value?.type === "Transfer" && value?.value?.type === "Coin") {
        return BigInt(value.value.amount.atoms) + acc;
      }

      if (value?.type === "DelegateStaking") {
        return BigInt(value.amount.atoms) + acc;
      }

      if (value?.type === "LockThenTransfer") {
        return BigInt(value.value.amount.atoms) + acc;
      }

      if (value?.type === "CreateStakePool") {
        return BigInt(value.data.amount.atoms) + acc;
      }

      return acc;
    }, BigInt(0));

    return {
      block: chainTip.block_height - transaction.confirmations,
      fee: transaction.fee.decimal,
      transaction: transaction.id,
      label: `${transaction.id.slice(0, 5)}...${transaction.id.slice(-5)}`,
      input: transaction.inputs.length,
      output: transaction.outputs.length,
      timestamp: transaction.timestamp,
      amount: (Number(amount) / 1e11).toString(),
    };
  });
}

async function fetchRecentBlocks() {
  const chainTip = await fetchChainTip();
  const result = [];
  let blockId = chainTip.block_id;

  for (let index = 0; index < 10 && blockId; index += 1) {
    const block = await fetchJson(`${NODE_API_URL}/block/${blockId}`);
    result.push({
      id: block.id || block.block_id || blockId,
      block: chainTip.block_height - index,
      datetime: block.header.timestamp.timestamp,
      transactions: block.body.transactions.length,
      pool: block.body.reward[0].pool_id,
      pool_label: `${block.body.reward[0].pool_id.slice(0, 8)}...${block.body.reward[0].pool_id.slice(-8)}`,
      target_difficulty: parseInt(block.header.consensus_data.target, 16) / (Math.pow(2, 256) - 1),
    });
    blockId = block.header.previous_block_id;
  }

  return result;
}

async function fetchPoolDelegations(poolId) {
  return fetchJson(`${NODE_API_URL}/pool/${poolId}/delegations`);
}

function enrichPool(pool, delegations) {
  const delegationsAmountAtoms = delegations.reduce((acc, delegation) => acc + BigInt(delegation.balance.atoms), BigInt(0));
  const delegationsAmount = delegations.reduce((acc, delegation) => acc + parseFloat(delegation.balance.decimal), 0);
  const poolBalanceAtoms = BigInt(pool.staker_balance.atoms) + delegationsAmountAtoms;

  return {
    ...pool,
    pool: pool.pool_id,
    delegations_amount_atoms: delegationsAmountAtoms.toString(),
    delegations_amount: delegationsAmount,
    delegations_count: delegations.length,
    margin_ratio: (pool.margin_ratio_per_thousand.replace("%", "") * 10) / 1000,
    margin_ratio_percent: pool.margin_ratio_per_thousand,
    cost_per_block: parseFloat(pool.cost_per_block.decimal),
    staker_balance: parseFloat(pool.staker_balance.decimal),
    balance: Number(poolBalanceAtoms) / 1e11,
    effective_pool_balance:
      Number(effective_pool_balance(network, Amount.from_atoms(pool.staker_balance.atoms), Amount.from_atoms(poolBalanceAtoms.toString())).atoms()) / 1e11,
    pool_balance: (Number(poolBalanceAtoms) / 1e11).toString(),
    delegations_balance: (Number(delegationsAmountAtoms) / 1e11).toString(),
    mark: 0,
  };
}

async function fetchPools() {
  const seenPools = new Set();
  const pools = [];
  let offset = 0;

  while (true) {
    const page = await fetchJson(`${NODE_API_URL}/pool?offset=${offset}`);

    if (!page.length) {
      break;
    }

    for (const pool of page) {
      if (!seenPools.has(pool.pool_id)) {
        seenPools.add(pool.pool_id);
        pools.push(pool);
      }
    }

    offset += 10;
  }

  const result = [];
  for (const pool of pools) {
    const delegations = await fetchPoolDelegations(pool.pool_id);
    result.push({
      poolId: pool.pool_id,
      poolDetails: enrichPool(pool, delegations),
      delegations,
    });
  }

  return result;
}

async function fetchPoolStats(poolId) {
  const currentTime = Math.floor(Date.now() / 1000);
  const stats = {};

  for (let index = 0; index < 30; index += 1) {
    const dayEnd = currentTime - index * 86400;
    const dayStart = dayEnd - 86400;
    stats[new Date(dayStart * 1000).toISOString().split("T")[0]] = await fetchJson(
      `${NODE_API_URL}/pool/${poolId}/block-stats?from=${dayStart}&to=${dayEnd}`,
    );
  }

  return stats;
}

async function fetchTokens() {
  const networkName = isMainNetwork ? "mainnet" : "testnet";
  const networkId = isMainNetwork ? 0 : 1;

  const batch = await fetchJson(`https://mojito-api.mintlayer.org/mintlayer/${networkName}/batch`, {
    method: "POST",
    body: JSON.stringify({
      ids: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
      type: "/token?offset=:address",
      network: networkId,
    }),
  });

  const ids = [...new Set(batch.results.flat())];
  const result = [];

  for (const tokenId of ids) {
    const token = await fetchJson(`${NODE_API_URL}/token/${tokenId}`);
    if (token.error) {
      continue;
    }

    let metadata = null;
    const metadataUrl = ipfsToHttps(token.metadata_uri.string);
    if (metadataUrl) {
      try {
        const response = await fetch(metadataUrl);
        metadata = await response.json();
      } catch (_error) {
        metadata = null;
      }
    }

    result.push({
      id: tokenId,
      frozen: token.frozen,
      is_locked: token.is_locked,
      is_token_freezable: token.is_token_freezable,
      is_token_unfreezable: token.is_token_unfreezable,
      token_ticker: token.token_ticker.string,
      metadata_uri: token.metadata_uri.string,
      total_supply:
        typeof token.total_supply === "string"
          ? token.total_supply
          : token.total_supply.Fixed.atoms / Math.pow(10, token.number_of_decimals),
      circulating_supply: token.circulating_supply.decimal,
      metadata,
    });
  }

  return result;
}

async function fetchNfts() {
  const tokenIds = [];
  let offset = 0;

  while (true) {
    const page = await fetchJson(`${NODE_API_URL}/token?offset=${offset}`);
    tokenIds.push(...page);

    if (page.length < 10) {
      break;
    }

    offset += 10;
  }

  const ids = [...new Set(tokenIds)];
  const result = [];

  for (const tokenId of ids) {
    const token = await fetchJson(`${NODE_API_URL}/token/${tokenId}`);
    if (token.error) {
      continue;
    }

    result.push({
      id: tokenId,
      frozen: token.frozen,
      is_locked: token.is_locked,
      is_token_freezable: token.is_token_freezable,
      is_token_unfreezable: token.is_token_unfreezable,
      token_ticker: token.token_ticker.string,
      total_supply: typeof token.total_supply === "string" ? token.total_supply : token.total_supply.Fixed.atoms / token.number_of_decimals,
      circulating_supply: token.circulating_supply.decimal,
    });
  }

  return result;
}

async function storeTransactions(transactions) {
  for (const transaction of transactions) {
    await pg.query(
      `
        INSERT INTO explorer_recent_transactions (transaction_id, block_height, timestamp, payload, fetched_at)
        VALUES ($1, $2, $3, $4::jsonb, NOW())
        ON CONFLICT (transaction_id)
        DO UPDATE SET
          block_height = EXCLUDED.block_height,
          timestamp = EXCLUDED.timestamp,
          payload = EXCLUDED.payload,
          fetched_at = NOW()
      `,
      [transaction.transaction, transaction.block, transaction.timestamp, JSON.stringify(transaction)],
    );
  }

  await pg.query(
    `
      DELETE FROM explorer_recent_transactions
      WHERE transaction_id IN (
        SELECT transaction_id
        FROM explorer_recent_transactions
        ORDER BY block_height DESC NULLS LAST, timestamp DESC NULLS LAST, fetched_at DESC
        OFFSET $1
      )
    `,
    [RECENT_TRANSACTIONS_LIMIT],
  );
}

async function storeBlocks(blocks) {
  for (const block of blocks) {
    await pg.query(
      `
        INSERT INTO explorer_recent_blocks (block_height, block_id, block_timestamp, payload, fetched_at)
        VALUES ($1, $2, $3, $4::jsonb, NOW())
        ON CONFLICT (block_height)
        DO UPDATE SET
          block_id = EXCLUDED.block_id,
          block_timestamp = EXCLUDED.block_timestamp,
          payload = EXCLUDED.payload,
          fetched_at = NOW()
      `,
      [block.block, block.id, block.datetime, JSON.stringify(block)],
    );
  }

  await pg.query(
    `
      DELETE FROM explorer_recent_blocks
      WHERE block_height IN (
        SELECT block_height
        FROM explorer_recent_blocks
        ORDER BY block_height DESC, block_timestamp DESC NULLS LAST, fetched_at DESC
        OFFSET $1
      )
    `,
    [RECENT_BLOCKS_LIMIT],
  );
}

async function storePools(pools) {
  for (const pool of pools) {
    await pg.query(
      `
        INSERT INTO explorer_pools (pool_id, payload, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (pool_id)
        DO UPDATE SET
          payload = EXCLUDED.payload,
          updated_at = NOW()
      `,
      [pool.poolId, JSON.stringify(pool.poolDetails)],
    );

    await pg.query("DELETE FROM explorer_pool_delegations WHERE pool_id = $1", [pool.poolId]);

    for (const delegation of pool.delegations) {
      await pg.query(
        `
          INSERT INTO explorer_pool_delegations (pool_id, delegation_id, payload, updated_at)
          VALUES ($1, $2, $3::jsonb, NOW())
        `,
        [pool.poolId, delegation.delegation_id, JSON.stringify(delegation)],
      );
    }

    const stats = await fetchPoolStats(pool.poolId);
    for (const [date, payload] of Object.entries(stats)) {
      await pg.query(
        `
          INSERT INTO explorer_pool_daily_stats (pool_id, stat_date, payload, updated_at)
          VALUES ($1, $2::date, $3::jsonb, NOW())
          ON CONFLICT (pool_id, stat_date)
          DO UPDATE SET
            payload = EXCLUDED.payload,
            updated_at = NOW()
        `,
        [pool.poolId, date, JSON.stringify(payload)],
      );
    }
  }
}

async function storeTokens(tokens) {
  for (const token of tokens) {
    await pg.query(
      `
        INSERT INTO explorer_tokens (token_id, payload, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (token_id)
        DO UPDATE SET
          payload = EXCLUDED.payload,
          updated_at = NOW()
      `,
      [token.id, JSON.stringify(token)],
    );
  }
}

async function storeNfts(nfts) {
  for (const nft of nfts) {
    await pg.query(
      `
        INSERT INTO explorer_nfts (nft_id, payload, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (nft_id)
        DO UPDATE SET
          payload = EXCLUDED.payload,
          updated_at = NOW()
      `,
      [nft.id, JSON.stringify(nft)],
    );
  }
}

async function main() {
  console.log("Preparing PostgreSQL schema...");
  await ensureSchema();

  console.log("Syncing latest transactions...");
  await storeTransactions(await fetchRecentTransactions());

  console.log("Syncing latest blocks...");
  await storeBlocks(await fetchRecentBlocks());

  console.log("Syncing pools and pool statistics...");
  await storePools(await fetchPools());

  console.log("Syncing tokens...");
  await storeTokens(await fetchTokens());

  console.log("Syncing NFT index...");
  await storeNfts(await fetchNfts());

  console.log("Explorer cache sync complete");
  await pg.end();
}

main().catch(async (error) => {
  console.error(error);
  await pg.end();
  process.exit(1);
});
