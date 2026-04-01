param(
  [string]$WsUrl = "http://localhost:3003",
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Email = $env:MCP_EMAIL,
  [string]$Password = $env:MCP_PASSWORD
)

if (-not $Email) { $Email = "admin@zombiecoder.local" }
if (-not $Password) { $Password = "admin123" }

$env:MCP_WS_URL = $WsUrl
$env:MCP_BASE_URL = $BaseUrl
$env:MCP_EMAIL = $Email
$env:MCP_PASSWORD = $Password

npx tsx scripts/test-tool-ws.ts
