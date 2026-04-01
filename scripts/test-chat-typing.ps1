param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Email = $env:MCP_EMAIL,
  [string]$Password = $env:MCP_PASSWORD,
  [int]$TypingDelayMs = 12
)

function Write-Typing([string]$Text, [int]$DelayMs) {
  $chars = $Text.ToCharArray()
  foreach ($c in $chars) {
    Write-Host -NoNewline $c
    Start-Sleep -Milliseconds $DelayMs
  }
  Write-Host ""
}

if (-not $Email -or -not $Password) {
  throw "Missing Email/Password. Provide -Email/-Password or set MCP_EMAIL/MCP_PASSWORD env vars."
}

$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
$token = $login.data.accessToken

if (-not $token) { throw "Login failed: accessToken not found" }

$headers = @{ Authorization = "Bearer $token" }

$session = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/agent/session" -Headers $headers -ContentType "application/json" -Body "{}"
$sessionId = $session.data.sessionId

Write-Host "Session: $sessionId" -ForegroundColor Cyan
Write-Host "Type a question and press Enter. Type 'exit' to stop." -ForegroundColor Yellow

while ($true) {
  $q = Read-Host "You"
  if ($q -eq "exit") { break }
  if (-not $q.Trim()) { continue }

  Write-Host "Agent: Thinking..." -ForegroundColor DarkGray

  $body = @{ sessionId = $sessionId; message = $q } | ConvertTo-Json
  $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/agent/chat" -Headers $headers -ContentType "application/json" -Body $body

  $answer = $resp.data.assistantMessage.content
  Write-Host "Agent:" -NoNewline -ForegroundColor Green
  Write-Host " " -NoNewline
  Write-Typing -Text $answer -DelayMs $TypingDelayMs
}

Write-Host "Done." -ForegroundColor Cyan
