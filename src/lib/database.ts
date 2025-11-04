import Database from 'better-sqlite3';
import { Member } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

// SQLite database path - only use if DATABASE_URL is not a PostgreSQL connection string
// DATABASE_URL for Neon is like: postgresql://...
// SQLite path should be a file path: ./database.sqlite or /path/to/file.sqlite
const getSqlitePath = (): string => {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // If DATABASE_URL is a PostgreSQL connection string, use default SQLite path
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return process.env.SQLITE_DB_PATH || './database.sqlite';
  }
  
  // If DATABASE_URL is set and looks like a file path, use it
  if (dbUrl && (dbUrl.startsWith('./') || dbUrl.startsWith('/') || dbUrl.startsWith('file:'))) {
    return dbUrl;
  }
  
  // Default fallback
  return process.env.SQLITE_DB_PATH || './database.sqlite';
};

const dbPath = getSqlitePath();

// Ensure the directory exists for SQLite database
try {
  const dbDir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (error) {
  // If it's a relative path in current directory, that's fine
  console.warn('Could not ensure database directory exists:', error);
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create members_2025 table (for compatibility with existing API)
db.exec(`
  CREATE TABLE IF NOT EXISTS members_2025 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    amount_paid DECIMAL(10,2) DEFAULT 35.00,
    year INTEGER DEFAULT 2025,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(20) DEFAULT '2025_list',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create members_2026 table (for compatibility with existing API)
db.exec(`
  CREATE TABLE IF NOT EXISTS members_2026 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    amount_paid DECIMAL(10,2) DEFAULT 35.00,
    year INTEGER DEFAULT 2026,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(20) DEFAULT 'form',
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
    FOREIGN KEY (member_id) REFERENCES members_2026 (id) ON DELETE CASCADE
  )
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_members_2025_member_number ON members_2025(member_number);
  CREATE INDEX IF NOT EXISTS idx_members_2025_email ON members_2025(email);
  CREATE INDEX IF NOT EXISTS idx_members_2026_member_number ON members_2026(member_number);
  CREATE INDEX IF NOT EXISTS idx_members_2026_email ON members_2026(email);
  CREATE INDEX IF NOT EXISTS idx_mailchimp_sync_member_id ON mailchimp_sync(member_id);
`);

// Local SQLite Database Service
export class LocalDatabaseService {
  // Get all members from 2025 table
  async getMembers2025(): Promise<Member[]> {
    try {
      const stmt = db.prepare('SELECT * FROM members_2025 ORDER BY member_number');
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching 2025 members:', error);
      throw new Error('Failed to fetch 2025 members');
    }
  }

  // Get all members from 2026 table
  async getMembers2026(): Promise<Member[]> {
    try {
      const stmt = db.prepare('SELECT * FROM members_2026 ORDER BY member_number');
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching 2026 members:', error);
      throw new Error('Failed to fetch 2026 members');
    }
  }

  // Search members in 2025 table
  async searchMembers2025(criteria: { member_number?: string; email?: string }): Promise<Member[]> {
    try {
      let query = 'SELECT * FROM members_2025 WHERE ';
      const params: any[] = [];
      
      if (criteria.member_number && criteria.email) {
        query += 'member_number = ? AND email LIKE ?';
        params.push(criteria.member_number, `%${criteria.email}%`);
      } else if (criteria.member_number) {
        query += 'member_number = ?';
        params.push(criteria.member_number);
      } else if (criteria.email) {
        query += 'email LIKE ?';
        params.push(`%${criteria.email}%`);
      } else {
        return [];
      }

      const stmt = db.prepare(query);
      const rows = stmt.all(...params) as any[];
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString()
      }));
    } catch (error) {
      console.error('Error searching 2025 members:', error);
      throw new Error('Failed to search 2025 members');
    }
  }

  // Transfer member from 2025 to 2026
  async transferMemberTo2026(member: Member): Promise<Member> {
    try {
      // Check if member already exists in 2026
      const checkStmt = db.prepare('SELECT id FROM members_2026 WHERE member_number = ?');
      const existing = checkStmt.get(member.member_number);
      
      if (existing) {
        throw new Error('Member already exists in 2026 list');
      }

      // Insert into 2026 table
      const insertStmt = db.prepare(`
        INSERT INTO members_2026 (member_number, first_name, last_name, email, phone, amount_paid, year, is_active, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        member.member_number,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        member.amount_paid || 35,
        2026,
        true,
        '2025_list'
      );

      // Get the inserted member
      const getStmt = db.prepare('SELECT * FROM members_2026 WHERE id = ?');
      const inserted = getStmt.get(result.lastInsertRowid) as any;

      return {
        ...inserted,
        created_at: new Date(inserted.created_at).toISOString(),
        updated_at: new Date(inserted.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error transferring member to 2026:', error);
      throw new Error('Failed to transfer member to 2026');
    }
  }

  // Add new member to 2025 table
  async addMemberTo2025(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    try {
      const stmt = db.prepare(`
        INSERT INTO members_2025 (member_number, first_name, last_name, email, phone, amount_paid, year, is_active, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        member.member_number,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        member.amount_paid || 35,
        member.year || 2025,
        member.is_active !== false,
        member.source || '2025_list'
      );

      const getStmt = db.prepare('SELECT * FROM members_2025 WHERE id = ?');
      const inserted = getStmt.get(result.lastInsertRowid) as any;

      return {
        ...inserted,
        created_at: new Date(inserted.created_at).toISOString(),
        updated_at: new Date(inserted.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error adding member to 2025:', error);
      throw new Error('Failed to add member to 2025');
    }
  }

  // Add new member to 2026 table
  async addMemberTo2026(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    try {
      const stmt = db.prepare(`
        INSERT INTO members_2026 (member_number, first_name, last_name, email, phone, amount_paid, year, is_active, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        member.member_number,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        member.amount_paid || 35,
        member.year || 2026,
        member.is_active !== false,
        member.source || 'form'
      );

      const getStmt = db.prepare('SELECT * FROM members_2026 WHERE id = ?');
      const inserted = getStmt.get(result.lastInsertRowid) as any;

      return {
        ...inserted,
        created_at: new Date(inserted.created_at).toISOString(),
        updated_at: new Date(inserted.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error adding member to 2026:', error);
      throw new Error('Failed to add member to 2026');
    }
  }

  // Import members from Excel data to 2025 table
  async importMembersTo2025(members: Member[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    const insertStmt = db.prepare(`
      INSERT INTO members_2025 (member_number, first_name, last_name, email, phone, amount_paid, year, is_active, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const checkStmt = db.prepare('SELECT id FROM members_2025 WHERE member_number = ?');

    for (const member of members) {
      try {
        // Check if member already exists
        const existing = checkStmt.get(member.member_number);
        
        if (existing) {
          errors.push(`Member ${member.member_number} already exists`);
          continue;
        }

        // Insert member
        insertStmt.run(
          member.member_number,
          member.first_name,
          member.last_name,
          member.email,
          member.phone,
          member.amount_paid || 35,
          2025,
          true,
          '2025_list'
        );

        successCount++;
      } catch (error) {
        errors.push(`Error importing ${member.member_number}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: successCount, errors };
  }

  // Get database status
  async getStatus(): Promise<{ connected: boolean; tables: { members_2025: number; members_2026: number }; error?: string }> {
    try {
      const count2025Stmt = db.prepare('SELECT COUNT(*) as count FROM members_2025');
      const count2026Stmt = db.prepare('SELECT COUNT(*) as count FROM members_2026');
      
      const count2025 = count2025Stmt.get() as { count: number };
      const count2026 = count2026Stmt.get() as { count: number };

      return {
        connected: true,
        tables: {
          members_2025: count2025.count,
          members_2026: count2026.count
        }
      };
    } catch (error) {
      return {
        connected: false,
        tables: { members_2025: 0, members_2026: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default db;
