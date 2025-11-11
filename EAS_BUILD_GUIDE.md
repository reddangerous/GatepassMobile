# EAS Build Configuration & Troubleshooting Guide

## ✅ What Was Updated

Your `eas.json` has been updated with proper Node version specifications and build optimizations for Ubuntu WSL compatibility.

### Changes Made:
- ✅ Added explicit `node: "18.0.0"` to all build profiles
- ✅ Added `prebuildCommand` for development builds
- ✅ Added environment validation skip for smoother builds
- ✅ Ensured consistency across development, preview, and production

---

## 🚀 Quick Start: Building on EAS

### Step 1: Prerequisites Check

```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check Expo CLI
npx expo --version

# Login to Expo
eas login
```

### Step 2: Clean Your Local Setup

```bash
cd d:\StaffGP\GatepassMobile

# Clear Expo cache
npx expo start -c

# Exit (Ctrl+C)

# Clean node_modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Verify installation
npm list
```

### Step 3: Test Locally First

```bash
# Test Android locally
npm run android

# OR test iOS locally
npm run ios

# OR start development server
npm run start
```

### Step 4: Build with EAS

```bash
# For Android (preview build)
eas build --platform android --profile preview

# For iOS (preview build)
eas build --platform ios --profile preview

# For production
eas build --platform android --profile production
```

---

## 🔧 Build Profiles Explained

### **Development Profile**
- Used for internal testing with development client
- Optimized for fast iteration
- Includes debugging tools
- **Node:** 18.0.0
- **Distribution:** internal

### **Preview Profile**
- Used for testing with production-like build
- Can be shared with testers
- Smaller than production, larger than development
- **Node:** 18.0.0
- **Distribution:** internal

### **Production Profile**
- Used for final app store submission
- Full optimization and minification
- Auto-increment version for each build
- **Node:** 18.0.0
- **Distribution:** store

---

## 🐛 Troubleshooting Common EAS Build Errors

### ❌ Error: "Cannot find module 'expo-secure-store'"

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Test locally
npx expo start -c

# Then try EAS build
```

### ❌ Error: "Node version mismatch"

**Solution:**
The `eas.json` now specifies Node 18.0.0. If you have a different version locally:

```bash
# Check your local Node version
node --version

# If different from 18.x:
# Use nvm to switch versions
nvm use 18

# Or install Node 18 directly from nodejs.org
```

### ❌ Error: "Build failed on Ubuntu WSL"

**Causes & Solutions:**

1. **Missing native build tools:**
   ```bash
   # On Ubuntu WSL
   sudo apt-get update
   sudo apt-get install -y build-essential python3
   ```

2. **Watchman issues (if on WSL):**
   ```bash
   # The EAS build server handles this, but locally:
   watchman watch-del-all
   ```

3. **Memory issues:**
   ```bash
   # Increase Node memory
   NODE_OPTIONS="--max-old-space-size=4096" eas build --platform android
   ```

### ❌ Error: "Cannot connect to backend API"

**Solution:**
Check your `app.json` API URL:
```json
{
  "extra": {
    "apiUrl": "http://192.168.2.53:3000/api",
    "eas": {
      "projectId": "db238de0-8058-473f-acb0-028623d9a994"
    }
  }
}
```

For **production builds**, update to your real API URL:
```json
{
  "extra": {
    "apiUrl": "https://your-production-api.com/api"
  }
}
```

### ❌ Error: "EAS Build Authentication Failed"

**Solution:**
```bash
# Re-authenticate
eas logout
eas login

# Verify credentials
eas whoami
```

### ❌ Error: "Build took too long and was terminated"

**Solution:**
This usually means something is hanging. Try:

```bash
# Clean everything
npm run start -- -c

# Exit and try again with more verbosity
eas build --platform android --profile preview --verbose
```

---

## 📋 Pre-Build Checklist

Before submitting an EAS build, verify:

- [ ] Node version is 18+: `node --version`
- [ ] All dependencies installed: `npm install`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Code compiles locally: `npm run start`
- [ ] `.env` file is configured correctly
- [ ] `app.json` has correct API URL for the environment
- [ ] `eas.json` is valid JSON: `npx eas config --json`
- [ ] No uncommitted changes affecting the build
- [ ] You're logged into EAS: `eas whoami`
- [ ] Project ID matches: Check `app.json` → `extra.eas.projectId`

---

## 🔍 Monitoring Your EAS Build

### View Build Status

```bash
# Check current builds
eas build:list

# View specific build details
eas build:view <BUILD_ID>

# View build logs in real-time
eas build:log <BUILD_ID>
```

### View Build Artifacts

After a successful build:
```bash
# List completed builds
eas build:list --status finished

# Download APK/IPA
# They'll be available in your EAS dashboard at https://expo.dev
```

---

## 🎯 Best Practices for EAS Builds

### 1. **Always Test Locally First**
```bash
npm run start
# Test on simulator before submitting to EAS
```

### 2. **Use Separate Build Profiles**
- **Development**: For rapid iteration
- **Preview**: For internal testing
- **Production**: For app store submission

### 3. **Version Management**
In `eas.json`, the production profile has `autoIncrement: true`:
```json
"production": {
  "autoIncrement": true
}
```
This automatically increments the build number for each production build.

### 4. **Environment Variables**
Set build-specific env vars in `eas.json`:
```json
{
  "build": {
    "preview": {
      "env": {
        "API_URL": "https://staging-api.com"
      }
    }
  }
}
```

### 5. **Monitor Build Logs**
Keep an eye on build logs for warnings:
```bash
eas build:log <BUILD_ID> | grep -i warning
```

---

## 📱 Platform-Specific Notes

### Android (APK/AAB)

**For preview/internal testing:**
```bash
eas build --platform android --profile preview
# Produces APK, can be sideloaded
```

**For Play Store submission:**
```bash
eas build --platform android --profile production
# Produces AAB (Android App Bundle)
```

### iOS (IPA)

**For preview/internal testing:**
```bash
eas build --platform ios --profile preview
# Requires Apple Developer account
# Can be distributed via TestFlight
```

**For App Store submission:**
```bash
eas build --platform ios --profile production
# Produces IPA for App Store submission
```

---

## 🔐 Security Best Practices

1. **Never commit sensitive data:**
   ```bash
   # .env should be in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use EAS Secrets for production:**
   ```bash
   # Set environment variables securely
   eas secret:create
   ```

3. **Verify API URLs before building:**
   - Development: `http://192.168.2.53:3000/api` (local only)
   - Production: `https://secure-api-url.com` (HTTPS required)

---

## 🚨 Common Gotchas

### ⚠️ Gotcha #1: Project ID Mismatch
**Problem:** Build fails with "Project ID not found"
**Fix:** 
```bash
# Verify your project ID matches
eas project:info

# Update app.json if needed
{
  "extra": {
    "eas": {
      "projectId": "YOUR_ACTUAL_PROJECT_ID"
    }
  }
}
```

### ⚠️ Gotcha #2: Native Module Cache Issues
**Problem:** Build fails with "Native module not found"
**Fix:**
```bash
# Clear EAS build cache
eas build:list --status finished
# Sometimes requires clearing cache on EAS dashboard
```

### ⚠️ Gotcha #3: TypeScript Build Errors
**Problem:** Build fails during TypeScript compilation
**Fix:**
```bash
# Check for errors locally
npx tsc --noEmit

# Fix any errors before submitting to EAS
```

### ⚠️ Gotcha #4: Backend Not Running
**Problem:** Mobile app builds successfully but can't connect at runtime
**Fix:**
```bash
# Ensure backend is running
cd ../backend
npm run dev

# Check API is responding
curl http://192.168.2.53:3000/api/health
```

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Config Documentation](https://docs.expo.dev/versions/latest/config/app/)
- [Troubleshooting EAS Build](https://docs.expo.dev/build/troubleshooting/)

---

## ✅ Quick Command Reference

```bash
# Login/Logout
eas login
eas logout
eas whoami

# Check config
eas config --json
eas project:info

# Build commands
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform android --profile production

# View builds
eas build:list
eas build:view <BUILD_ID>
eas build:log <BUILD_ID>

# Clean up locally
npm install
npx expo start -c
rm -rf node_modules
```

---

## 🎯 Next Steps

1. ✅ Updated `eas.json` with proper Node version
2. 🔄 Clean and reinstall: `rm -rf node_modules && npm install`
3. 🧪 Test locally: `npm run start`
4. 🚀 Submit to EAS: `eas build --platform android --profile preview`
5. 📊 Monitor build: Check your EAS dashboard

Good luck! 🚀
