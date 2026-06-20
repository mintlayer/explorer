const fs = require("fs");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const { effective_pool_balance, Amount } = require("../../src/utils/mintlayer-crypto/pkg");

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required");
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

function logStep(message) {
  console.log(`[catalog ${new Date().toISOString()}] ${message}`);
}

function logWarning(message) {
  console.warn(`[catalog ${new Date().toISOString()}] WARNING: ${message}`);
}

async function closePg() {
  await pg.end();
}

const FETCH_RETRIES = 3;
const FETCH_RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, init = {}) {
  let lastError;

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
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
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        const message = error instanceof Error ? error.message : String(error);
        logWarning(`Request failed (attempt ${attempt}/${FETCH_RETRIES}), retrying in ${FETCH_RETRY_DELAY_MS * attempt}ms: ${message}`);
        await sleep(FETCH_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

async function fetchTokenById(tokenId) {
  try {
    return await fetchJson(`${NODE_API_URL}/token/${tokenId}`);
  } catch (_error) {
    return null;
  }
}

async function fetchNftById(tokenId) {
  try {
    return await fetchJson(`${NODE_API_URL}/nft/${tokenId}`);
  } catch (_error) {
    return null;
  }
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

async function fetchPoolStats(poolId) {
  const currentTime = Math.floor(Date.now() / 1000);
  const entries = await Promise.all(
    Array.from({ length: 30 }, async (_, index) => {
      const dayEnd = currentTime - index * 86400;
      const dayStart = dayEnd - 86400;
      const data = await fetchJson(`${NODE_API_URL}/pool/${poolId}/block-stats?from=${dayStart}&to=${dayEnd}`);
      return [new Date(dayStart * 1000).toISOString().split("T")[0], data];
    }),
  );

  return Object.fromEntries(entries);
}

function enrichPool(pool, delegations) {
  const delegationsAmountAtoms = delegations.reduce((acc, delegation) => acc + BigInt(delegation.balance.atoms), BigInt(0));
  const delegationsAmount = delegations.reduce((acc, delegation) => acc + parseFloat(delegation.balance.decimal), 0);
  const poolBalanceAtoms = BigInt(pool.staker_balance.atoms) + delegationsAmountAtoms;

  return {
    ...pool,
    pool: pool.pool_id,
    pool_id: pool.pool_id,
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

async function storeSinglePool(pool) {
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
}

async function storePoolStats(poolId, stats) {
  const entries = Object.entries(stats);
  if (!entries.length) {
    return;
  }

  for (const [date, payload] of entries) {
    await pg.query(
      `
        INSERT INTO explorer_pool_daily_stats (pool_id, stat_date, payload, updated_at)
        VALUES ($1, $2::date, $3::jsonb, NOW())
        ON CONFLICT (pool_id, stat_date)
        DO UPDATE SET
          payload = EXCLUDED.payload,
          updated_at = NOW()
      `,
      [poolId, date, JSON.stringify(payload)],
    );
  }

  await pg.query(
    `
      DELETE FROM explorer_pool_daily_stats
      WHERE pool_id = $1
        AND stat_date NOT IN (
          SELECT stat_date
          FROM explorer_pool_daily_stats
          WHERE pool_id = $1
          ORDER BY stat_date DESC
          LIMIT 30
        )
    `,
    [poolId],
  );
}

async function pruneStalePools(syncedPoolIds) {
  logStep(`Pruning stale pools not present in the latest snapshot (${syncedPoolIds.length} active pool ids)`);
  await pg.query(
    `
      DELETE FROM explorer_pool_delegations
      WHERE pool_id NOT IN (
        SELECT UNNEST($1::text[])
      )
    `,
    [syncedPoolIds],
  );

  await pg.query(
    `
      DELETE FROM explorer_pool_daily_stats
      WHERE pool_id NOT IN (
        SELECT UNNEST($1::text[])
      )
    `,
    [syncedPoolIds],
  );

  await pg.query(
    `
      DELETE FROM explorer_pools
      WHERE pool_id NOT IN (
        SELECT UNNEST($1::text[])
      )
    `,
    [syncedPoolIds],
  );
}

async function syncPoolsData() {
  logStep("Fetching and syncing pools...");
  const seenPools = new Set();
  const syncedPoolIds = [];
  let offset = 0;
  let paginationComplete = false;

  while (true) {
    logStep(`Requesting pool page at offset ${offset}`);
    let page;

    try {
      page = await fetchJson(`${NODE_API_URL}/pool?offset=${offset}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logWarning(`Pool pagination stopped at offset ${offset} after retries: ${message}`);
      break;
    }

    if (!page.length) {
      logStep(`Pool pagination completed at offset ${offset}`);
      paginationComplete = true;
      break;
    }

    for (const pool of page) {
      if (seenPools.has(pool.pool_id)) {
        continue;
      }

      seenPools.add(pool.pool_id);

      try {
        logStep(`Fetching delegations for pool ${syncedPoolIds.length + 1}: ${pool.pool_id}`);
        const delegations = await fetchPoolDelegations(pool.pool_id);
        const poolData = {
          poolId: pool.pool_id,
          poolDetails: enrichPool(pool, delegations),
          delegations,
        };
        await storeSinglePool(poolData);
        syncedPoolIds.push(pool.pool_id);
        logStep(`Persisted pool ${syncedPoolIds.length}: ${pool.pool_id}`);

        try {
          logStep(`Fetching 30-day stats for pool ${pool.pool_id}`);
          await storePoolStats(pool.pool_id, await fetchPoolStats(pool.pool_id));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logWarning(`Failed to sync stats for pool ${pool.pool_id}: ${message}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logWarning(`Failed to sync pool ${pool.pool_id}: ${message}`);
      }
    }

    offset += 10;
  }

  if (paginationComplete && syncedPoolIds.length > 0) {
    await pruneStalePools(syncedPoolIds);
  } else if (!paginationComplete) {
    logWarning(`Skipping stale pool prune because pagination did not complete (${syncedPoolIds.length} pools synced)`);
  }

  logStep(`Pool sync finished (${syncedPoolIds.length} pools persisted)`);
}

async function fetchTokens() {
  logStep("Fetching token catalog...");
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

  const ids = Array.from(new Set(batch.results.flat()));
  logStep(`Collected ${ids.length} token ids from batch API`);
  const result = [];

  for (let index = 0; index < ids.length; index += 1) {
    const tokenId = ids[index];
    if (index === 0 || (index + 1) % 25 === 0 || index === ids.length - 1) {
      logStep(`Fetching token details ${index + 1}/${ids.length}`);
    }
    const token = await fetchTokenById(tokenId);
    if (!token || token.error) {
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
  logStep("Fetching NFT index...");
  const tokenIds = [];
  let offset = 0;

  while (true) {
    logStep(`Requesting NFT source page at token offset ${offset}`);
    const page = await fetchJson(`${NODE_API_URL}/token?offset=${offset}`);
    tokenIds.push(...page);

    if (page.length < 10) {
      logStep(`NFT source pagination completed at offset ${offset}`);
      break;
    }

    offset += 10;
  }

  const ids = Array.from(new Set(tokenIds));
  logStep(`Collected ${ids.length} candidate NFT ids`);
  const result = [];

  for (let index = 0; index < ids.length; index += 1) {
    const tokenId = ids[index];
    if (index === 0 || (index + 1) % 25 === 0 || index === ids.length - 1) {
      logStep(`Fetching NFT details ${index + 1}/${ids.length}`);
    }
    const token = await fetchNftById(tokenId);
    if (!token || token.error) {
      continue;
    }

    try {
      const ticker = token.ticker?.string;
      if (!ticker) {
        throw new Error("Missing ticker.string");
      }

      result.push({
        id: tokenId,
        ticker,
        name: token.name?.string || null,
        description: token.description?.string || null,
        creator: token.creator || null,
        owner: token.owner || null,
        media_uri: token.media_uri?.string || null,
        icon_uri: token.icon_uri?.string || null,
        additional_metadata_uri: token.additional_metadata_uri?.string || null,
      });
    } catch (error) {
      logWarning(`Skipping malformed NFT ${tokenId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}

async function storeTransactions(transactions) {
  logStep(`Persisting ${transactions.length} recent transactions...`);
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
  logStep(`Persisting ${blocks.length} recent blocks...`);
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


async function storeTokens(tokens) {
  logStep(`Persisting ${tokens.length} tokens...`);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (index === 0 || (index + 1) % 25 === 0 || index === tokens.length - 1) {
      logStep(`Persisting token ${index + 1}/${tokens.length}`);
    }
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
  logStep(`Persisting ${nfts.length} NFTs...`);
  for (let index = 0; index < nfts.length; index += 1) {
    const nft = nfts[index];
    if (index === 0 || (index + 1) % 25 === 0 || index === nfts.length - 1) {
      logStep(`Persisting NFT ${index + 1}/${nfts.length}`);
    }
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

async function syncRecentChainData() {
  logStep("Preparing PostgreSQL schema...");
  await ensureSchema();

  logStep("Syncing latest transactions...");
  await storeTransactions(await fetchRecentTransactions());

  logStep("Syncing latest blocks...");
  await storeBlocks(await fetchRecentBlocks());
}

async function syncCatalogData() {
  logStep("Preparing PostgreSQL schema...");
  await ensureSchema();

  const errors = [];

  try {
    await syncPoolsData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`pools: ${message}`);
    logWarning(`Pool sync failed: ${message}`);
  }

  try {
    logStep("Syncing tokens...");
    await storeTokens(await fetchTokens());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`tokens: ${message}`);
    logWarning(`Token sync failed: ${message}`);
  }

  try {
    logStep("Syncing NFT index...");
    await storeNfts(await fetchNfts());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`nfts: ${message}`);
    logWarning(`NFT sync failed: ${message}`);
  }

  if (errors.length > 0) {
    throw new Error(`Catalog sync completed with errors: ${errors.join("; ")}`);
  }

  logStep("Catalog sync finished");
}

module.exports = {
  closePg,
  syncRecentChainData,
  syncCatalogData,
};
