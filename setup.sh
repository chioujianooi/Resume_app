#!/bin/bash
# Run this once to install Puppeteer system dependencies (required for PDF export)
# Usage: bash setup.sh

set -e

echo "Installing Puppeteer system dependencies..."
sudo apt-get update -y
sudo apt-get install -y libnss3 libnspr4 libasound2

echo "Installing fonts (Liberation Sans — metric-compatible with Arial)..."
if sudo apt-get install -y fonts-liberation 2>/dev/null; then
  echo "  fonts-liberation installed system-wide."
else
  echo "  sudo unavailable — installing Liberation Sans to ~/.fonts instead..."
  mkdir -p ~/.fonts
  apt-get download fonts-liberation 2>/dev/null && \
    dpkg-deb -x fonts-liberation_*.deb /tmp/liberation && \
    cp /tmp/liberation/usr/share/fonts/truetype/liberation/*.ttf ~/.fonts/ && \
    rm -f fonts-liberation_*.deb
  fc-cache -f ~/.fonts
  echo "  Done. fc-match Arial: $(fc-match Arial)"
fi

echo ""
echo "Done! You can now run: npm run dev"
