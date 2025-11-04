# 🚀 Quick Start - Local Development

This folder contains several scripts to easily start your Socios Club application locally.

## 📋 Available Scripts

### Option 1: Shell Script (macOS/Linux)
```bash
./start-local.sh
```

### Option 2: Batch Script (Windows)
```cmd
start-local.bat
```

### Option 3: Node.js Script (Cross-platform)
```bash
node start-local.js
```

## 🔧 What the Scripts Do

1. **Check Environment**: Verify you're in the correct directory
2. **Setup Environment**: Create `.env.local` if it doesn't exist
3. **Install Dependencies**: Run `npm install` if needed
4. **Stop Existing Servers**: Kill any running development servers
5. **Start Application**: Launch the development server

## 🌐 Access Your Application

Once started, your application will be available at:
- **Local**: http://localhost:3000 (or next available port)
- **Network**: Accessible from other devices on your network

## 💡 Usage Tips

- **First Time**: The script will automatically install dependencies
- **Environment**: Your `.env.local` file will be created automatically
- **Database**: SQLite database will be created at `./database.sqlite`
- **Stop Server**: Press `Ctrl+C` to stop the development server

## 🔄 Reset Database

If you need to reset your local database:
```bash
rm database.sqlite
./start-local.sh
```

## 📱 Features Available Locally

- ✅ Member search and management
- ✅ Import Excel files
- ✅ Transfer members between 2025/2026 lists
- ✅ Admin panel
- ✅ MailChimp integration (if configured)
- ✅ Multi-language support
- ✅ Responsive design

## 🆘 Troubleshooting

**Port Already in Use**: The script will automatically use the next available port.

**Permission Denied**: Make sure the script is executable:
```bash
chmod +x start-local.sh
```

**Dependencies Issues**: Delete `node_modules` and run the script again:
```bash
rm -rf node_modules
./start-local.sh
```

---

**Ready to start?** Just run one of the scripts above! 🎉




















