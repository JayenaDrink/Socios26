#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Socios Club for local development...\n');

// Create .env.local file for local development
const envContent = `# Local Development Environment Variables
# This file is for local development only - it uses SQLite instead of Supabase

# Database Configuration
DATABASE_URL=./database.sqlite

# Local development mode (automatically uses SQLite)
NEXT_PUBLIC_USE_LOCAL_DB=true

# Optional: MailChimp integration (leave empty for local development)
# MAILCHIMP_API_KEY=
# MAILCHIMP_SERVER_PREFIX=
# MAILCHIMP_AUDIENCE_ID=
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file for local development');
} else {
  console.log('ℹ️  .env.local already exists');
}

console.log('\n📋 Local Development Setup Complete!');
console.log('\nTo run the application locally:');
console.log('1. npm install');
console.log('2. npm run dev');
console.log('\nThe application will be available at http://localhost:3000');
console.log('\n🔧 Features:');
console.log('- SQLite database (database.sqlite will be created automatically)');
console.log('- No external dependencies required');
console.log('- All existing functionality works locally');
console.log('- Data persists between restarts');
console.log('\n📁 Database file: ./database.sqlite');
console.log('💡 You can delete this file to reset the database');




















