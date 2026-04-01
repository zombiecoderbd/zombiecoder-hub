#!/bin/bash

# Default values
BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"
TYPING_DELAY_MS="${TYPING_DELAY_MS:-12}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--base-url)
      BASE_URL="$2"
      shift 2
      ;;
    -e|--email)
      EMAIL="$2"
      shift 2
      ;;
    -p|--password)
      PASSWORD="$2"
      shift 2
      ;;
    -d|--delay)
      TYPING_DELAY_MS="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check credentials
if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Missing Email/Password. Provide -e/-p or set EMAIL/PASSWORD env vars."
  exit 1
fi

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Login failed: accessToken not found"
  exit 1
fi

# Create session
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{}")

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.sessionId')

echo "Session: $SESSION_ID"
echo "Type a question and press Enter. Type 'exit' to stop."

# Chat loop
while true; do
  read -p "You> " question
  
  if [[ "$question" == "exit" ]]; then
    break
  fi
  
  if [[ -z "${question// }" ]]; then
    continue
  fi
  
  echo -e "\e[90mAgent: Thinking...\e[0m"
  
  CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"$question\"}")
  
  ANSWER=$(echo "$CHAT_RESPONSE" | jq -r '.data.assistantMessage.content')
  
  echo -ne "\e[32mAgent:\e[0m "
  
  # Typing effect
  for (( i=0; i<${#ANSWER}; i++ )); do
    echo -n "${ANSWER:$i:1}"
    sleep 0.0$TYPING_DELAY_MS
  done
  echo ""
done

echo "Done."
