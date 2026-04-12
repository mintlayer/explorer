import "server-only";

import { isPostgresConfigured, postgres } from "@/lib/postgres";

const RECENT_TRANSACTIONS_LIMIT = Number(process.env.EXPLORER_RECENT_TRANSACTIONS_LIMIT || 100);
const RECENT_BLOCKS_LIMIT = Number(process.env.EXPLORER_RECENT_BLOCKS_LIMIT || 100);

let schemaPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!isPostgresConfigured || !postgres) {
    return;
  }

  if (!schemaPromise) {
    schemaPromise = postgres
      .query(`
        CREATE TABLE IF NOT EXISTS explorer_recent_transactions (
          transaction_id TEXT PRIMARY KEY,
          block_height BIGINT,
          timestamp BIGINT,
          payload JSONB NOT NULL,
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_explorer_recent_transactions_order
        ON explorer_recent_transactions (block_height DESC, timestamp DESC, fetched_at DESC);

        CREATE TABLE IF NOT EXISTS explorer_recent_blocks (
          block_height BIGINT PRIMARY KEY,
          block_id TEXT UNIQUE NOT NULL,
          block_timestamp BIGINT,
          payload JSONB NOT NULL,
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_explorer_recent_blocks_order
        ON explorer_recent_blocks (block_height DESC, block_timestamp DESC, fetched_at DESC);

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
      `)
      .then(() => undefined);
  }

  await schemaPromise;
}

async function runWithDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isPostgresConfigured || !postgres) {
    return fallback;
  }

  await ensureSchema();
  return fn();
}

export async function getRecentTransactionsFromDb(offset = 0, limit = 10) {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_recent_transactions
        ORDER BY block_height DESC NULLS LAST, timestamp DESC NULLS LAST, fetched_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function saveRecentTransactionsToDb(transactions: any[]) {
  return runWithDb(async () => {
    if (!transactions.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const transaction of transactions) {
        await client.query(
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
          [transaction.transaction, transaction.block ?? null, transaction.timestamp ?? null, JSON.stringify(transaction)],
        );
      }

      await client.query(
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

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getRecentBlocksFromDb(before?: number | null, limit = 10) {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_recent_blocks
        WHERE ($1::BIGINT IS NULL OR block_height <= $1)
        ORDER BY block_height DESC, block_timestamp DESC NULLS LAST, fetched_at DESC
        LIMIT $2
      `,
      [before ?? null, limit],
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function saveRecentBlocksToDb(blocks: any[]) {
  return runWithDb(async () => {
    if (!blocks.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const block of blocks) {
        await client.query(
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
          [block.block, block.id ?? `height:${block.block}`, block.datetime ?? null, JSON.stringify(block)],
        );
      }

      await client.query(
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

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getLatestBlockHeightFromDb() {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT block_height
        FROM explorer_recent_blocks
        ORDER BY block_height DESC
        LIMIT 1
      `,
    );

    return rows.length ? Number(rows[0].block_height) : null;
  }, null as number | null);
}

export async function getPoolsFromDb() {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_pools
        ORDER BY updated_at DESC, pool_id ASC
      `,
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function getPoolFromDb(poolId: string) {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_pools
        WHERE pool_id = $1
        LIMIT 1
      `,
      [poolId],
    );

    return rows[0]?.payload ?? null;
  }, null as any);
}

export async function savePoolsToDb(pools: any[]) {
  return runWithDb(async () => {
    if (!pools.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const pool of pools) {
        const poolId = pool.pool_id || pool.pool;
        await client.query(
          `
            INSERT INTO explorer_pools (pool_id, payload, updated_at)
            VALUES ($1, $2::jsonb, NOW())
            ON CONFLICT (pool_id)
            DO UPDATE SET
              payload = EXCLUDED.payload,
              updated_at = NOW()
          `,
          [poolId, JSON.stringify(pool)],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getPoolDelegationsFromDb(poolId: string) {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_pool_delegations
        WHERE pool_id = $1
        ORDER BY updated_at DESC, delegation_id ASC
      `,
      [poolId],
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function savePoolDelegationsToDb(poolId: string, delegations: any[]) {
  return runWithDb(async () => {
    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM explorer_pool_delegations WHERE pool_id = $1", [poolId]);

      for (const delegation of delegations) {
        await client.query(
          `
            INSERT INTO explorer_pool_delegations (pool_id, delegation_id, payload, updated_at)
            VALUES ($1, $2, $3::jsonb, NOW())
          `,
          [poolId, delegation.delegation_id || `${poolId}:${delegation.spend_destination}`, JSON.stringify(delegation)],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getPoolStatsFromDb(poolId: string) {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT stat_date, payload
        FROM explorer_pool_daily_stats
        WHERE pool_id = $1
        ORDER BY stat_date DESC
      `,
      [poolId],
    );

    return rows.reduce((acc: Record<string, any>, row: any) => {
      const date = row.stat_date instanceof Date ? row.stat_date.toISOString().split("T")[0] : row.stat_date;
      acc[date] = row.payload;
      return acc;
    }, {});
  }, {} as Record<string, any>);
}

export async function savePoolStatsToDb(poolId: string, stats: Record<string, any>) {
  return runWithDb(async () => {
    const entries = Object.entries(stats);
    if (!entries.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const [date, payload] of entries) {
        await client.query(
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

      await client.query(
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

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getTokensFromDb() {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_tokens
        ORDER BY updated_at DESC, token_id ASC
      `,
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function saveTokensToDb(tokens: any[]) {
  return runWithDb(async () => {
    if (!tokens.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const token of tokens) {
        await client.query(
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

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}

export async function getNftsFromDb() {
  return runWithDb(async () => {
    const { rows } = await postgres!.query(
      `
        SELECT payload
        FROM explorer_nfts
        ORDER BY updated_at DESC, nft_id ASC
      `,
    );

    return rows.map((row: any) => row.payload);
  }, [] as any[]);
}

export async function saveNftsToDb(nfts: any[]) {
  return runWithDb(async () => {
    if (!nfts.length) {
      return;
    }

    const client = await postgres!.connect();

    try {
      await client.query("BEGIN");

      for (const nft of nfts) {
        await client.query(
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

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }, undefined);
}
