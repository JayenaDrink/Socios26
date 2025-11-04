@echo off
REM Socios Club - Local Development Startup Script (Windows)

echo 🚀 Starting Socios Club Local Development...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Expected to find package.json in current directory
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local not found, creating it...
    node setup-local.js
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Kill any existing Next.js processes
echo 🔄 Stopping any existing development servers...
taskkill /f /im node.exe 2>nul || echo No existing processes found
timeout /t 2 /nobreak >nul

REM Start the development server
echo 🌟 Starting development server...
echo    The application will be available at:
echo    - http://localhost:3000 (or next available port)
echo    - Network access from other devices on your network
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

npm run dev




















