#!/bin/bash

# Default values
WS_URL="${WS_URL:-http://localhost:3003}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --ws-url)
      WS_URL="$2"
      shift 2
      ;;
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
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set environment variables
export MCP_WS_URL="$WS_URL"
export MCP_BASE_URL="$BASE_URL"
export MCP_EMAIL="$EMAIL"
export MCP_PASSWORD="$PASSWORD"

# Run the TypeScript test script
npx tsx ../../scripts/test-tool-ws.ts
