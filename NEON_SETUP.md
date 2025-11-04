# 🚀 Neon Database Setup Guide

This guide will help you migrate from Supabase to Neon PostgreSQL database, which **doesn't suspend inactive databases** like Supabase's free tier does.

## Why Neon?

✅ **No auto-suspend** - Your database stays active 24/7  
✅ **PostgreSQL compatible** - Works with existing Supabase schema  
✅ **Free tier** - 0.5GB storage, 3 projects (enough for most apps)  
✅ **Serverless** - Automatically scales to zero when idle, wakes instantly  
✅ **Perfect for Next.js** - Optimized for serverless environments  

## Step 1: Create Neon Account

1. Go to **https://neon.tech/**
2. Click **"Sign Up"** (free account with GitHub, Google, or email)
3. Complete the signup process

## Step 2: Create a New Project

1. After logging in, click **"Create Project"**
2. Fill in the details:
   - **Project Name**: `socios-club` (or your preferred name)
   - **Region**: Choose closest to your users (EU or US)
   - **PostgreSQL Version**: Latest (15 or 16)
3. Click **"Create Project"**

## Step 3: Get Your Connection String

1. After project creation, you'll see the **Connection Details** panel
2. Copy the **Connection String** (it looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
3. **Important**: This contains your password, keep it secure!

## Step 4: Create Database Tables

1. In your Neon dashboard, click on **"SQL Editor"** (left sidebar)
2. Open the `neon-schema.sql` file from this project
3. Copy the entire SQL content
4. Paste it into the Neon SQL Editor
5. Click **"Run"** to execute the script
6. You should see "Success" - tables created!

## Step 5: Configure Environment Variables

### For Local Development (.env.local)

Create or update `.env.local` in your project root:

```env
# Neon Database (RECOMMENDED - No auto-suspend!)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Legacy Supabase (optional - can be removed after migration)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Local Database (fallback - set to 'true' to use SQLite locally)
# NEXT_PUBLIC_USE_LOCAL_DB=false
```

**Replace** the `DATABASE_URL` with your actual Neon connection string from Step 3.

### For Production (Vercel/Netlify)

1. Go to your hosting platform dashboard
2. Navigate to **Environment Variables** section
3. Add/Update:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string (same as above)
4. Save and redeploy your application

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/admin/status`
   - You should see: "Connected: true" with table counts

3. If you see connection errors:
   - Double-check your `DATABASE_URL` in `.env.local`
   - Verify tables were created in Neon SQL Editor
   - Check Neon dashboard for any errors

## Database Priority

The application will use databases in this priority order:

1. **Neon** (if `DATABASE_URL` is set) ⭐ Recommended
2. **Supabase** (if `NEXT_PUBLIC_SUPABASE_URL` is set) - Legacy support
3. **Local SQLite** (fallback or if `NEXT_PUBLIC_USE_LOCAL_DB=true`)

## Migrating Data from Supabase

If you have existing data in Supabase:

1. **Export from Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Export each table (members_2025, members_2026) as CSV

2. **Import to Neon:**
   - Use Neon's SQL Editor or a database client (pgAdmin, DBeaver)
   - Import the CSV files or use SQL INSERT statements

3. **Alternative:** Use your app's import functionality:
   - Export data as Excel from Supabase
   - Use the `/admin/import` page to import to Neon

## Free Tier Limits

Neon's free tier includes:
- ✅ **0.5GB** storage (plenty for thousands of members)
- ✅ **3 projects** (you can create multiple projects)
- ✅ **Unlimited** compute hours
- ✅ **No auto-suspend** (database stays active)

## Troubleshooting

### Connection Error: "password authentication failed"
- Double-check your connection string
- Ensure you copied the full string including password
- Try regenerating the connection string in Neon dashboard

### "relation does not exist" error
- Run the `neon-schema.sql` script in Neon SQL Editor
- Verify tables exist: Check Neon dashboard → Tables

### Database appears slow
- This is normal for free tier (wakes from sleep)
- First request after idle period may take 1-2 seconds
- Subsequent requests are fast

### Still having issues?
- Check Neon dashboard for connection logs
- Verify environment variables are set correctly
- Test connection string in a PostgreSQL client

## Next Steps

✅ Your database is now running on Neon!  
✅ No more suspension issues  
✅ All existing features continue to work  
✅ You can remove Supabase credentials if no longer needed  

---

**Need Help?** Check Neon documentation: https://neon.tech/docs



