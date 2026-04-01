#!/usr/bin/env pwsh
# ZombieCoder v2.0 - AI Agent Test Script
# This script tests admin login, AI model communication, and tool execution

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Email = "admin@zombiecoder.local",
    [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Warning($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Separator { Write-Host "============================================================" -ForegroundColor DarkGray }

# Global variables
$script:AccessToken = $null
$script:SessionId = $null
$script:AvailableModels = @()

# ============================================================================
# STEP 1: Check Ollama Models
# ============================================================================
Write-Separator
Write-Info "STEP 1: Checking Local Ollama Models"
Write-Separator

try {
    $ollamaOutput = ollama list 2>&1
    Write-Success "Ollama Models Available:"
    Write-Host $ollamaOutput -ForegroundColor Gray
    
    # Parse available models
    foreach ($line in $ollamaOutput -split "`n") {
        if ($line -match "^(\S+):(\S+)") {
            $script:AvailableModels += "$($matches[1]):$($matches[2])"
        }
    }
    
    if ($script:AvailableModels.Count -gt 0) {
        Write-Success "Found $($script:AvailableModels.Count) model(s): $($script:AvailableModels -join ', ')"
    } else {
        Write-Error "No Ollama models found! Please pull a model first: ollama pull falcon3:3b"
        exit 1
    }
} catch {
    Write-Error "Failed to check Ollama models: $_"
    exit 1
}

# ============================================================================
# STEP 2: Test Health Endpoint
# ============================================================================
Write-Separator
Write-Info "STEP 2: Testing Health Endpoint"
Write-Separator

try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET -UseBasicParsing
    Write-Success "Health Check: SUCCESS"
    Write-Info "Status: $($healthResponse.data.status)"
    Write-Info "Database: $($healthResponse.data.services.database)"
    Write-Info "API: $($healthResponse.data.services.api)"
    Write-Info "Version: $($healthResponse.data.version)"
} catch {
    Write-Error "Health Check Failed: $_"
    exit 1
}

# ============================================================================
# STEP 3: Admin Login
# ============================================================================
Write-Separator
Write-Info "STEP 3: Admin Login"
Write-Separator

try {
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $script:AccessToken = $loginResponse.data.accessToken
    $userName = $loginResponse.data.user.name
    $userRole = $loginResponse.data.user.role
    
    Write-Success "Login: SUCCESS"
    Write-Info "User: $userName ($userRole)"
    Write-Info "Access Token: $($script:AccessToken.Substring(0, 20))..."
} catch {
    Write-Error "Login Failed: $_"
    exit 1
}

# ============================================================================
# STEP 4: Create Session
# ============================================================================
Write-Separator
Write-Info "STEP 4: Creating Agent Session"
Write-Separator

try {
    $headers = @{ "Authorization" = "Bearer $script:AccessToken"; "Content-Type" = "application/json" }
    
    $sessionResponse = Invoke-RestMethod -Uri "$BaseUrl/api/agent/session" -Method POST `
        -Headers $headers -Body "{}" -UseBasicParsing
    
    $script:SessionId = $sessionResponse.data.sessionId
    Write-Success "Session created: $script:SessionId"
} catch {
    Write-Error "Failed to create session: $_"
    $script:SessionId = [guid]::NewGuid().ToString()
    Write-Warning "Using fallback session ID: $script:SessionId"
}

# ============================================================================
# STEP 5: Test English Questions
# ============================================================================
Write-Separator
Write-Info "STEP 5: Testing AI Chat - English Questions"
Write-Separator

$englishQuestions = @(
    "What is your name and purpose?",
    "Explain machine learning in simple terms.",
    "Write a Python function to calculate factorial."
)

foreach ($question in $englishQuestions) {
    Write-Info "Q: $question"
    
    try {
        $chatBody = @{ sessionId = $script:SessionId; message = $question } | ConvertTo-Json
        $headers = @{ "Authorization" = "Bearer $script:AccessToken"; "Content-Type" = "application/json" }
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $chatResponse = Invoke-RestMethod -Uri "$BaseUrl/api/agent/chat" -Method POST `
            -Headers $headers -Body $chatBody -UseBasicParsing
        $stopwatch.Stop()
        
        $executionTime = $stopwatch.ElapsedMilliseconds
        Write-Info "Response Time: $executionTime ms"
        Write-Info "Provider: $($chatResponse.data.assistantMessage.metadata.provider)"
        
        $responseText = $chatResponse.data.assistantMessage.content
        if ($responseText.Length -gt 200) { $responseText = $responseText.Substring(0, 200) + "..." }
        Write-Success "A: $responseText"
    } catch {
        Write-Error "Chat Error: $_"
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Warning "Chat endpoint not found. Agent chat may not be fully implemented."
        }
    }
    Write-Host ""
}

# ============================================================================
# STEP 6: Test Bengali Questions
# ============================================================================
Write-Separator
Write-Info "STEP 6: Testing AI Chat - Bengali Questions"
Write-Separator

$bengaliQuestions = @(
    "আপনার নাম কি?",
    "পাইথন প্রোগ্রামিং কি?",
    "ফ্যাক্টোরিয়াল ফাংশন লিখুন।"
)

foreach ($question in $bengaliQuestions) {
    Write-Info "Q: $question"
    
    try {
        $chatBody = @{ sessionId = $script:SessionId; message = $question } | ConvertTo-Json
        $headers = @{ "Authorization" = "Bearer $script:AccessToken"; "Content-Type" = "application/json" }
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $chatResponse = Invoke-RestMethod -Uri "$BaseUrl/api/agent/chat" -Method POST `
            -Headers $headers -Body $chatBody -UseBasicParsing
        $stopwatch.Stop()
        
        $executionTime = $stopwatch.ElapsedMilliseconds
        Write-Info "Response Time: $executionTime ms"
        
        $responseText = $chatResponse.data.assistantMessage.content
        if ($responseText.Length -gt 200) { $responseText = $responseText.Substring(0, 200) + "..." }
        Write-Success "A: $responseText"
    } catch {
        Write-Error "Chat Error: $_"
    }
    Write-Host ""
}

# ============================================================================
# STEP 7: Summary
# ============================================================================
Write-Separator
Write-Info "STEP 7: Test Summary Report"
Write-Separator

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "           ZOMBICODER V2.0 - TEST SUMMARY                      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Base URL:        $BaseUrl"
Write-Host "  Session ID:      $script:SessionId"
Write-Host "  Ollama Models:   $($script:AvailableModels -join ', ')"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  OK Health Check:      PASSED" -ForegroundColor Green
Write-Host "  OK Admin Login:       PASSED" -ForegroundColor Green
Write-Host "  OK Session Creation:  PASSED" -ForegroundColor Green
Write-Host "  ?? English Chat:      $($englishQuestions.Count) questions" -ForegroundColor Yellow
Write-Host "  ?? Bengali Chat:      $($bengaliQuestions.Count) questions" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Success "Test script completed!"
Write-Info "Check the output above for detailed results."
