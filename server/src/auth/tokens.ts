import Database from 'better-sqlite3';
import path from 'path';
import { TeslaTokens } from './tesla-oauth.js';

const DB_PATH = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'tesla-view.db')
  : './data/tesla-view.db';

let db: Database.Database;

export function initDb(): void {
  db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      id_token TEXT NOT NULL,
      expires_in INTEGER NOT NULL,
      obtained_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vehicle_cache (
      vin TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function saveTokens(tokens: TeslaTokens): void {
  db.prepare('DELETE FROM tokens').run();
  db.prepare(`
    INSERT INTO tokens (access_token, refresh_token, id_token, expires_in, obtained_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    tokens.access_token,
    tokens.refresh_token,
    tokens.id_token,
    tokens.expires_in,
    tokens.obtained_at
  );
}

export function loadTokens(): TeslaTokens | null {
  const row = db.prepare('SELECT * FROM tokens LIMIT 1').get() as TeslaTokens | undefined;
  return row ?? null;
}

export function clearTokens(): void {
  db.prepare('DELETE FROM tokens').run();
}

export function cacheVehicleData(vin: string, data: object): void {
  db.prepare(`
    INSERT OR REPLACE INTO vehicle_cache (vin, data, updated_at)
    VALUES (?, ?, ?)
  `).run(vin, JSON.stringify(data), Date.now());
}

export function getCachedVehicleData(vin: string): object | null {
  const row = db.prepare('SELECT data FROM vehicle_cache WHERE vin = ?').get(vin) as
    | { data: string }
    | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function saveSetting(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}
