# 🚀 Quick Start - AI Matrx Mobile on PC

## Step 1: Run Android Setup Script

```bash
cd ~/ai-matrx-mobile
./setup-android-dev.sh
```

**This will install:**
- Java JDK 17
- Android SDK Command Line Tools
- Android Platform 35 (Android 15)
- Build Tools 35.0.0
- Platform Tools (ADB)

**Time:** ~5-10 minutes (depending on download speed)

---

## Step 2: Reload Shell

```bash
source ~/.bashrc
```

---

## Step 3: Install Project Dependencies

```bash
pnpm install
```

**Time:** ~2-3 minutes

---

## Step 4: Start Development

### Option A: Expo Go (Fastest - Recommended First)

```bash
pnpm start
```

Then:
1. Install **Expo Go** app on your phone
2. Scan the QR code
3. Start developing!

### Option B: Development Build (Full Features)

```bash
# Connect Android phone via USB
# Enable USB debugging on phone

# Verify connection
adb devices

# Build and run
pnpm run android
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# Check Java
java -version
# Should show: openjdk version "17.x.x"

# Check Android SDK
echo $ANDROID_HOME
# Should show: /home/arman/Android/Sdk

# Check ADB
adb --version
# Should show: Android Debug Bridge version 35.x.x

# Check Expo
expo --version
# Should show: 6.3.10

# Check project dependencies
cd ~/ai-matrx-mobile && pnpm list
# Should list all packages without errors
```

---

## 🎯 What You Can Do Now

✅ **Full Android Development**
- Build and test Android apps
- Debug on real devices
- Test all features (camera, notifications, etc.)
- Build APKs for distribution

✅ **Cross-Platform Testing**
- Use Expo Go on any device (Android/iOS)
- Hot reload for instant feedback
- Test UI on multiple devices

✅ **Code Everything**
- Edit all React Native/Expo code
- Add new features
- Fix bugs
- Update dependencies

❌ **iOS Native Builds** (Need Mac for this)
- iOS Simulator
- TestFlight builds
- App Store submissions

---

## 📖 Next Steps

1. Read the full guide: `PC-DEVELOPMENT-GUIDE.md`
2. Explore the project structure
3. Start the dev server: `pnpm start`
4. Make your first change and see hot reload in action!

---

## 🆘 Need Help?

**Setup Issues:**
- Check `PC-DEVELOPMENT-GUIDE.md` → Troubleshooting section
- Ensure all verification steps pass
- Restart terminal after running setup script

**Development Issues:**
- Clear cache: `expo start -c`
- Reinstall: `rm -rf node_modules && pnpm install`
- Check logs: `adb logcat`

---

## 💡 Pro Tip

For daily development:
1. Use **Expo Go** for UI changes (instant, no build needed)
2. Use **development build** when testing native features
3. Only rebuild when you change native code or add native dependencies

**You'll be productive in minutes, not hours!** 🎉
