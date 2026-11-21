#!/bin/bash
set -e

echo "=========================================================="
echo "    CarMediaHub - Apple CarPlay IPA Build Generator       "
echo "=========================================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "[1/4] Installing CocoaPods dependencies..."
pod install

echo "[2/4] Archiving Xcode Project for Generic iOS Device..."
rm -rf build
mkdir -p build

xcodebuild archive \
  -workspace CarMediaHub.xcworkspace \
  -scheme CarMediaHub \
  -configuration Release \
  -archivePath build/CarMediaHub.xcarchive \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO

echo "[3/4] Packaging .ipa payload..."
mkdir -p build/Payload
cp -r build/CarMediaHub.xcarchive/Products/Applications/CarMediaHub.app build/Payload/
cd build
zip -qr CarMediaHub-CarPlay.ipa Payload

echo "[4/4] Done! Output IPA generated at:"
echo "$SCRIPT_DIR/build/CarMediaHub-CarPlay.ipa"
