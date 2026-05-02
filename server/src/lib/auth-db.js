import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = resolve(currentDir, "..", "..", "data", "auth.sqlite");
const databasePath = resolve(process.env.AUTH_DB_PATH || defaultDatabasePath);

mkdirSync(dirname(databasePath), { recursive: true });

const db = new sqlite3.Database(databasePath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      picture TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_sign_in TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function run(query, params = []) {
  return new Promise((resolveRun, reject) => {
    db.run(query, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolveRun({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(query, params = []) {
  return new Promise((resolveGet, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolveGet(row);
    });
  });
}

export async function upsertGoogleUser({ sub, email, name, picture }) {
  await run(
    `
      INSERT INTO users (google_sub, email, name, picture)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        picture = excluded.picture,
        last_sign_in = CURRENT_TIMESTAMP
    `,
    [sub, email, name, picture || null]
  );

  return get(
    `
      SELECT id, google_sub AS googleSub, email, name, picture, created_at AS createdAt, last_sign_in AS lastSignIn
      FROM users
      WHERE google_sub = ?
    `,
    [sub]
  );
}
