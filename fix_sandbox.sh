#!/bin/bash
# Fix Xcode sandbox issue by modifying project.pbxproj
PROJECT_FILE="ios/AIMatrx.xcodeproj/project.pbxproj"

# Backup the original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

# Add alwaysOutOfDate = 1 to the Copy Pods Resources script phase
# This disables dependency analysis and should prevent the sandbox issue
perl -i -pe 's/(shellScript = ".*CP.*Copy Pods Resources.*";)/$1\n\t\t\talwaysOutOfDate = 1;/g unless /alwaysOutOfDate/' "$PROJECT_FILE"

echo "Fixed Xcode project sandbox settings"
