# AI Matrx Mobile

An intelligent mobile assistant built with Expo, React Native, and Supabase.

## 📱 Tech Stack

- **Expo SDK 54** - Latest Expo framework
- **React 19** - Latest React with compiler
- **React Native 0.81.5** - Cross-platform mobile
- **Expo Router 6** - File-based routing
- **TypeScript 5.9** - Type safety
- **Supabase** - Backend and authentication

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
# Create .env file with Supabase credentials (see ENVIRONMENT-SETUP.md)

# 3. Start development server
pnpm start
```

## 🚀 Running & Testing

### Development Server (Expo Go)

```bash
# Start metro bundler
pnpm start

# Start with cache cleared
npx expo start -c
```

Then scan QR code with Expo Go app on your phone.

### iOS Development Builds

```bash
# Run on iOS simulator
npx expo run:ios

# Run on physical iOS device (via Xcode)
npx expo run:ios --device

# Specify device
npx expo run:ios --device [device-name]
```

### Android Development Builds

```bash
# Run on Android emulator or connected device
npx expo run:android

# Run on specific device
npx expo run:android --device [device-id]

# List connected devices
adb devices
```

### Web Preview (Limited Functionality)

```bash
npx expo start --web
```

## 🛠️ Useful Commands

```bash
# Build Management
npx expo prebuild --clean        # Regenerate native folders
npx expo install --check         # Check for package updates

# Device Management
adb devices                      # List Android devices
adb logcat                       # View Android logs
adb logcat -c                    # Clear Android logs
xcrun simctl list devices        # List iOS simulators

# Debugging
npx expo start --dev-client      # Start with dev client
npx react-devtools               # Open React DevTools

# Maintenance
pnpm install                     # Install dependencies
npx expo doctor                  # Check for issues
pnpm lint                        # Run linter
```

## 🐛 Troubleshooting

```bash
# Clear cache and restart
npx expo start -c

# Reset everything
rm -rf node_modules .expo ios android
pnpm install
npx expo prebuild --clean

# Fix ADB issues
adb kill-server && adb start-server && adb devices

# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 🏗️ Production Builds

### EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
eas build --platform all
```

### Local Production Builds

```bash
# Android APK
npx expo run:android --variant release

# iOS (Mac only)
npx expo run:ios --configuration Release
```

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase Docs](https://supabase.com/docs)
- **[ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)** - Environment variables

---

**License:** Private - All rights reserved.
