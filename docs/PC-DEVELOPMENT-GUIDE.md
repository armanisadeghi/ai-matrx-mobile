# AI Matrx Mobile - PC Development Guide (WSL2)

This guide covers setting up and working with the AI Matrx mobile app on your PC using WSL2.

## 🎯 What You Can Do on PC

### ✅ Full Android Development
- Build and run Android apps
- Debug on physical Android devices via USB
- Use Android emulators
- Test all Android-specific features
- Build APK/AAB files for distribution

### ✅ Cross-Platform Development
- Edit all React Native/Expo code
- Test with Expo Go on any device (Android/iOS)
- Use Expo development server
- Web preview (limited functionality)
- Hot reload and fast refresh

### ❌ iOS-Specific (Requires Mac)
- Building native iOS apps
- iOS Simulator
- iOS-specific native modules
- TestFlight builds
- App Store submissions

---

## 📦 Initial Setup

### 1. Run the Android Setup Script

```bash
cd ~/ai-matrx-mobile
./setup-android-dev.sh
```

This script will:
- Install Java JDK 17
- Download and install Android SDK Command Line Tools
- Configure environment variables
- Install Android SDK Platform 35 (Android 15)
- Install build tools and platform tools (ADB)

### 2. Reload Your Shell

After the script completes:

```bash
source ~/.bashrc
```

### 3. Install Project Dependencies

```bash
cd ~/ai-matrx-mobile
pnpm install
```

### 4. Verify Setup

```bash
# Check Java
java -version

# Check Android SDK
echo $ANDROID_HOME

# Check ADB
adb --version

# Check Expo
expo --version
```

---

## 🚀 Development Workflows

### Method 1: Expo Go (Fastest for Development)

**Best for:** Quick iterations, testing UI changes, cross-platform testing

```bash
# Start the development server
pnpm start
```

Then:
1. Install **Expo Go** app on your phone (Android or iOS)
2. Scan the QR code from the terminal
3. App loads instantly with hot reload

**Limitations:**
- Cannot test custom native modules
- Some features may not work (camera, notifications, etc.)

---

### Method 2: Development Build on Physical Android Device

**Best for:** Testing all features, production-like testing

#### Setup USB Debugging (One-time)

1. **On Your Android Phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect via USB:**
   ```bash
   # Connect phone to PC via USB cable
   # On phone: Allow USB debugging when prompted
   
   # Verify connection
   adb devices
   ```

3. **For WSL2 USB Access (if needed):**
   - Install [usbipd-win](https://github.com/dorssel/usbipd-win) on Windows
   - Share USB device with WSL2

#### Build and Run

```bash
# First time: Create development build
pnpm run android

# This will:
# - Build the Android app
# - Install it on your connected device
# - Start the development server
# - Enable hot reload
```

**Subsequent runs:**
```bash
# Just start the dev server (app already installed)
pnpm start

# Or rebuild if you changed native code
pnpm run android
```

---

### Method 3: Android Emulator (Optional)

**Best for:** Testing without physical device

#### Create Emulator

```bash
# List available system images
sdkmanager --list | grep system-images

# Create a Pixel 8 emulator with Android 15
avdmanager create avd \
  -n Pixel_8_API_35 \
  -k "system-images;android-35;google_apis;x86_64" \
  -d pixel_8

# Start emulator
emulator -avd Pixel_8_API_35 &
```

#### Run App on Emulator

```bash
# Wait for emulator to boot, then:
pnpm run android
```

**Note:** Emulators on WSL2 can be slow. Physical devices are recommended.

---

## 🔧 Common Development Tasks

### Installing New Dependencies

```bash
# Add a new package
pnpm add <package-name>

# If it has native code, rebuild
pnpm run android
```

### Clearing Cache

```bash
# Clear Expo cache
expo start -c

# Clear Metro bundler cache
pnpm start -- --clear

# Clear Android build cache
cd android && ./gradlew clean && cd ..
```

### Viewing Logs

```bash
# Expo logs (in dev server)
# Logs appear automatically in terminal

# Android device logs
adb logcat

# Filtered logs
adb logcat | grep "ReactNativeJS"
```

### Taking Screenshots

```bash
# Take screenshot from connected device
adb exec-out screencap -p > screenshot.png
```

### Installing APK Manually

```bash
# After building
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Testing Strategy on PC

### What to Test on PC (Android)
✅ All UI components and layouts
✅ Navigation and routing
✅ State management and data flow
✅ API integrations (Supabase)
✅ Camera, media picker, notifications
✅ Authentication flows
✅ File uploads/downloads
✅ Performance testing
✅ Android-specific features

### What to Test on Mac (iOS)
⚠️ iOS-specific UI differences
⚠️ iOS permissions and behaviors
⚠️ iOS-specific bugs
⚠️ Final iOS builds for TestFlight

### Cross-Platform Testing with Expo Go
✅ Quick UI iterations
✅ Basic functionality
✅ Layout testing on both platforms
✅ Share builds with team members

---

## 🐛 Troubleshooting

### ADB Not Detecting Device

```bash
# Check connection
adb devices

# If unauthorized, check phone for prompt

# Restart ADB server
adb kill-server
adb start-server

# For WSL2, ensure USB is shared from Windows
```

### Build Errors

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
pnpm run android
```

### Metro Bundler Issues

```bash
# Clear all caches
rm -rf node_modules
pnpm install
expo start -c
```

### Environment Variables Not Set

```bash
# Reload shell
source ~/.bashrc

# Or restart terminal
```

---

## 📊 Project Structure

```
ai-matrx-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main tab navigation
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
├── constants/             # App constants
├── hooks/                 # Custom React hooks
├── lib/                   # Libraries and utilities
├── types/                 # TypeScript types
├── assets/                # Images, fonts, etc.
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

---

## 🔑 Key Technologies

- **Expo SDK 54** - Latest Expo framework
- **React 19** - Latest React with compiler
- **React Native 0.81.5** - Native platform
- **Expo Router 6** - File-based routing
- **TypeScript 5.9** - Type safety
- **Supabase** - Backend and authentication
- **Android SDK 35** - Android 15 target

---

## 🚀 Building for Production

### Android APK (Debug)

```bash
# Build debug APK
pnpm run android --variant=debug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Android AAB (Release)

```bash
# Configure signing in android/app/build.gradle first
# Then build release bundle
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### EAS Build (Recommended for Production)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Mac or EAS cloud build)
eas build --platform ios
```

---

## 💡 Pro Tips

1. **Use Expo Go for rapid UI development** - No build time, instant refresh
2. **Keep a development build installed** - For testing native features
3. **Use `adb` commands** - Faster than Android Studio for many tasks
4. **Hot reload is your friend** - Most changes don't require rebuild
5. **Test on real devices** - Emulators can behave differently
6. **Version control native changes** - Track changes in `android/` folder
7. **Use EAS for production builds** - Easier than local builds
8. **Keep Android SDK updated** - Run `sdkmanager --update` periodically

---

## 📚 Useful Commands Reference

```bash
# Development
pnpm start                    # Start Expo dev server
pnpm run android             # Build and run on Android
pnpm run web                 # Start web version
expo start -c                # Start with cache cleared

# Device Management
adb devices                  # List connected devices
adb logcat                   # View device logs
adb shell                    # Access device shell
adb install app.apk          # Install APK

# Emulator
emulator -list-avds          # List emulators
emulator -avd <name>         # Start emulator
adb emu kill                 # Stop emulator

# SDK Management
sdkmanager --list            # List available packages
sdkmanager --update          # Update SDK
sdkmanager --install <pkg>   # Install package

# Build
./gradlew clean              # Clean Android build
./gradlew assembleDebug      # Build debug APK
./gradlew bundleRelease      # Build release AAB

# Troubleshooting
adb kill-server              # Restart ADB
adb start-server
expo doctor                  # Check for issues
pnpm install                 # Reinstall dependencies
```

---

## 🔗 Useful Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Android Developer Docs](https://developer.android.com/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Supabase Docs](https://supabase.com/docs)

---

## 🎯 Summary: Your PC Development Workflow

1. **Daily Development:**
   - Use Expo Go for quick UI changes
   - Use development build for feature testing
   - Hot reload for instant feedback

2. **When to Rebuild:**
   - Added new native dependencies
   - Changed `app.json` configuration
   - Modified Android native code
   - Updated Expo SDK version

3. **When You Need Mac:**
   - Final iOS testing before release
   - iOS-specific bug fixes
   - App Store submissions
   - TestFlight builds

**Bottom Line:** You can do 95% of your development on PC, only needing Mac for final iOS builds and testing.
