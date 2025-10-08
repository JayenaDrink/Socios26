export interface Member {
  id?: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  amount_paid: number;
  year: number;
  is_active: boolean;
  source: 'form' | '2025_list';
  created_at?: string;
  updated_at?: string;
}

export interface MailChimpSync {
  id?: number;
  member_id: number;
  mailchimp_id?: string;
  audience_id?: string;
  tags?: string[];
  synced_at?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  member_number: string;
  phone: string;
  email: string;
  amount_paid: number;
}

export interface SearchCriteria {
  member_number?: string;
  email?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const DEFAULT_AMOUNTS = [35, 20] as const;
export const MAILCHIMP_AUDIENCE_NAME = 'Belgas 2026';
export const MAILCHIMP_TAG = 'Activos 25-26';
