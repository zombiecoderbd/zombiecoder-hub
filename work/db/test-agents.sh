#!/bin/bash

# ============================================================================
# ZombieCoder Hub v2.0 - Agent Testing Script
# ============================================================================

BASE_URL="http://localhost:3000"
EMAIL="admin@zombiecoder.local"
PASSWORD="admin123"

echo "=========================================="
echo "  ZombieCoder Hub - Agent Testing"
echo "=========================================="
echo ""

# Login
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed!"
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Create Session
echo "📝 Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "agentId": "editor-agent-001",
    "agentName": "ZombieCoder Editor Agent"
  }')

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.sessionId')

if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
    echo "❌ Session creation failed!"
    echo "$SESSION_RESPONSE" | jq .
    exit 1
fi

echo "✅ Session created: $SESSION_ID"
echo ""

# Test 1: Simple Question
echo "=========================================="
echo "TEST 1: Simple Greeting"
echo "=========================================="
RESPONSE1=$(curl -s -X POST "$BASE_URL/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"message\": \"Hello! Introduce yourself in 2 sentences.\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE1" | jq '{
  success: .success,
  has_response: (.data.response != null and .data.response != ""),
  model_used: .data.model,
  response_length: (.data.response | length // 0)
}'
echo ""

# Test 2: Code Generation
echo "=========================================="
echo "TEST 2: Code Generation (Python)"
echo "=========================================="
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"message\": \"Write a Python function to calculate factorial of a number\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE2" | jq '{
  success: .success,
  has_response: (.data.response != null and .data.response != ""),
  model_used: .data.model,
  response_length: (.data.response | length // 0),
  preview: (.data.response[0:150] // "No response")
}'
echo ""

# Test 3: Mathematical Question
echo "=========================================="
echo "TEST 3: Math Problem"
echo "=========================================="
RESPONSE3=$(curl -s -X POST "$BASE_URL/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"message\": \"What is 25 * 48 + 100? Show your work.\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE3" | jq '{
  success: .success,
  has_response: (.data.response != null and .data.response != ""),
  model_used: .data.model,
  response_length: (.data.response | length // 0)
}'
echo ""

# Test 4: Explanation Request
echo "=========================================="
echo "TEST 4: Concept Explanation"
echo "=========================================="
RESPONSE4=$(curl -s -X POST "$BASE_URL/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"message\": \"Explain what an API is in simple terms\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE4" | jq '{
  success: .success,
  has_response: (.data.response != null and .data.response != ""),
  model_used: .data.model,
  response_length: (.data.response | length // 0)
}'
echo ""

# Summary
echo "=========================================="
echo "  TEST SUMMARY"
echo "=========================================="
echo ""
echo "Test 1 (Greeting): $([ $(echo "$RESPONSE1" | jq '.success') = 'true' ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Test 2 (Code Gen): $([ $(echo "$RESPONSE2" | jq '.success') = 'true' ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Test 3 (Math):     $([ $(echo "$RESPONSE3" | jq '.success') = 'true' ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Test 4 (Explain):  $([ $(echo "$RESPONSE4" | jq '.success') = 'true' ] && echo '✅ PASS' || echo '❌ FAIL')"
echo ""
echo "=========================================="
echo "  Agent Testing Complete!"
echo "=========================================="
