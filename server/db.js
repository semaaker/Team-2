// SponsorMatch - veritabani katmani (SQLite / better-sqlite3)
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'sponsormatch.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('organizer', 'sponsor')),
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organizer_profiles (
  user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_name    TEXT NOT NULL DEFAULT '',
  org_type    TEXT NOT NULL DEFAULT 'other', -- university_club | festival | academic | ngo | other
  city        TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  website     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL DEFAULT '',
  sectors         TEXT NOT NULL DEFAULT '[]',  -- JSON dizisi: ["teknoloji","gida",...]
  budget_min      INTEGER NOT NULL DEFAULT 0,
  budget_max      INTEGER NOT NULL DEFAULT 0,
  city            TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL DEFAULT '',    -- serbest metin: "universite ogrencileri, 18-25"
  description     TEXT NOT NULL DEFAULT '',
  website         TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS events (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL DEFAULT 'other', -- teknoloji | muzik | spor | egitim | girisimcilik | sanat | other
  city                TEXT NOT NULL DEFAULT '',
  event_date          TEXT NOT NULL DEFAULT '',
  expected_attendance INTEGER NOT NULL DEFAULT 0,
  audience            TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','completed','cancelled')),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  price    INTEGER NOT NULL DEFAULT 0,
  perks    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS offers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  package_id   INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  sponsor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('sponsor','organizer')),
  message      TEXT NOT NULL DEFAULT '',
  amount       INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id     INTEGER REFERENCES events(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (organizer_id, sponsor_id, event_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  read_at         TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_offers_event     ON offers(event_id);
CREATE INDEX IF NOT EXISTS idx_offers_sponsor   ON offers(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv    ON messages(conversation_id);
`);

module.exports = db;
