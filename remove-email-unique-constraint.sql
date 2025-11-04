-- =====================================================
-- Remove UNIQUE constraint from email columns
-- This allows duplicate emails in the database
-- =====================================================

-- Remove UNIQUE constraint from members_2025.email
ALTER TABLE members_2025 
DROP CONSTRAINT IF EXISTS members_2025_email_key;

-- Remove UNIQUE constraint from members_2026.email
ALTER TABLE members_2026 
DROP CONSTRAINT IF EXISTS members_2026_email_key;

-- Note: The indexes on email columns will remain for faster searches
-- They just won't enforce uniqueness anymore



