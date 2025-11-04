import Mailchimp from 'mailchimp-api-v3';
import { createHash } from 'crypto';
import { Member, MailChimpSync, MAILCHIMP_TAG, MAILCHIMP_TAG_2025, MAILCHIMP_AUDIENCE_ID_2025, MAILCHIMP_AUDIENCE_ID_2026 } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MailChimpService {
  private mailchimp: Mailchimp;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!apiKey || !serverPrefix) {
      this.isConfigured = false;
      console.log('MailChimp not configured - running in local mode without MailChimp integration');
      // Create a dummy mailchimp instance to prevent errors
      this.mailchimp = {} as Mailchimp;
      return;
    }

    this.isConfigured = true;
    this.mailchimp = new Mailchimp(apiKey);
  }

  // Get audience ID based on member year
  private getAudienceId(member: Member): string {
    return member.year === 2025 ? MAILCHIMP_AUDIENCE_ID_2025 : MAILCHIMP_AUDIENCE_ID_2026;
  }

  // Add member to MailChimp audience
  async addMemberToAudience(member: Member, tag?: string): Promise<MailChimpSync> {
    const memberTag = tag || (member.year === 2025 ? MAILCHIMP_TAG_2025 : MAILCHIMP_TAG);
    const audienceId = this.getAudienceId(member);
    if (!this.isConfigured) {
      console.log(`MailChimp not configured - simulating sync for member ${member.member_number}`);
      return {
        member_id: member.id!,
        mailchimp_id: `local-${member.id}`,
        audience_id: audienceId,
        tags: [memberTag],
        synced_at: new Date().toISOString()
      };
    }

    try {
      // Check if member already exists in audience
      const existingMember = await this.findMemberByEmail(member.email, audienceId);
      
      if (existingMember) {
        // Update existing member with new tags
        await this.updateMemberTags(existingMember.id, [memberTag], audienceId);
        return {
          member_id: member.id!,
          mailchimp_id: existingMember.id,
          audience_id: audienceId,
          tags: [memberTag],
          synced_at: new Date().toISOString()
        };
      }

      // Create new member
      const memberData = {
        email_address: member.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: member.first_name,
          LNAME: member.last_name,
          PHONE: member.phone || '',
          MEMBER_NUM: member.member_number,
          AMOUNT_PAID: member.amount_paid?.toString() || '35'
        },
        tags: [memberTag]
      };

      const response = await this.mailchimp.post(`/lists/${audienceId}/members`, memberData);

      return {
        member_id: member.id!,
        mailchimp_id: response.id,
        audience_id: audienceId,
        tags: [memberTag],
        synced_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding member to MailChimp:', error);
      throw new Error(`Failed to add member to MailChimp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Find member by email in audience
  private async findMemberByEmail(email: string, audienceId: string): Promise<any> {
    if (!this.isConfigured) {
      return null; // In local mode, always return null (member not found)
    }

    try {
      const response = await this.mailchimp.get(`/lists/${audienceId}/members/${this.getSubscriberHash(email)}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Member not found
      }
      throw error;
    }
  }

  // Update member tags
  private async updateMemberTags(memberId: string, tags: string[], audienceId: string): Promise<any> {
    if (!this.isConfigured) {
      console.log(`MailChimp not configured - simulating tag update for member ${memberId}`);
      return { success: true };
    }

    try {
      const response = await this.mailchimp.post(`/lists/${audienceId}/members/${memberId}/tags`, {
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      });
      return response;
    } catch (error) {
      console.error('Error updating member tags:', error);
      throw error;
    }
  }

  // Get subscriber hash for email (required by MailChimp API)
  private getSubscriberHash(email: string): string {
    return createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  // Test MailChimp connection
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { 
        connected: true,
        error: 'MailChimp not configured - running in local mode'
      };
    }

    try {
      // Test both audiences
      await this.mailchimp.get(`/lists/${MAILCHIMP_AUDIENCE_ID_2025}`);
      await this.mailchimp.get(`/lists/${MAILCHIMP_AUDIENCE_ID_2026}`);
      return { connected: true };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MailChimp'
      };
    }
  }

  // Get audience information
  async getAudienceInfo(): Promise<any> {
    if (!this.isConfigured) {
      return {
        audiences: [
          { name: 'Belgas 2024 (Local)', id: MAILCHIMP_AUDIENCE_ID_2025, member_count: 0 },
          { name: 'Belgas 2026 (Local)', id: MAILCHIMP_AUDIENCE_ID_2026, member_count: 0 }
        ],
        status: 'MailChimp not configured'
      };
    }

    try {
      const [audience2025, audience2026] = await Promise.all([
        this.mailchimp.get(`/lists/${MAILCHIMP_AUDIENCE_ID_2025}`),
        this.mailchimp.get(`/lists/${MAILCHIMP_AUDIENCE_ID_2026}`)
      ]);
      
      return {
        audiences: [
          {
            name: audience2025.name,
            member_count: audience2025.stats.member_count,
            id: audience2025.id
          },
          {
            name: audience2026.name,
            member_count: audience2026.stats.member_count,
            id: audience2026.id
          }
        ]
      };
    } catch (error) {
      console.error('Error getting audience info:', error);
      throw error;
    }
  }
}

// Singleton instance
let mailchimpService: MailChimpService | null = null;

export function getMailChimpService(): MailChimpService | null {
  if (!mailchimpService) {
    try {
      mailchimpService = new MailChimpService();
    } catch (error) {
      console.error('Failed to initialize MailChimp service:', error);
      return null;
    }
  }
  return mailchimpService;
}
