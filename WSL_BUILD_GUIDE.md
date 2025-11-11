# WSL Build & Deploy Guide - Production Testing

Quick guide to build and test your app in production mode using WSL.

## Prerequisites

```bash
# Verify Node 18+ on WSL
node --version

# Should output: v18.x.x or higher
```

## 1. Setup WSL Environment

Open WSL terminal and navigate to your project:

```bash
# Convert Windows path to WSL path
cd /mnt/d/StaffGP/GatepassMobile

# Or if you have your repo on WSL directly
cd ~/projects/StaffGP/GatepassMobile
```

## 2. Clean Install Dependencies

```bash
# Remove existing node_modules
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install

# Verify installation
npm list | head -20
```

## 3. Verify Configuration

```bash
# Check app.json is correct
cat app.json | grep -A 3 "extra"

# Should show your backend URL: http://192.168.1.106:3005/api
```

## 4. Build for Development Testing

### Option A: Local Build on Android Device

```bash
# Prerequisites: Android SDK installed on WSL
# Install: sudo apt-get install android-sdk-platform-tools

# Build and run on connected device
npm run android

# Or with Expo
npx expo run:android
```

### Option B: EAS Build (Recommended for Production Testing)

```bash
# Ensure you're logged in to Expo
eas login

# Check your project info
eas whoami

# Build for preview (production-like build)
eas build --platform android --profile preview

# Or build for production
eas build --platform android --profile production

# Watch the build logs
# Check EAS dashboard: https://expo.dev
```

## 5. Development Mode (Local Testing)

```bash
# Start dev server
npm run start

# This opens Expo menu in terminal
# Options:
# a - Android device/emulator
# i - iOS simulator
# w - Web browser
# j - Debugger
# r - Reload app
# o - Open in browser
```

## 6. Build for Production Release

```bash
# Full production build (optimized & minified)
eas build --platform android --profile production

# Get build artifact
eas build:list --status finished

# Download APK/AAB from EAS dashboard
```

## 7. Test APK Locally

Once you have an APK from EAS:

```bash
# If running on connected Android device
adb install path/to/your/app.apk

# Or use EAS to distribute
eas build:list

# View and share build artifacts from EAS dashboard
```

## Quick Build Commands

| Task | Command |
|------|---------|
| **Quick local test** | `npm run start` |
| **Build Android preview** | `eas build --platform android --profile preview` |
| **Build production** | `eas build --platform android --profile production` |
| **View past builds** | `eas build:list` |
| **Download APK** | Via https://expo.dev dashboard |
| **Monitor build logs** | `eas build:log <BUILD_ID>` |
| **Clean cache** | `npm run start -- -c` |

## WSL + Windows Integration Tips

### 1. Easy Path Access

```bash
# Windows path in WSL
cd /mnt/d/StaffGP/GatepassMobile

# Or create a symlink for easier access
ln -s /mnt/d/StaffGP/GatepassMobile ~/gatepass

# Then just use
cd ~/gatepass
```

### 2. Edit in VS Code from WSL

```bash
# Open current directory in VS Code
code .
```

### 3. Run Both Backend & App from WSL

```bash
# Terminal 1: Backend
cd /mnt/d/StaffGP/backend
npm start

# Terminal 2: Mobile App (in new WSL tab)
cd /mnt/d/StaffGP/GatepassMobile
npm run start
```

## Environment-Specific API URLs

Update `app.json` before building for different environments:

```json
{
  "extra": {
    "apiUrl": "http://192.168.1.106:3005/api"  // Development
  }
}
```

For **staging/production**, use your actual API URL:

```json
{
  "extra": {
    "apiUrl": "https://your-api.example.com/api"
  }
}
```

## Testing Production Build Locally

```bash
# Build production APK locally without uploading
# First, ensure your backend is accessible at the configured URL

# Start the app
npm run start

# Select 'a' for Android
# The app will now be in production mode

# Test all features:
# - Login
# - Gate pass creation
# - File uploads
# - Notifications
```

## Troubleshooting

### Build Fails on WSL

```bash
# Ensure build tools are installed
sudo apt-get update
sudo apt-get install -y build-essential python3

# Clear WSL cache
rm -rf ~/.expo
rm -rf ~/.cache/expo

# Try again
eas build --platform android --profile preview --verbose
```

### Can't Connect to Backend

```bash
# Verify backend is running on server
curl http://192.168.1.106:3005/health

# Check app.json has correct URL
cat app.json | grep apiUrl

# Rebuild if URL was changed
rm -rf .expo
npm run start -- -c
```

### APK Installation Fails

```bash
# Check Android SDK is working
adb devices

# Uninstall old version first
adb uninstall com.gatepass.mobile

# Then install new APK
adb install app.apk
```

## Next Steps

1. ✅ Setup WSL terminal
2. 🔄 Run `npm install`
3. ✔️ Verify backend URL in `app.json`
4. 🚀 Choose build option above
5. 📱 Test on device
6. 🎉 Deploy to production when ready

Good luck! 🚀
