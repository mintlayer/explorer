import "server-only";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

declare global {
  // eslint-disable-next-line no-var
  var __mintlayerExplorerPgPool: Pool | undefined;
}

export const isPostgresConfigured = Boolean(connectionString);

export const postgres =
  !connectionString
    ? null
    : global.__mintlayerExplorerPgPool ||
      new Pool({
        connectionString,
        max: Number(process.env.POSTGRES_POOL_SIZE || 10),
      });

if (postgres && !global.__mintlayerExplorerPgPool) {
  global.__mintlayerExplorerPgPool = postgres;
}
