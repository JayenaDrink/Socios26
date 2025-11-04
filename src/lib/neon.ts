import { neon } from '@neondatabase/serverless';
import { Member } from '@/types';
import { getMailChimpService } from './mailchimp';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL || '');

export class NeonDatabaseService {
  // Get all members from 2025 table
  async getMembers2025(): Promise<Member[]> {
    try {
      const rows = await sql`
        SELECT * FROM members_2025 
        ORDER BY member_number
      `;
      
      return rows.map((row: any) => ({
        id: row.id,
        member_number: row.member_number,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        amount_paid: parseFloat(row.amount_paid) || 0,
        year: row.year || 2025,
        is_active: row.is_active ?? true,
        source: row.source as 'form' | '2025_list',
        created_at: row.created_at?.toISOString() || new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching 2025 members:', error);
      throw new Error('Failed to fetch 2025 members');
    }
  }

  // Get all members from 2026 table
  async getMembers2026(): Promise<Member[]> {
    try {
      const rows = await sql`
        SELECT * FROM members_2026 
        ORDER BY member_number
      `;
      
      return rows.map((row: any) => ({
        id: row.id,
        member_number: row.member_number,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        amount_paid: parseFloat(row.amount_paid) || 0,
        year: row.year || 2026,
        is_active: row.is_active ?? true,
        source: row.source as 'form' | '2025_list',
        created_at: row.created_at?.toISOString() || new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching 2026 members:', error);
      throw new Error('Failed to fetch 2026 members');
    }
  }

  // Search members in 2025 table
  async searchMembers2025(criteria: { member_number?: string; email?: string }): Promise<Member[]> {
    try {
      let rows: any[] = [];
      
      if (criteria.member_number && criteria.email) {
        rows = await sql`
          SELECT * FROM members_2025 
          WHERE member_number = ${criteria.member_number} 
          AND email ILIKE ${`%${criteria.email}%`}
        `;
      } else if (criteria.member_number) {
        rows = await sql`
          SELECT * FROM members_2025 
          WHERE member_number = ${criteria.member_number}
        `;
      } else if (criteria.email) {
        rows = await sql`
          SELECT * FROM members_2025 
          WHERE email ILIKE ${`%${criteria.email}%`}
        `;
      } else {
        return [];
      }

      // Ensure rows is an array
      if (!Array.isArray(rows)) {
        rows = rows ? [rows] : [];
      }
      
      return rows.map((row: any) => ({
        id: row.id,
        member_number: row.member_number,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        amount_paid: parseFloat(row.amount_paid) || 0,
        year: row.year || 2025,
        is_active: row.is_active ?? true,
        source: row.source as 'form' | '2025_list',
        created_at: row.created_at?.toISOString() || new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
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
      const existing = await sql`
        SELECT * FROM members_2026 
        WHERE member_number = ${member.member_number}
        LIMIT 1
      `;

      if (existing && existing.length > 0) {
        throw new Error('Member already exists in 2026 list');
      }

      // Insert into 2026 table
      const result = await sql`
        INSERT INTO members_2026 (
          member_number, first_name, last_name, email, phone, 
          amount_paid, year, is_active, source
        )
        VALUES (
          ${member.member_number},
          ${member.first_name},
          ${member.last_name},
          ${member.email},
          ${member.phone || ''},
          ${member.amount_paid || 35},
          ${2026},
          ${true},
          ${'2025_list'}
        )
        RETURNING *
      `;

      const insertedMember = result[0] as any;

      const memberData: Member = {
        id: insertedMember.id,
        member_number: insertedMember.member_number,
        first_name: insertedMember.first_name,
        last_name: insertedMember.last_name,
        email: insertedMember.email,
        phone: insertedMember.phone || '',
        amount_paid: parseFloat(insertedMember.amount_paid) || 0,
        year: insertedMember.year || 2026,
        is_active: insertedMember.is_active ?? true,
        source: insertedMember.source as 'form' | '2025_list',
        created_at: insertedMember.created_at?.toISOString() || new Date().toISOString(),
        updated_at: insertedMember.updated_at?.toISOString() || new Date().toISOString(),
      };

      // Add to MailChimp if configured
      try {
        const mailchimp = getMailChimpService();
        if (mailchimp) {
          const mailchimpSync = await mailchimp.addMemberToAudience(memberData);
          
          // Store MailChimp sync info in database
          await sql`
            INSERT INTO mailchimp_sync (member_id, mailchimp_id, audience_id, tags)
            VALUES (
              ${memberData.id},
              ${mailchimpSync.mailchimp_id || null},
              ${mailchimpSync.audience_id || null},
              ${JSON.stringify(mailchimpSync.tags || [])}
            )
          `;
          
          console.log(`Member ${memberData.member_number} added to MailChimp audience`);
        }
      } catch (mailchimpError) {
        console.error('MailChimp sync failed, but member was transferred:', mailchimpError);
        // Don't fail the transfer if MailChimp fails
      }

      return memberData;
    } catch (error) {
      console.error('Error transferring member to 2026:', error);
      throw error instanceof Error ? error : new Error('Failed to transfer member to 2026');
    }
  }

  // Add new member to 2025 table
  async addMemberTo2025(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    try {
      const result = await sql`
        INSERT INTO members_2025 (
          member_number, first_name, last_name, email, phone, 
          amount_paid, year, is_active, source
        )
        VALUES (
          ${member.member_number},
          ${member.first_name},
          ${member.last_name},
          ${member.email},
          ${member.phone || ''},
          ${member.amount_paid || 35},
          ${member.year || 2025},
          ${member.is_active !== false},
          ${member.source || '2025_list'}
        )
        RETURNING *
      `;

      const insertedMember = result[0] as any;

      const memberData: Member = {
        id: insertedMember.id,
        member_number: insertedMember.member_number,
        first_name: insertedMember.first_name,
        last_name: insertedMember.last_name,
        email: insertedMember.email,
        phone: insertedMember.phone || '',
        amount_paid: parseFloat(insertedMember.amount_paid) || 0,
        year: insertedMember.year || 2025,
        is_active: insertedMember.is_active ?? true,
        source: insertedMember.source as 'form' | '2025_list',
        created_at: insertedMember.created_at?.toISOString() || new Date().toISOString(),
        updated_at: insertedMember.updated_at?.toISOString() || new Date().toISOString(),
      };

      // Add to MailChimp if configured
      try {
        const mailchimp = getMailChimpService();
        if (mailchimp) {
          const mailchimpSync = await mailchimp.addMemberToAudience(memberData);
          
          // Store MailChimp sync info in database
          await sql`
            INSERT INTO mailchimp_sync (member_id, mailchimp_id, audience_id, tags)
            VALUES (
              ${memberData.id},
              ${mailchimpSync.mailchimp_id || null},
              ${mailchimpSync.audience_id || null},
              ${JSON.stringify(mailchimpSync.tags || [])}
            )
          `;
          
          console.log(`Member ${memberData.member_number} added to MailChimp audience`);
        }
      } catch (mailchimpError) {
        console.error('MailChimp sync failed, but member was added:', mailchimpError);
        // Don't fail the add if MailChimp fails
      }

      return memberData;
    } catch (error) {
      console.error('Error adding member to 2025:', error);
      throw error instanceof Error ? error : new Error('Failed to add member to 2025');
    }
  }

  // Add new member to 2026 table
  async addMemberTo2026(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    try {
      const result = await sql`
        INSERT INTO members_2026 (
          member_number, first_name, last_name, email, phone, 
          amount_paid, year, is_active, source
        )
        VALUES (
          ${member.member_number},
          ${member.first_name},
          ${member.last_name},
          ${member.email},
          ${member.phone || ''},
          ${member.amount_paid || 35},
          ${member.year || 2026},
          ${member.is_active !== false},
          ${member.source || 'form'}
        )
        RETURNING *
      `;

      const insertedMember = result[0] as any;

      const memberData: Member = {
        id: insertedMember.id,
        member_number: insertedMember.member_number,
        first_name: insertedMember.first_name,
        last_name: insertedMember.last_name,
        email: insertedMember.email,
        phone: insertedMember.phone || '',
        amount_paid: parseFloat(insertedMember.amount_paid) || 0,
        year: insertedMember.year || 2026,
        is_active: insertedMember.is_active ?? true,
        source: insertedMember.source as 'form' | '2025_list',
        created_at: insertedMember.created_at?.toISOString() || new Date().toISOString(),
        updated_at: insertedMember.updated_at?.toISOString() || new Date().toISOString(),
      };

      // Add to MailChimp if configured
      try {
        const mailchimp = getMailChimpService();
        if (mailchimp) {
          const mailchimpSync = await mailchimp.addMemberToAudience(memberData);
          
          // Store MailChimp sync info in database
          await sql`
            INSERT INTO mailchimp_sync (member_id, mailchimp_id, audience_id, tags)
            VALUES (
              ${memberData.id},
              ${mailchimpSync.mailchimp_id || null},
              ${mailchimpSync.audience_id || null},
              ${JSON.stringify(mailchimpSync.tags || [])}
            )
          `;
          
          console.log(`Member ${memberData.member_number} added to MailChimp audience`);
        }
      } catch (mailchimpError) {
        console.error('MailChimp sync failed, but member was added:', mailchimpError);
        // Don't fail the add if MailChimp fails
      }

      return memberData;
    } catch (error) {
      console.error('Error adding member to 2026:', error);
      throw error instanceof Error ? error : new Error('Failed to add member to 2026');
    }
  }

  // Import members from Excel data to 2025 table
  async importMembersTo2025(members: Member[]): Promise<{ 
    success: number; 
    errors: Array<{ member_number: string; error: string; details?: any }>;
    successful: string[];
  }> {
    const errors: Array<{ member_number: string; error: string; details?: any }> = [];
    const successful: string[] = [];
    let successCount = 0;

    for (const member of members) {
      try {
        // Check if member already exists
        const existing = await sql`
          SELECT id FROM members_2025 
          WHERE member_number = ${member.member_number}
          LIMIT 1
        `;

        if (existing && existing.length > 0) {
          errors.push({
            member_number: member.member_number,
            error: 'Member already exists in database',
            details: { email: member.email, name: `${member.first_name} ${member.last_name}` }
          });
          continue;
        }

        // Insert member
        const result = await sql`
          INSERT INTO members_2025 (
            member_number, first_name, last_name, email, phone, 
            amount_paid, year, is_active, source
          )
          VALUES (
            ${member.member_number},
            ${member.first_name},
            ${member.last_name},
            ${member.email},
            ${member.phone || ''},
            ${member.amount_paid || 35},
            ${2025},
            ${true},
            ${'2025_list'}
          )
          RETURNING *
        `;

        const insertedMember = result[0] as any;

        // Note: MailChimp sync is skipped for members_2025
        // MailChimp sync will happen when members are transferred to members_2026
        // The mailchimp_sync table has a foreign key to members_2026, not members_2025

        successCount++;
        successful.push(member.member_number);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = error instanceof Error && 'code' in error ? { code: (error as any).code } : undefined;
        
        errors.push({
          member_number: member.member_number,
          error: errorMessage,
          details: {
            email: member.email,
            name: `${member.first_name} ${member.last_name}`,
            ...errorDetails
          }
        });
      }
    }

    return { success: successCount, errors, successful };
  }

  // Get database status
  async getStatus(): Promise<{ connected: boolean; tables: { members_2025: number; members_2026: number }; error?: string }> {
    try {
      const [count2025, count2026] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM members_2025`,
        sql`SELECT COUNT(*) as count FROM members_2026`
      ]);

      return {
        connected: true,
        tables: {
          members_2025: parseInt(count2025[0]?.count || '0'),
          members_2026: parseInt(count2026[0]?.count || '0')
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

