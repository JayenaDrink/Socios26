#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Socios Club Local Development...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  console.error('   Expected to find package.json in current directory');
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('⚠️  .env.local not found, creating it...');
  try {
    require('./setup-local.js');
  } catch (error) {
    console.error('Failed to create .env.local:', error.message);
  }
  console.log('');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
    startDevServer();
  });
} else {
  startDevServer();
}

function startDevServer() {
  // Kill any existing Next.js processes
  console.log('🔄 Stopping any existing development servers...');
  
  const killCommand = process.platform === 'win32' ? 'taskkill /f /im node.exe' : 'pkill -f "next dev"';
  
  exec(killCommand, (error) => {
    // Ignore errors - process might not be running
    setTimeout(() => {
      // Start the development server
      console.log('🌟 Starting development server...');
      console.log('   The application will be available at:');
      console.log('   - http://localhost:3000 (or next available port)');
      console.log('   - Network access from other devices on your network');
      console.log('');
      console.log('💡 Press Ctrl+C to stop the server');
      console.log('');
      
      const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
      
      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping development server...');
        devServer.kill('SIGINT');
        process.exit(0);
      });
      
      devServer.on('close', (code) => {
        console.log(`\n📝 Development server stopped with code ${code}`);
        process.exit(code);
      });
    }, 2000);
  });
}




















