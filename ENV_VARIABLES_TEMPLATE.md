# Environment Variables Template

Use this template to configure your environment variables for production deployment.

## Required Variables

### Database (Choose ONE)

**Option 1: Neon PostgreSQL (RECOMMENDED)**
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Option 2: Supabase**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Option 3: Local SQLite (Development only)**
```bash
NEXT_PUBLIC_USE_LOCAL_DB=true
SQLITE_DB_PATH=./database.sqlite
```

## Optional Variables

### MailChimp Integration
```bash
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_SERVER_PREFIX=us21
```

### Google Drive Integration
```bash
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_DRIVE_REFRESH_TOKEN=your_google_refresh_token_here
```

## For Vercel Deployment

Add these variables in: **Vercel Dashboard → Your Project → Settings → Environment Variables**

