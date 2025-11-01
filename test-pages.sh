#!/bin/bash
echo "Testing pages accessibility..."
COOKIE=$(curl -s -c - -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=manager@example.com&password=admin123" | grep sessionId | awk '{print $7}')

echo "Cookie: $COOKIE"
echo ""

pages=(
  "/"
  "/dashboard"
  "/tasks"
  "/tasks/new"
  "/users"
  "/profile"
)

for page in "${pages[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -b "sessionId=$COOKIE" http://localhost:3000$page)
  echo "$page: $status"
done
