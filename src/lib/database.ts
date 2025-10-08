import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_URL || './database.sqlite';
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create members table
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    amount_paid DECIMAL(10,2) DEFAULT 35.00,
    year INTEGER DEFAULT 2026,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(20) DEFAULT 'form', -- 'form' or '2025_list'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create mailchimp_sync table
db.exec(`
  CREATE TABLE IF NOT EXISTS mailchimp_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    mailchimp_id VARCHAR(255),
    audience_id VARCHAR(255),
    tags TEXT, -- JSON array of tags
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
  )
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_members_member_number ON members(member_number);
  CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
  CREATE INDEX IF NOT EXISTS idx_members_year ON members(year);
  CREATE INDEX IF NOT EXISTS idx_mailchimp_sync_member_id ON mailchimp_sync(member_id);
`);

export default db;
