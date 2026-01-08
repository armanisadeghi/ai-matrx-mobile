# AI Matrx Mobile

An intelligent mobile assistant built with Expo, React Native, and Supabase.

## 📱 Tech Stack

- **Expo SDK 54** - Latest Expo framework
- **React 19** - Latest React with compiler
- **React Native 0.81.5** - Cross-platform mobile
- **Expo Router 6** - File-based routing
- **TypeScript 5.9** - Type safety
- **Supabase** - Backend and authentication
- **Android SDK 35** - Android 15 target

## ⚡ Quick Start

### For PC Development (WSL2)

```bash
# 1. Run setup script
./setup-android-dev.sh

# 2. Reload shell
source ~/.bashrc

# 3. Install dependencies
pnpm install

# 4. Configure environment (see ENVIRONMENT-SETUP.md)
# Create .env file with Supabase credentials

# 5. Start development
pnpm start
```

### For Mac Development

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment (see ENVIRONMENT-SETUP.md)
# Create .env file with Supabase credentials

# 3. Start development
pnpm start
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[START-HERE.md](START-HERE.md)** | 👈 **Start here!** Quick overview |
| **[SETUP-COMMANDS.txt](SETUP-COMMANDS.txt)** | Step-by-step setup commands |
| **[QUICK-START.md](QUICK-START.md)** | Quick reference guide |
| **[PC-DEVELOPMENT-GUIDE.md](PC-DEVELOPMENT-GUIDE.md)** | Complete PC development guide |
| **[PC-VS-MAC-CAPABILITIES.md](PC-VS-MAC-CAPABILITIES.md)** | Platform comparison |
| **[ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)** | Environment variables setup |

## 🎯 Development Workflows

### Option 1: Expo Go (Recommended for Daily Development)

```bash
pnpm start
```

Then scan QR code with Expo Go app on your phone (Android or iOS).

**Best for:**
- Quick iterations
- UI development
- Testing on multiple devices
- Instant feedback with hot reload

### Option 2: Development Build (For Full Features)

**Android:**
```bash
pnpm run android
```

**iOS (Mac only):**
```bash
pnpm run ios
```

**Best for:**
- Testing native features
- Production-like testing
- Platform-specific debugging

### Option 3: Web Preview

```bash
pnpm run web
```

**Note:** Limited functionality, mainly for UI preview.

## 📁 Project Structure

```
ai-matrx-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   │   ├── chat/          # Chat feature
│   │   ├── explore.tsx    # Explore screen
│   │   ├── index.tsx      # Home screen
│   │   └── settings.tsx   # Settings screen
│   ├── _layout.tsx        # Root layout with providers
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
│   ├── chat/             # Chat components
│   ├── providers/        # Context providers
│   └── ui/               # UI components
├── constants/            # App constants and colors
├── hooks/                # Custom React hooks
├── lib/                  # Libraries and utilities
│   ├── api.ts           # API client
│   ├── permissions.ts   # Permission handling
│   ├── storage.ts       # Local storage
│   └── supabase.ts      # Supabase client
├── types/               # TypeScript types
├── assets/              # Images, fonts, etc.
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## 🔑 Key Features

- 💬 **AI Chat** - Intelligent conversation interface
- 📸 **Camera Integration** - Capture photos and videos
- 🖼️ **Media Library** - Access and manage media
- 🔔 **Push Notifications** - Real-time notifications
- 🔐 **Authentication** - Secure user authentication with Supabase
- 📁 **File Picker** - Document selection and upload
- 🎨 **Dark Mode** - Automatic theme switching
- 🔒 **Biometric Auth** - Face ID / Touch ID support

## 🛠️ Common Commands

```bash
# Development
pnpm start              # Start Expo dev server
pnpm run android        # Build and run on Android
pnpm run ios            # Build and run on iOS (Mac only)
pnpm run web            # Start web version
expo start -c           # Start with cache cleared

# Maintenance
pnpm install            # Install dependencies
expo doctor             # Check for issues
pnpm lint               # Run linter

# Device Management (Android)
adb devices             # List connected devices
adb logcat              # View device logs
```

## 🐛 Troubleshooting

### Metro Bundler Issues

```bash
expo start -c
# or
rm -rf node_modules && pnpm install
```

### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
pnpm run android
```

### Environment Variable Issues

1. Ensure `.env` file exists in project root
2. Check `ENVIRONMENT-SETUP.md` for correct format
3. Restart dev server after changes

### ADB Not Detecting Device

```bash
adb kill-server
adb start-server
adb devices
```

## 📱 Platform Support

| Feature | Android | iOS | Web |
|---------|---------|-----|-----|
| Development | ✅ Full | ✅ Full | ⚠️ Limited |
| Camera | ✅ | ✅ | ❌ |
| Notifications | ✅ | ✅ | ⚠️ |
| Biometric Auth | ✅ | ✅ | ❌ |
| File Picker | ✅ | ✅ | ⚠️ |
| Media Library | ✅ | ✅ | ❌ |

## 🚀 Building for Production

### Android APK

```bash
pnpm run android --variant=release
```

### iOS (Mac only)

```bash
pnpm run ios --configuration=Release
```

### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Private - All rights reserved.
