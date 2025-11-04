# 🚀 Neon Setup - Step by Step Guide

Follow these steps carefully to migrate from Supabase to Neon.

---

## Step 1: Create Neon Account (5 minutes)

1. **Open your web browser** and go to: **https://neon.tech/**
2. **Click the "Sign Up" button** (top right corner)
3. **Choose how to sign up:**
   - Option A: **Sign up with GitHub** (recommended - easiest)
   - Option B: **Sign up with Google**
   - Option C: **Sign up with Email** (enter email, verify it)
4. **Complete the signup process**
   - If using email: Check your inbox for verification email
   - Click the verification link
   - Create a password if needed

✅ **Done when:** You're logged into Neon dashboard

---

## Step 2: Create a New Project (2 minutes)

1. **Once logged in**, you'll see the Neon dashboard
2. **Click the big green "Create Project" button** (or "New Project")
3. **Fill in the project details:**
   ```
   Project Name: socios-club
   (or any name you like, e.g., "socios-database")
   
   Region: 
   - Choose "EU (Frankfurt)" if you're in Europe
   - Choose "US East (Ohio)" if you're in the US
   - Choose the closest region to your users
   
   PostgreSQL Version: 16 (or latest available)
   ```
4. **Click "Create Project"**
5. **Wait 10-30 seconds** - Neon is creating your database

✅ **Done when:** You see the project dashboard with connection details

---

## Step 3: Get Your Connection String (1 minute)

1. **On the project dashboard**, you'll see a section called **"Connection Details"** or **"Connection String"**
2. **Look for a string that starts with:**
   ```
   postgresql://username:password@xxxx.neon.tech/dbname?sslmode=require
   ```
3. **Click "Copy"** button next to the connection string
   - **IMPORTANT:** This contains your password! Keep it secret.
   - You won't be able to see the full password again (only the first few characters)
   - Save it somewhere safe (password manager, text file, etc.)

4. **Alternative way to get it:**
   - Click **"Connection Details"** button
   - Select **"Connection string"** tab
   - Copy the connection string

✅ **Done when:** You have copied the connection string

**Example connection string format:**
```
postgresql://socios_user:AbCd1234@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 4: Create Database Tables (3 minutes)

1. **In Neon dashboard**, look at the left sidebar
2. **Click "SQL Editor"** (or find it in the menu)
3. **You'll see an empty SQL editor window**

4. **Open the `neon-schema.sql` file** from your project:
   - In your code editor (VS Code, Cursor, etc.)
   - Open file: `neon-schema.sql` (in project root)
   - Select ALL the content (Cmd+A or Ctrl+A)
   - Copy it (Cmd+C or Ctrl+C)

5. **Paste into Neon SQL Editor:**
   - Go back to Neon dashboard
   - Click in the SQL editor window
   - Paste the SQL (Cmd+V or Ctrl+V)
   - You should see all the CREATE TABLE statements

6. **Run the SQL:**
   - Click the **"Run"** button (or press F5)
   - Wait a few seconds

7. **Verify success:**
   - You should see a success message
   - No error messages should appear
   - If you see errors, make sure you copied the ENTIRE file

✅ **Done when:** SQL executed successfully with no errors

**If you see errors:**
- Make sure you copied the entire `neon-schema.sql` file
- Check that there are no extra characters
- Try running it again

---

## Step 5: Verify Tables Were Created (1 minute)

1. **In Neon dashboard**, click **"Tables"** in the left sidebar
2. **You should see 3 tables:**
   - ✅ `members_2025`
   - ✅ `members_2026`
   - ✅ `mailchimp_sync`
3. **Click on each table** to see its structure (columns)

✅ **Done when:** All 3 tables are visible in the Tables section

---

## Step 6: Configure Local Environment (2 minutes)

### Option A: You already have `.env.local` file

1. **Open your project** in your code editor
2. **Open the file:** `.env.local` (in project root)
3. **Add or update this line:**
   ```env
   DATABASE_URL=postgresql://username:password@xxxx.neon.tech/dbname?sslmode=require
   ```
   **Replace** `postgresql://username:password@xxxx.neon.tech/dbname?sslmode=require` 
   **with** the actual connection string you copied in Step 3

4. **Save the file** (Cmd+S or Ctrl+S)

### Option B: You don't have `.env.local` file

1. **Create a new file** in project root called `.env.local`
2. **Add these lines:**
   ```env
   # Neon Database (No auto-suspend!)
   DATABASE_URL=postgresql://username:password@xxxx.neon.tech/dbname?sslmode=require
   
   # Optional: MailChimp (if you use it)
   # MAILCHIMP_API_KEY=your_api_key
   # MAILCHIMP_SERVER_PREFIX=your_server_prefix
   # MAILCHIMP_AUDIENCE_ID=your_audience_id
   ```
3. **Replace** the DATABASE_URL with your actual connection string from Step 3
4. **Save the file**

✅ **Done when:** `.env.local` file exists with your DATABASE_URL

**Your `.env.local` should look like this:**
```env
DATABASE_URL=postgresql://socios_user:AbCd1234@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 7: Install Dependencies (if needed) (1 minute)

1. **Open terminal** in your project folder
2. **Run this command:**
   ```bash
   npm install
   ```
3. **Wait for it to finish** (it should be fast, dependency is already added)

✅ **Done when:** npm install completes without errors

---

## Step 8: Test the Connection (2 minutes)

1. **Start your development server:**
   ```bash
   npm run dev
   ```
2. **Wait for it to start** (you'll see "Ready on http://localhost:3000")
3. **Open your browser** and go to:
   ```
   http://localhost:3000/admin/status
   ```
4. **Check the status page:**
   - You should see: **"Connected: true"**
   - You should see table counts (probably 0 for both tables)
   - No error messages

✅ **Done when:** Status page shows "Connected: true"

**If you see errors:**
- Double-check your `DATABASE_URL` in `.env.local`
- Make sure you didn't add extra spaces or quotes
- Make sure you saved the `.env.local` file
- Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

---

## Step 9: Test Adding a Member (Optional but Recommended) (2 minutes)

1. **In your browser**, go to:
   ```
   http://localhost:3000/admin/import
   ```
2. **Or test the search page:**
   ```
   http://localhost:3000/search
   ```
3. **If everything works**, you're good to go!

✅ **Done when:** Pages load without database errors

---

## Step 10: Deploy to Production (if you use Vercel/Netlify)

### For Vercel:

1. **Go to your Vercel dashboard:** https://vercel.com/
2. **Select your project**
3. **Go to:** Settings → Environment Variables
4. **Add a new variable:**
   - **Name:** `DATABASE_URL`
   - **Value:** Your Neon connection string (same as Step 3)
   - **Environment:** Production, Preview, Development (check all)
5. **Click "Save"**
6. **Redeploy your app:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### For Netlify:

1. **Go to your Netlify dashboard:** https://app.netlify.com/
2. **Select your site**
3. **Go to:** Site settings → Environment variables
4. **Click "Add a variable"**
   - **Key:** `DATABASE_URL`
   - **Value:** Your Neon connection string
5. **Click "Save"**
6. **Redeploy** (or trigger a new deployment)

✅ **Done when:** Environment variable is set in your hosting platform

---

## ✅ Complete! You're Done!

Your database is now running on Neon and will **never auto-suspend**!

### What changed:
- ✅ Database is now on Neon (no auto-suspend)
- ✅ All your existing features still work
- ✅ You can still use Supabase if you want (just remove DATABASE_URL)
- ✅ Local SQLite still works for local development

### Next steps (optional):
- Import existing data from Supabase (if you have any)
- Test all features to make sure everything works
- Remove Supabase credentials from `.env.local` (if no longer needed)

---

## 🆘 Troubleshooting

### Error: "password authentication failed"
- **Problem:** Connection string is wrong
- **Solution:** Double-check you copied the entire connection string correctly
- Get a new connection string from Neon dashboard if needed

### Error: "relation does not exist"
- **Problem:** Tables weren't created
- **Solution:** Go back to Step 4, make sure you ran the entire `neon-schema.sql` file

### Error: "Cannot find module '@neondatabase/serverless'"
- **Problem:** Dependencies not installed
- **Solution:** Run `npm install` again (Step 7)

### Status page shows "Connected: false"
- **Problem:** Environment variable not loaded
- **Solution:** 
  - Check `.env.local` file exists and has correct DATABASE_URL
  - Make sure no extra spaces or quotes
  - Restart dev server (stop with Ctrl+C, then `npm run dev`)

### Still having issues?
1. Check Neon dashboard for any errors
2. Verify your connection string starts with `postgresql://`
3. Make sure you're using the correct connection string (not API key)
4. Check Neon documentation: https://neon.tech/docs

---

**Need help?** Check the main guide: `NEON_SETUP.md`



