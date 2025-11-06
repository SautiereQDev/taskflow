#!/bin/bash

# TaskFlow Frontend Verification Script
# Vérifie que tous les composants frontend sont correctement configurés

set -e

echo "🔍 TaskFlow Frontend Verification"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Check CSS files
echo "📦 Checking CSS files..."
if [ -f "public/css/output.css" ]; then
    SIZE=$(du -h public/css/output.css | cut -f1)
    check_pass "CSS generated (size: $SIZE)"
else
    check_fail "CSS not found. Run: npm run css:build"
fi

if [ -f "public/css/tailwind.css" ]; then
    check_pass "Tailwind source file exists"
else
    check_fail "Tailwind source file missing"
fi

echo ""

# 2. Check EJS templates
echo "📄 Checking EJS templates..."
if [ -d "views" ]; then
    TEMPLATE_COUNT=$(find views -name "*.ejs" | wc -l)
    check_pass "Found $TEMPLATE_COUNT EJS templates"

    # Check critical templates
    if [ -f "views/layouts/main.ejs" ]; then
        check_pass "Main layout exists"
    else
        check_fail "Main layout missing"
    fi

    if [ -f "views/partials/head.ejs" ]; then
        check_pass "Head partial exists"
    else
        check_fail "Head partial missing"
    fi

    if [ -f "views/pages/tasks/list.ejs" ]; then
        check_pass "Task list page exists"
    else
        check_fail "Task list page missing"
    fi
else
    check_fail "Views directory not found"
fi

echo ""

# 3. Check JavaScript files
echo "📜 Checking JavaScript files..."
if [ -f "public/js/alpine-components.js" ]; then
    check_pass "Alpine components file exists"
else
    check_fail "Alpine components file missing"
fi

if [ -f "public/js/theme-init.js" ]; then
    check_pass "Theme init file exists"
else
    check_fail "Theme init file missing"
fi

echo ""

# 4. Check Express configuration
echo "⚙️  Checking Express configuration..."
if [ -f "src/config/express.config.ts" ]; then
    check_pass "Express config file exists"

    # Check for static files middleware
    if grep -q "express.static" src/config/express.config.ts; then
        check_pass "Static files middleware configured"
    else
        check_fail "Static files middleware not found"
    fi

    # Check for EJS view engine
    if grep -q "view engine.*ejs" src/config/express.config.ts; then
        check_pass "EJS view engine configured"
    else
        check_fail "EJS view engine not configured"
    fi
else
    check_fail "Express config file not found"
fi

echo ""

# 5. Check HTMX in layout
echo "🔌 Checking HTMX integration..."
if [ -f "views/layouts/main.ejs" ]; then
    if grep -q "htmx.org" views/layouts/main.ejs; then
        check_pass "HTMX loaded in layout"
    else
        check_fail "HTMX not loaded in layout"
    fi
else
    check_fail "Cannot verify HTMX (layout missing)"
fi

echo ""

# 6. Check Alpine.js in layout
echo "🏔️  Checking Alpine.js integration..."
if [ -f "views/layouts/main.ejs" ]; then
    if grep -q "alpinejs" views/layouts/main.ejs; then
        check_pass "Alpine.js loaded in layout"
    else
        check_fail "Alpine.js not loaded in layout"
    fi
else
    check_fail "Cannot verify Alpine.js (layout missing)"
fi

echo ""

# 7. Check server is running
echo "🌐 Checking server status..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
    check_pass "Server is running on port 3001"

    # Check if CSS is accessible
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/css/output.css | grep -q "200"; then
        check_pass "CSS file is accessible via HTTP"
    else
        check_fail "CSS file not accessible (404 or 500)"
    fi
else
    check_warn "Server is not running. Start with: npm run dev"
fi

echo ""

# 8. Check dependencies
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    check_pass "Node modules installed"

    # Check critical dependencies
    if [ -d "node_modules/express" ]; then
        check_pass "Express installed"
    else
        check_fail "Express not installed"
    fi

    if [ -d "node_modules/ejs" ]; then
        check_pass "EJS installed"
    else
        check_fail "EJS not installed"
    fi

    if [ -d "node_modules/tailwindcss" ]; then
        check_pass "Tailwind CSS installed"
    else
        check_fail "Tailwind CSS not installed"
    fi
else
    check_fail "Node modules not installed. Run: npm install"
fi

echo ""

# 9. Check environment file
echo "🔐 Checking environment configuration..."
if [ -f ".env" ]; then
    check_pass ".env file exists"

    if grep -q "PORT=" .env; then
        PORT=$(grep "PORT=" .env | cut -d '=' -f2)
        check_pass "PORT configured: $PORT"
    else
        check_warn "PORT not configured in .env"
    fi

    if grep -q "HOST=" .env; then
        HOST=$(grep "HOST=" .env | cut -d '=' -f2)
        check_pass "HOST configured: $HOST"
    else
        check_warn "HOST not configured in .env"
    fi
else
    check_fail ".env file not found"
fi

echo ""

# Summary
echo "=================================="
echo "📊 SUMMARY"
echo "=================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your frontend is properly configured."
    echo ""
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: You have $WARNINGS warning(s). These are not critical but should be addressed.${NC}"
        echo ""
    fi
    echo "To start the application:"
    echo "  1. docker compose up -d"
    echo "  2. npm run dev"
    echo "  3. Open http://localhost:3001"
    exit 0
else
    echo -e "${RED}❌ Some checks failed!${NC}"
    echo ""
    echo "Please fix the errors above before starting the application."
    echo ""
    echo "Common fixes:"
    echo "  - Missing CSS: npm run css:build"
    echo "  - Missing dependencies: npm install"
    echo "  - Server not running: npm run dev"
    exit 1
fi
