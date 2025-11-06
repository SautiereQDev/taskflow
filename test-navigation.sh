#!/bin/bash

# Navigation Test Script
# Tests all major routes of the TaskFlow application

BASE_URL="http://localhost:3000"
FAILED=0
PASSED=0

echo "🧪 Testing TaskFlow Navigation..."
echo "================================"
echo ""

# Function to test a URL
test_url() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}

    echo -n "Testing $description... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")

    if [ "$response" = "$expected_status" ]; then
        echo "✅ PASS ($response)"
        ((PASSED++))
    else
        echo "❌ FAIL (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

# Public pages
echo "📄 Public Pages"
echo "---------------"
test_url "/" "Home page" 200
test_url "/health" "Health check" 200
test_url "/auth/login" "Login page" 200
test_url "/auth/register" "Register page" 200
echo ""

# Protected pages (should redirect to login or return 401/302)
echo "🔒 Protected Pages (requires auth)"
echo "----------------------------------"
test_url "/dashboard" "Dashboard" 302
test_url "/tasks" "Tasks list" 302
test_url "/profile" "User profile" 302
test_url "/settings" "User settings" 302
echo ""

# Non-existent pages
echo "❓ Error Pages"
echo "--------------"
test_url "/nonexistent" "404 page" 404
echo ""

# Results
echo "================================"
echo "Test Results:"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some tests failed!"
    exit 1
else
    echo "🎉 All tests passed!"
    exit 0
fi
