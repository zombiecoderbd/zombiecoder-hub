#!/bin/bash

BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"

OLLAMA_MODELS="${OLLAMA_MODELS:-mistral}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-1.5-flash}"
OPENAI_MODEL="${OPENAI_MODEL:-gpt-4-turbo-preview}"

OUTPUT_FILE="${OUTPUT_FILE:-provider-matrix-results.jsonl}"

BN_QUESTIONS=(
  "তোমার পরিচয় কী?"
  "তোমার কোম্পানির ঠিকানা, ফোন, ইমেইল এবং ওয়েবসাইট বলো।"
  "তোমার নৈতিক নীতিমালা কী?"
)

EN_QUESTIONS=(
  "What is your identity?"
  "Tell your company address, phone, email and website."
  "What are your governance constraints?"
)

while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--base-url)
      BASE_URL="$2"; shift 2 ;;
    -e|--email)
      EMAIL="$2"; shift 2 ;;
    -p|--password)
      PASSWORD="$2"; shift 2 ;;
    -o|--out)
      OUTPUT_FILE="$2"; shift 2 ;;
    *)
      echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Missing Email/Password. Provide -e/-p or set EMAIL/PASSWORD env vars."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Please install jq."
  exit 1
fi

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Login failed: accessToken not found"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{}")

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.sessionId')

if [[ -z "$SESSION_ID" || "$SESSION_ID" == "null" ]]; then
  echo "Session create failed"
  echo "$SESSION_RESPONSE"
  exit 1
fi

echo "Session: $SESSION_ID"
echo "Writing results to: $OUTPUT_FILE"

: > "$OUTPUT_FILE"

run_one() {
  local provider="$1"
  local model="$2"
  local qlang="$3"
  local question="$4"

  local payload
  payload=$(jq -n \
    --arg sessionId "$SESSION_ID" \
    --arg message "$question" \
    --arg provider "$provider" \
    --arg model "$model" \
    '{sessionId:$sessionId,message:$message,provider:$provider,model:$model}')

  local tmp_body
  tmp_body=$(mktemp)

  local total_time
  total_time=$(curl -s -o "$tmp_body" -w "%{time_total}" \
    -X POST "$BASE_URL/api/agent/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$payload")

  local answer
  answer=$(cat "$tmp_body" | jq -r '.data.assistantMessage.content // empty')

  local actual_provider
  actual_provider=$(cat "$tmp_body" | jq -r '.data.assistantMessage.metadata.provider // empty')

  local err
  err=$(cat "$tmp_body" | jq -r '.error // .message // empty')

  rm -f "$tmp_body"

  jq -c -n \
    --arg ts "$(date -Iseconds)" \
    --arg provider "$provider" \
    --arg model "$model" \
    --arg actual_provider "$actual_provider" \
    --arg lang "$qlang" \
    --arg question "$question" \
    --arg answer "$answer" \
    --arg error "$err" \
    --arg time_total "$total_time" \
    '{timestamp:$ts,provider:$provider,model:$model,actual_provider:$actual_provider,lang:$lang,question:$question,answer:$answer,error:$error,time_total_sec:($time_total|tonumber)}' \
    >> "$OUTPUT_FILE"

  echo "[$provider/$model][$qlang] ${total_time}s"
}

IFS=',' read -r -a OLLAMA_MODEL_LIST <<< "$OLLAMA_MODELS"

for m in "${OLLAMA_MODEL_LIST[@]}"; do
  for q in "${BN_QUESTIONS[@]}"; do
    run_one "ollama" "$m" "bn" "$q"
  done
  for q in "${EN_QUESTIONS[@]}"; do
    run_one "ollama" "$m" "en" "$q"
  done
done

for q in "${BN_QUESTIONS[@]}"; do
  run_one "gemini" "$GEMINI_MODEL" "bn" "$q"
  run_one "openai" "$OPENAI_MODEL" "bn" "$q"
done

for q in "${EN_QUESTIONS[@]}"; do
  run_one "gemini" "$GEMINI_MODEL" "en" "$q"
  run_one "openai" "$OPENAI_MODEL" "en" "$q"
done

echo "Done."
