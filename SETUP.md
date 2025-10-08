# Club Amistades Belgas de Levante - Setup Instructions

## Phase 1: Project Setup Complete ✅

The basic project structure has been created with:
- Next.js 15 with TypeScript and Tailwind CSS
- Supabase database (free tier)
- Multilingual support (Dutch, French, Spanish)
- Basic UI components and layout

## Phase 2: Database Integration Complete ✅

Database integration has been implemented with:
- Two tables: `members_2025` and `members_2026`
- Excel file import functionality
- Member search functionality
- Member transfer from 2025 to 2026 list
- Status page to check database connection
- API routes for all database operations

## Next Steps: Database Setup

### 1. Supabase Database Setup (FREE)

1. **Go to Supabase**: https://supabase.com/
2. **Create a new project** (free tier):
   - Click "Start your project"
   - Sign up with GitHub, Google, or email
   - Create a new project
   - Choose a region close to you
3. **Get your project credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon/public key

4. **Create the database tables**:
   - Go to SQL Editor in your Supabase dashboard
   - Run the following SQL to create the tables:

```sql
-- Create members_2025 table
CREATE TABLE members_2025 (
  id SERIAL PRIMARY KEY,
  member_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  amount_paid DECIMAL(10,2) DEFAULT 35.00,
  year INTEGER DEFAULT 2025,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(20) DEFAULT '2025_list',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members_2026 table
CREATE TABLE members_2026 (
  id SERIAL PRIMARY KEY,
  member_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  amount_paid DECIMAL(10,2) DEFAULT 35.00,
  year INTEGER DEFAULT 2026,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(20) DEFAULT 'form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_2025_member_number ON members_2025(member_number);
CREATE INDEX idx_members_2025_email ON members_2025(email);
CREATE INDEX idx_members_2026_member_number ON members_2026(member_number);
CREATE INDEX idx_members_2026_email ON members_2026(email);
```

### 2. Environment Configuration

1. **Copy the example file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your credentials** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: MailChimp integration
   MAILCHIMP_API_KEY=your_api_key
   MAILCHIMP_SERVER_PREFIX=your_server_prefix
   MAILCHIMP_AUDIENCE_ID=your_audience_id
   ```

### 3. Install Dependencies and Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the application**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Current Features

- ✅ Multilingual interface (Dutch, French, Spanish)
- ✅ Responsive design with Tailwind CSS
- ✅ Supabase database with two tables (members_2025, members_2026)
- ✅ Basic layout and navigation
- ✅ Excel file import functionality
- ✅ Member search functionality (search by member number or email)
- ✅ Member transfer from 2025 to 2026 list
- ✅ Status page to check database connection
- ⏳ MailChimp integration (Phase 3)
- ⏳ Member form for new members (Phase 3)

## Database Integration Features

### Available Pages:
1. **Home Page** (`/`) - Overview and navigation
2. **Search Page** (`/search`) - Search members from 2025 list
3. **Import Page** (`/import`) - Import Excel data to database
4. **Status Page** (`/status`) - Check database connection status

### API Endpoints:
- `GET /api/database/status` - Check database connection
- `GET /api/database/members-2025` - Get all 2025 members
- `GET /api/database/members-2026` - Get all 2026 members
- `POST /api/database/search-member` - Search members by criteria
- `POST /api/database/transfer-member` - Transfer member to 2026
- `POST /api/database/import-excel` - Import Excel file to 2025 table

### How to Use:
1. **Check Status**: Visit `/status` to verify database connection
2. **Import Data**: Go to `/import` to upload your Excel file with 2025 members
3. **Search Members**: Go to `/search` and enter member number or email
4. **Transfer Members**: Click "Transfer to 2026" button for found members
5. **Database Storage**: All data is stored in Supabase (free tier)

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                # Utilities and configurations
├── locales/            # Translation files
└── types/              # TypeScript type definitions
```

## Free Hosting Options

1. **Vercel** (Recommended)
   - Automatic deployments from GitHub
   - Free tier with good limits
   - Easy environment variable setup
   - Perfect for Next.js applications

2. **Netlify**
   - Good for static sites
   - Free tier available

3. **Supabase Hosting** (Database included)
   - Your database is already hosted on Supabase
   - Free tier includes 500MB storage and 50,000 monthly requests

## Benefits of This Setup

✅ **No Google API costs** - Completely free database solution
✅ **Easy data management** - Import Excel files directly through the web interface
✅ **Real-time updates** - Database changes are instant
✅ **Scalable** - Supabase free tier handles thousands of members
✅ **Secure** - Built-in authentication and security features
✅ **Backup included** - Automatic database backups

## Next Phase

Once you have the database configured, you can:
1. Import your existing Excel data
2. Search and transfer members
3. Add new members through the interface
4. Deploy to Vercel for free hosting
