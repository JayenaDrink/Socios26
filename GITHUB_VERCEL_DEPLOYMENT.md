# 🚀 GitHub + Vercel Deployment Guide

This guide will help you deploy your Socios26 application using GitHub for source control and Vercel for hosting.

## Prerequisites

1. ✅ GitHub account (free)
2. ✅ Vercel account (free tier available)
3. ✅ Neon PostgreSQL database (or Supabase)
4. ✅ MailChimp API key (optional)

---

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /Users/nickkligman/Documents/GitHub/Socios26

# Check if git is already initialized
git status

# If not initialized:
git init
```

### 1.2 Verify .gitignore

Make sure `.gitignore` includes:
```
.env*
node_modules/
.next/
*.log
database.sqlite
```

### 1.3 Create .env.production.example

Create a template for environment variables (don't include actual secrets):

```bash
# .env.production.example
# Neon Database (RECOMMENDED)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# MailChimp (Optional)
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us21
MAILCHIMP_AUDIENCE_ID=your_audience_id

# Google Drive (Optional)
GOOGLE_DRIVE_CREDENTIALS_JSON={"type":"service_account",...}
```

---

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `socios26` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license

### 2.2 Push Your Code

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - Socios26 app"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/socios26.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Sign In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. **Sign in with GitHub** (recommended for easy integration)

### 3.2 Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Select your `socios26` repository
4. Click **"Import"**

### 3.3 Configure Project

1. **Framework Preset:** Should auto-detect "Next.js"
2. **Root Directory:** Leave as `./` (unless your Next.js app is in a subdirectory)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

### 3.4 Add Environment Variables

Before deploying, click **"Environment Variables"** and add:

#### Required Variables:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

#### Optional Variables:

```bash
# MailChimp Integration
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us21
MAILCHIMP_AUDIENCE_ID=your_audience_id

# Google Drive Integration
GOOGLE_DRIVE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

**Important:**
- ✅ Add to **Production**, **Preview**, and **Development** environments
- ✅ Use the same values for all environments, or different ones for testing
- ✅ Never commit actual secrets to GitHub

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-3 minutes)
3. Your app will be live at: `https://socios26.vercel.app` (or your custom domain)

---

## Step 4: Configure Automatic Deployments

### 4.1 Automatic Deployments (Already Configured)

Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Rolls back on build failures

### 4.2 GitHub Integration

Your repository is already connected to Vercel. You can:
- View deployment status in GitHub
- See deployment URLs in pull requests
- Trigger deployments from GitHub

---

## Step 5: Verify Deployment

### 5.1 Test Your App

1. Visit your Vercel URL: `https://socios26.vercel.app`
2. Check API status: `https://socios26.vercel.app/api/database/status`
3. Test MailChimp: `https://socios26.vercel.app/api/mailchimp/status`

### 5.2 Common Issues

#### Database Connection Failed

**Check:**
- ✅ `DATABASE_URL` is set correctly in Vercel
- ✅ Database allows connections from Vercel IPs (Neon/Supabase should allow this)
- ✅ Connection string includes `?sslmode=require`

**Fix:**
```bash
# In Vercel dashboard, update DATABASE_URL:
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

#### API Routes Not Working

**Check:**
- ✅ Build logs show no errors
- ✅ API routes are in `src/app/api/` directory
- ✅ Routes are exported correctly

**Fix:**
- Check Vercel build logs for errors
- Verify Next.js version compatibility

#### Environment Variables Not Loading

**Check:**
- ✅ Variables are added to correct environment (Production)
- ✅ Variable names match exactly (case-sensitive)
- ✅ No extra spaces or quotes

**Fix:**
- Redeploy after adding/updating variables
- Check Vercel logs for variable loading errors

---

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `socios26.com`)
4. Follow DNS configuration instructions

### 6.2 Configure DNS

Add DNS records as instructed by Vercel:
- **A Record** or **CNAME** pointing to Vercel
- SSL certificate is automatic

---

## Step 7: Monitor and Maintain

### 7.1 View Logs

- Go to Vercel Dashboard → Your Project → **"Deployments"**
- Click on a deployment → **"Logs"**
- View real-time logs and errors

### 7.2 Monitor Performance

- Vercel Analytics (free tier available)
- Check function execution times
- Monitor API route performance

### 7.3 Update Application

Simply push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys!
```

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

✅ Already in `.gitignore`:
```
.env*
.env.local
.env.production
```

### 2. Use Different Keys for Production

- Development: Use local `.env.local`
- Production: Use Vercel Environment Variables

### 3. Rotate Keys Regularly

- Change database passwords periodically
- Rotate API keys if compromised

### 4. Enable Authentication

Add authentication to admin routes:
```typescript
// Example: src/app/api/admin/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... rest of code
}
```

---

## 📊 Vercel Free Tier Limits

- ✅ **100 GB bandwidth/month** - Usually enough for small apps
- ✅ **100 serverless function invocations/second**
- ✅ **Unlimited deployments**
- ✅ **Automatic HTTPS**
- ✅ **Preview deployments**

**Upgrade if you need:**
- More bandwidth
- More function invocations
- Team collaboration
- Advanced analytics

---

## 🎯 Summary

Your deployment workflow:

1. **Develop locally** → Test on `localhost:3000`
2. **Commit changes** → `git commit -m "Update"`
3. **Push to GitHub** → `git push origin main`
4. **Vercel auto-deploys** → Live in ~2 minutes
5. **Test production** → Visit your Vercel URL

---

## 🆘 Need Help?

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Support:** https://vercel.com/support
- **GitHub Issues:** Create an issue in your repository

---

## ✅ Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API routes working
- [ ] Admin routes secured (if needed)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (optional)
- [ ] Documentation updated

**You're all set! 🎉**

