#!/bin/bash

# Socios Club - Local Development Startup Script
echo "🚀 Starting Socios Club Local Development..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected to find package.json in current directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found, creating it..."
    node setup-local.js
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Kill any existing Next.js processes
echo "🔄 Stopping any existing development servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start the development server
echo "🌟 Starting development server..."
echo "   The application will be available at:"
echo "   - http://localhost:3000 (or next available port)"
echo "   - Network access from other devices on your network"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

npm run dev




















