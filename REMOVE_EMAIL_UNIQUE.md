# Remove Email Unique Constraint

This guide shows you how to allow duplicate emails in your database.

## Why?

By default, the database schema has a UNIQUE constraint on the `email` column. If you want to allow multiple members with the same email address, you need to remove this constraint.

## For Neon Database

1. **Go to your Neon dashboard**
2. **Open SQL Editor**
3. **Run this SQL script:**

```sql
-- Remove UNIQUE constraint from members_2025.email
ALTER TABLE members_2025 
DROP CONSTRAINT IF EXISTS members_2025_email_key;

-- Remove UNIQUE constraint from members_2026.email
ALTER TABLE members_2026 
DROP CONSTRAINT IF EXISTS members_2026_email_key;
```

Or copy and run the entire `remove-email-unique-constraint.sql` file.

## For Supabase Database

1. **Go to your Supabase dashboard**
2. **Open SQL Editor**
3. **Run this SQL script:**

```sql
-- Remove UNIQUE constraint from members_2025.email
ALTER TABLE members_2025 
DROP CONSTRAINT IF EXISTS members_2025_email_key;

-- Remove UNIQUE constraint from members_2026.email
ALTER TABLE members_2026 
DROP CONSTRAINT IF EXISTS members_2026_email_key;
```

## Important Notes

✅ **Email index remains** - Search by email will still be fast  
✅ **Member number stays unique** - Member numbers are still unique (as they should be)  
✅ **No data loss** - This only removes the constraint, doesn't delete any data  
⚠️ **Cannot be undone easily** - Once removed, you'd need to recreate the constraint if you want it back  

## After Running

After removing the unique constraint, you'll be able to:
- Import members with duplicate emails
- Have multiple members with the same email address
- The system will only check for duplicate member numbers (not emails)



