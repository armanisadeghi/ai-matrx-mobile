# ✅ PC Setup Checklist

## Pre-Setup (Already Done ✅)

- [x] Node.js installed (v24.11.1)
- [x] pnpm installed (v10.23.0)
- [x] Expo CLI available (v6.3.10)
- [x] WSL2 environment ready
- [x] Project cloned to PC

## Setup Steps (Do These Now 👇)

### 1. Install Android Development Tools

```bash
cd ~/ai-matrx-mobile
./setup-android-dev.sh
```

**What this does:**
- [ ] Installs Java JDK 17
- [ ] Downloads Android SDK Command Line Tools
- [ ] Installs Android Platform 35 (Android 15)
- [ ] Installs Build Tools 35.0.0
- [ ] Installs Platform Tools (ADB)
- [ ] Configures environment variables

**Time:** ~5-10 minutes  
**Requires:** Sudo password

---

### 2. Reload Shell

```bash
source ~/.bashrc
```

**What this does:**
- [ ] Loads Android environment variables
- [ ] Updates PATH with Android tools

**Time:** Instant

---

### 3. Verify Installation

```bash
java -version
echo $ANDROID_HOME
adb --version
expo --version
```

**Expected output:**
- [ ] Java: `openjdk version "17.x.x"`
- [ ] ANDROID_HOME: `/home/arman/Android/Sdk`
- [ ] ADB: `Android Debug Bridge version 35.x.x`
- [ ] Expo: `6.3.10`

---

### 4. Install Project Dependencies

```bash
cd ~/ai-matrx-mobile
pnpm install
```

**What this does:**
- [ ] Installs all npm packages
- [ ] Sets up Expo dependencies
- [ ] Prepares React Native modules

**Time:** ~2-3 minutes

---

### 5. Configure Environment Variables

```bash
# Create .env file
touch .env

# Edit with your favorite editor
nano .env
# or
code .env
```

**Add these lines:**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Get credentials from:**
- [ ] Go to supabase.com
- [ ] Open your project
- [ ] Settings → API
- [ ] Copy URL and anon key

**See:** `ENVIRONMENT-SETUP.md` for details

---

### 6. Start Development Server

```bash
pnpm start
```

**What this does:**
- [ ] Starts Expo development server
- [ ] Shows QR code for testing
- [ ] Enables hot reload

**Expected:** QR code appears in terminal

---

### 7. Test on Device

**Option A: Expo Go (Recommended First)**
- [ ] Install Expo Go app on your phone
- [ ] Scan QR code from terminal
- [ ] App loads on your phone
- [ ] Make a change and see hot reload work

**Option B: Android Development Build**
```bash
# Connect Android phone via USB
# Enable USB debugging on phone

adb devices  # Should show your device

pnpm run android  # Build and install
```

---

## Verification Checklist

After completing all steps, verify:

### Environment
- [ ] Java installed and working
- [ ] Android SDK installed
- [ ] ADB can be run from terminal
- [ ] Environment variables set

### Project
- [ ] Dependencies installed (node_modules exists)
- [ ] .env file created with Supabase credentials
- [ ] No errors when running `pnpm start`

### Testing
- [ ] Can start dev server
- [ ] QR code appears
- [ ] Can test on device with Expo Go
- [ ] Hot reload works

---

## What You Can Do Now

### ✅ Full Capability on PC

- [ ] Edit all code
- [ ] Test with Expo Go on any device (Android/iOS)
- [ ] Build Android apps
- [ ] Debug Android with ADB
- [ ] Use hot reload
- [ ] Test all features via Expo Go

### ⚠️ Need Mac For

- [ ] iOS Simulator
- [ ] Native iOS builds
- [ ] App Store submissions

---

## Daily Workflow

### Morning Routine
```bash
cd ~/ai-matrx-mobile
pnpm start
```

### Development
1. [ ] Make code changes
2. [ ] See changes instantly (hot reload)
3. [ ] Test on device via Expo Go
4. [ ] Commit and push

### When to Rebuild
Only rebuild when:
- [ ] Added native dependencies
- [ ] Changed app.json
- [ ] Modified Android native code

---

## Troubleshooting

### If something doesn't work:

**Setup Issues:**
```bash
# Re-run setup script
./setup-android-dev.sh

# Reload shell
source ~/.bashrc

# Verify installation
java -version && echo $ANDROID_HOME && adb --version
```

**Dev Server Issues:**
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules && pnpm install
```

**ADB Issues:**
```bash
# Restart ADB
adb kill-server
adb start-server
adb devices
```

---

## Documentation Reference

| File | When to Read |
|------|--------------|
| **START-HERE.md** | First time setup |
| **SETUP-COMMANDS.txt** | Step-by-step commands |
| **PC-DEVELOPMENT-GUIDE.md** | Complete reference |
| **PC-VS-MAC-CAPABILITIES.md** | Understanding limitations |
| **ENVIRONMENT-SETUP.md** | Configuring .env |
| **QUICK-START.md** | Quick reference |
| **CHECKLIST.md** | This file! |

---

## 🎯 Current Status

**Completed:**
- [x] Project analysis
- [x] Documentation created
- [x] Setup script prepared
- [x] README updated

**Next (You Do):**
- [ ] Run setup script
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Start developing!

---

## 🚀 Ready to Start?

Run this command:
```bash
./setup-android-dev.sh
```

Then follow the checklist above!

**Questions?** Check the documentation files listed above.

**Let's build something amazing!** 🎉
