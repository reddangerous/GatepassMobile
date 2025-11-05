#!/bin/bash

# GatePass Mobile - WSL Build Script for Production Testing
# Quick script to build and deploy your app from WSL

set -e

echo "🚀 GatePass Mobile - WSL Build Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Navigate to project
echo -e "${BLUE}[1/6] Navigating to project...${NC}"
cd /mnt/d/StaffGP/GatepassMobile
echo -e "${GREEN}✓ In directory: $(pwd)${NC}"

# Step 2: Clean install
echo -e "${BLUE}[2/6] Cleaning and installing dependencies...${NC}"
rm -rf node_modules package-lock.json
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Verify config
echo -e "${BLUE}[3/6] Verifying configuration...${NC}"
API_URL=$(cat app.json | grep -o '"apiUrl":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ API URL: $API_URL${NC}"

# Step 4: Check backend
echo -e "${BLUE}[4/6] Checking backend health...${NC}"
if curl -s http://192.168.1.106:3005/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠ Backend might not be running at http://192.168.1.106:3005${NC}"
    echo "   Make sure PM2 backend is running: pm2 status"
fi

# Step 5: Build options
echo -e "${BLUE}[5/6] Select build option:${NC}"
echo "1) Local dev test (npm start)"
echo "2) EAS preview build (production-like)"
echo "3) EAS production build (full release)"
read -p "Choose option (1-3): " build_option

case $build_option in
    1)
        echo -e "${YELLOW}Starting local dev server...${NC}"
        npm run start
        ;;
    2)
        echo -e "${YELLOW}Building preview for EAS...${NC}"
       
        eas build --platform android --profile preview
        echo -e "${GREEN}✓ Build submitted! Check https://expo.dev${NC}"
        ;;
    3)
        echo -e "${YELLOW}Building production release...${NC}"
       
        eas build --platform android --profile production
        echo -e "${GREEN}✓ Production build submitted! Check https://expo.dev${NC}"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Build script completed!${NC}"
