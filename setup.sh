#!/bin/bash
# Run this once to install Puppeteer system dependencies (required for PDF export)
# Usage: bash setup.sh

set -e

echo "Installing Puppeteer system dependencies..."
sudo apt-get update -y
sudo apt-get install -y libnss3 libnspr4 libasound2

echo ""
echo "Done! You can now run: npm run dev"
