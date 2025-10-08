import Mailchimp from 'mailchimp-api-v3';
import { Member, MailChimpSync, MAILCHIMP_AUDIENCE_NAME, MAILCHIMP_TAG } from '@/types';

export class MailChimpService {
  private mailchimp: Mailchimp;
  private audienceId: string;

  constructor() {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    this.audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';

    if (!apiKey || !serverPrefix) {
      throw new Error('MailChimp API key and server prefix are required');
    }

    this.mailchimp = new Mailchimp(apiKey);
  }

  // Add member to MailChimp audience
  async addMemberToAudience(member: Member): Promise<MailChimpSync> {
    try {
      // Check if member already exists in audience
      const existingMember = await this.findMemberByEmail(member.email);
      
      if (existingMember) {
        // Update existing member with new tags
        const updatedMember = await this.updateMemberTags(existingMember.id, [MAILCHIMP_TAG]);
        return {
          member_id: member.id!,
          mailchimp_id: existingMember.id,
          audience_id: this.audienceId,
          tags: [MAILCHIMP_TAG],
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
        tags: [MAILCHIMP_TAG]
      };

      const response = await this.mailchimp.post(`/lists/${this.audienceId}/members`, memberData);

      return {
        member_id: member.id!,
        mailchimp_id: response.id,
        audience_id: this.audienceId,
        tags: [MAILCHIMP_TAG],
        synced_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding member to MailChimp:', error);
      throw new Error(`Failed to add member to MailChimp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Find member by email in audience
  private async findMemberByEmail(email: string): Promise<any> {
    try {
      const response = await this.mailchimp.get(`/lists/${this.audienceId}/members/${this.getSubscriberHash(email)}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Member not found
      }
      throw error;
    }
  }

  // Update member tags
  private async updateMemberTags(memberId: string, tags: string[]): Promise<any> {
    try {
      const response = await this.mailchimp.post(`/lists/${this.audienceId}/members/${memberId}/tags`, {
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
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  // Test MailChimp connection
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.mailchimp.get(`/lists/${this.audienceId}`);
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
    try {
      const response = await this.mailchimp.get(`/lists/${this.audienceId}`);
      return {
        name: response.name,
        member_count: response.stats.member_count,
        id: response.id
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
  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_AUDIENCE_ID) {
    console.warn('MailChimp not configured - API key, server prefix, or audience ID missing');
    return null;
  }

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
