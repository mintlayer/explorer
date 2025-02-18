import Database from "better-sqlite3";

const db = new Database("data.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS pools (
    id INTEGER PRIMARY KEY,
    status TEXT CHECK(status IN ('pending', 'processing', 'done')),
    result TEXT,
    updated_at INTEGER
  );
`);
export default db;
