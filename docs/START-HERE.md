# 🎯 START HERE - PC Setup for AI Matrx Mobile

## ⚡ Quick Setup (5 Commands)

```bash
# 1. Run setup script (installs Java, Android SDK, etc.)
./setup-android-dev.sh

# 2. Reload shell
source ~/.bashrc

# 3. Install dependencies
pnpm install

# 4. Start development
pnpm start

# 5. Scan QR code with Expo Go app on your phone
```

**That's it! You're ready to develop.** 🚀

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **SETUP-COMMANDS.txt** | Step-by-step setup commands (start here!) |
| **QUICK-START.md** | Quick reference guide |
| **PC-DEVELOPMENT-GUIDE.md** | Complete development guide (read this!) |
| **PC-VS-MAC-CAPABILITIES.md** | What you can do on PC vs Mac |
| **setup-android-dev.sh** | Automated setup script |

---

## 🎯 What You're Setting Up

### Your AI Matrx Mobile App
- **Type:** Expo React Native app
- **Expo SDK:** 54 (latest)
- **React:** 19 (latest)
- **Android Target:** SDK 35 (Android 15)
- **Features:** Chat, camera, media, notifications, auth

### Development Environment
- **Java JDK 17** - Required for Android
- **Android SDK** - Build and test Android apps
- **Platform Tools** - ADB for device debugging
- **Build Tools** - Compile Android apps

---

## ✅ What You Can Do on PC

### Full Capability
✅ Write and edit all code  
✅ Test on Android devices/emulators  
✅ Test on iOS via Expo Go  
✅ Build Android APKs  
✅ Hot reload for instant feedback  
✅ Debug with ADB  
✅ Use all native features (camera, notifications, etc.)  

### Limited (Need Mac)
❌ iOS Simulator  
❌ Build native iOS apps  
❌ App Store submissions  

**But:** You can test iOS features using Expo Go on an iPhone!

---

## 🚀 Your Daily Workflow

### Option 1: Expo Go (Recommended)
**Best for:** Quick development, UI changes, testing features

1. Start dev server: `pnpm start`
2. Scan QR code with Expo Go app
3. Make changes, see them instantly
4. Test on both Android and iOS

**Pros:**
- No build time (instant)
- Works on any device
- Hot reload
- Test both platforms

**Cons:**
- Some native features limited

---

### Option 2: Development Build
**Best for:** Testing all features, production-like environment

1. Connect Android phone via USB
2. Enable USB debugging
3. Run: `pnpm run android`
4. App installs and runs

**Pros:**
- All features work
- Production-like
- Full native access

**Cons:**
- 5-10 min build time
- Need to rebuild for native changes

---

## 🔧 Common Commands

```bash
# Development
pnpm start              # Start Expo dev server
pnpm run android        # Build and run on Android
expo start -c           # Clear cache and start

# Device Management
adb devices             # List connected devices
adb logcat              # View device logs

# Troubleshooting
expo doctor             # Check for issues
rm -rf node_modules && pnpm install  # Reinstall
```

---

## 📱 Testing Strategy

1. **Daily Development:** Use Expo Go
   - Instant feedback
   - Test on multiple devices
   - No build needed

2. **Feature Testing:** Build development build
   - Test native features
   - Android-specific testing
   - Performance testing

3. **iOS Testing:** Use Expo Go on iPhone
   - Test iOS behavior
   - Check iOS-specific UI
   - Verify cross-platform compatibility

4. **Final Testing:** Build on Mac (when needed)
   - iOS Simulator testing
   - Final QA before release

---

## 🆘 Need Help?

### Setup Issues
1. Check `SETUP-COMMANDS.txt` for exact commands
2. Read `PC-DEVELOPMENT-GUIDE.md` troubleshooting section
3. Ensure all verification steps pass

### Development Issues
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules && pnpm install

# Check for issues
expo doctor

# View logs
adb logcat
```

---

## 💡 Pro Tips

1. **Use Expo Go for 90% of development**
   - No build time
   - Test on any device
   - Instant feedback

2. **Only rebuild when:**
   - Adding native dependencies
   - Changing app.json
   - Modifying Android native code

3. **Keep both Android and iPhone handy**
   - Test cross-platform with Expo Go
   - Catch platform-specific issues early

4. **Use physical devices over emulators**
   - Faster performance
   - More accurate testing
   - Better development experience

---

## 🎯 Next Steps

1. **Run setup script:** `./setup-android-dev.sh`
2. **Read full guide:** `PC-DEVELOPMENT-GUIDE.md`
3. **Start developing:** `pnpm start`
4. **Make your first change and see hot reload!**

---

## 📊 Time Investment

- **Setup:** 10-15 minutes (one time)
- **First build:** 5-10 minutes
- **Daily development:** Instant with Expo Go
- **Learning curve:** Minimal (it's just React Native!)

---

## 🎉 You're Ready!

Your PC is now a powerful mobile development machine. You can build, test, and deploy Android apps, and test iOS features via Expo Go.

**Start with:** `./setup-android-dev.sh`

**Questions?** Check `PC-DEVELOPMENT-GUIDE.md`

**Let's build something amazing!** 🚀
