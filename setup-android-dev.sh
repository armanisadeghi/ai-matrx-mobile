#!/bin/bash
# Android Development Environment Setup for WSL2
# Run this script to set up Android development on your PC

set -e

echo "=========================================="
echo "AI Matrx Mobile - Android Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install prerequisites and Java JDK 17
echo -e "${YELLOW}Step 1: Installing prerequisites and Java JDK 17...${NC}"

# Install unzip and wget if not already installed
if ! command -v unzip &> /dev/null || ! command -v wget &> /dev/null; then
    echo "Installing required tools (unzip, wget)..."
    sudo apt update
    sudo apt install -y unzip wget
fi

if command -v java &> /dev/null; then
    echo -e "${GREEN}Java is already installed:${NC}"
    java -version
else
    sudo apt update
    sudo apt install -y openjdk-17-jdk
    echo -e "${GREEN}Java JDK 17 installed successfully!${NC}"
fi
echo ""

# Step 2: Download and install Android Command Line Tools
echo -e "${YELLOW}Step 2: Installing Android SDK Command Line Tools...${NC}"
ANDROID_SDK_ROOT="$HOME/Android/Sdk"
CMDLINE_TOOLS_DIR="$ANDROID_SDK_ROOT/cmdline-tools"

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
    mkdir -p "$CMDLINE_TOOLS_DIR"
    
    # Download latest command line tools
    cd /tmp
    CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    echo "Downloading Android Command Line Tools..."
    wget -q --show-progress "$CMDLINE_TOOLS_URL" -O commandlinetools.zip
    
    # Extract to correct location
    unzip -q commandlinetools.zip
    mkdir -p "$CMDLINE_TOOLS_DIR/latest"
    mv cmdline-tools/* "$CMDLINE_TOOLS_DIR/latest/"
    rm -rf cmdline-tools commandlinetools.zip
    
    echo -e "${GREEN}Android Command Line Tools installed!${NC}"
else
    echo -e "${GREEN}Android SDK directory already exists${NC}"
fi
echo ""

# Step 3: Set up environment variables
echo -e "${YELLOW}Step 3: Configuring environment variables...${NC}"

# Check if already configured
if grep -q "ANDROID_HOME" ~/.bashrc; then
    echo -e "${GREEN}Environment variables already configured in .bashrc${NC}"
else
    cat >> ~/.bashrc << 'EOF'

# Android SDK Environment Variables
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/build-tools/35.0.0
EOF
    echo -e "${GREEN}Environment variables added to .bashrc${NC}"
fi

# Load the environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/build-tools/35.0.0

echo ""

# Step 4: Install Android SDK packages
echo -e "${YELLOW}Step 4: Installing Android SDK packages...${NC}"
echo "This will install:"
echo "  - Android SDK Platform 35 (Android 15)"
echo "  - Android SDK Platform 34 (Android 14)"
echo "  - Build Tools 35.0.0"
echo "  - Platform Tools (ADB, fastboot)"
echo "  - Emulator"
echo ""

# Accept licenses
yes | sdkmanager --licenses > /dev/null 2>&1 || true

# Install required packages
sdkmanager --install \
    "platform-tools" \
    "platforms;android-35" \
    "platforms;android-34" \
    "build-tools;35.0.0" \
    "build-tools;34.0.0" \
    "emulator" \
    "system-images;android-35;google_apis;x86_64" \
    "cmdline-tools;latest"

echo -e "${GREEN}Android SDK packages installed successfully!${NC}"
echo ""

# Step 5: Verify installation
echo -e "${YELLOW}Step 5: Verifying installation...${NC}"
echo ""
echo "Java version:"
java -version
echo ""
echo "Android SDK location: $ANDROID_HOME"
echo ""
echo "ADB version:"
adb --version
echo ""
echo "Installed Android platforms:"
sdkmanager --list_installed | grep "platforms;"
echo ""

echo -e "${GREEN}=========================================="
echo "Setup completed successfully!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Run the following command to reload your shell:${NC}"
echo "  source ~/.bashrc"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Install project dependencies: cd ~/ai-matrx-mobile && pnpm install"
echo "2. Start Expo dev server: pnpm start"
echo "3. Connect your Android device via USB or use Expo Go app"
echo "4. For building APK: pnpm run android"
echo ""
echo -e "${YELLOW}To create an Android emulator (optional):${NC}"
echo "  avdmanager create avd -n Pixel_8_API_35 -k 'system-images;android-35;google_apis;x86_64' -d pixel_8"
echo "  emulator -avd Pixel_8_API_35"
echo ""
