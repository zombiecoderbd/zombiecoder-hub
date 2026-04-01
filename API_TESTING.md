# ZombieCoder Hub v2.0 - API Testing Guide

Complete guide for testing all API endpoints using curl, Postman, or other HTTP clients.

---

## Base URL

**Development:** `http://localhost:3000`
**Production:** `https://yourdomain.com`

---

## Authentication Endpoints

### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass@123456",
    "confirmPassword": "SecurePass@123456",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CLIENT",
      "createdAt": "2026-04-01T10:00:00Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

**Password Requirements:**
- Minimum 12 characters
- Uppercase letters (A-Z)
- Lowercase letters (a-z)
- Numbers (0-9)
- Special characters (!@#$%^&*()_+=-[]{};":\|,.<>/?])

---

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zombiecoder.local",
    "password": "ZombieCoder@Admin123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@zombiecoder.local",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

### 3. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

## User Endpoints

### 1. Get User Profile

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CLIENT",
      "isActive": true,
      "createdAt": "2026-04-01T10:00:00Z",
      "updatedAt": "2026-04-01T10:00:00Z",
      "lastLoginAt": "2026-04-01T10:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Missing or invalid authentication token",
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

### 2. Change Password

```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass@123456",
    "newPassword": "NewPass@123456",
    "confirmPassword": "NewPass@123456"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. Please login again."
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

**Validation Error (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "newPassword": [
      "Password must be at least 12 characters long"
    ]
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

## System Endpoints

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Response (200 OK - Healthy):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-01T10:00:00Z",
    "version": "2.0.0",
    "services": {
      "database": "up",
      "api": "up"
    },
    "uptime": 3600
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

**Response (503 Service Unavailable - Database Down):**
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "timestamp": "2026-04-01T10:00:00Z",
    "version": "2.0.0",
    "services": {
      "database": "down",
      "api": "up"
    },
    "uptime": 3600
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

## Response Headers

All API responses include these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Powered-By: ZombieCoder Hub v2.0
X-ZombieCoder-Version: 2.0.0
X-ZombieCoder-Owner: Sahon Srabon
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | User registered |
| 400 | Bad Request | Invalid JSON, missing fields |
| 401 | Unauthorized | Invalid token, no token |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Unexpected error |
| 503 | Service Unavailable | Database down |

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "1617312000000-abcd1234",
    "version": "2.0.0"
  }
}
```

---

## Testing Workflow

### 1. Register a Test User
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass@123456",
    "confirmPassword": "TestPass@123456",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.data.accessToken' -r > /tmp/token.txt
```

### 2. Use Token for Authenticated Requests
```bash
# Save token to variable
TOKEN=$(cat /tmp/token.txt)

# Get profile
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Change password
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass@123456",
    "newPassword": "NewPass@123456",
    "confirmPassword": "NewPass@123456"
  }'
```

### 3. Test Token Refresh
```bash
# From registration response, save refreshToken
REFRESH_TOKEN="eyJhbGc..."

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq '.data.accessToken' -r > /tmp/token.txt
```

### 4. Test Logout
```bash
TOKEN=$(cat /tmp/token.txt)

curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Postman

### Import Collection

Create a Postman collection with these requests:

1. **Variables**
   - `base_url`: `http://localhost:3000`
   - `access_token`: (auto-populate from login)
   - `refresh_token`: (auto-populate from login)

2. **Register**
   - URL: `{{base_url}}/api/auth/register`
   - Method: POST
   - Body:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass@123456",
     "confirmPassword": "TestPass@123456",
     "firstName": "Test",
     "lastName": "User"
   }
   ```
   - Tests (to save token):
   ```javascript
   pm.environment.set("access_token", pm.response.json().data.accessToken);
   pm.environment.set("refresh_token", pm.response.json().data.refreshToken);
   ```

3. **Login**
   - URL: `{{base_url}}/api/auth/login`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass@123456"
   }
   ```
   - Tests:
   ```javascript
   pm.environment.set("access_token", pm.response.json().data.accessToken);
   pm.environment.set("refresh_token", pm.response.json().data.refreshToken);
   ```

4. **Get Profile**
   - URL: `{{base_url}}/api/user/profile`
   - Method: GET
   - Headers: `Authorization: Bearer {{access_token}}`

5. **Health Check**
   - URL: `{{base_url}}/api/health`
   - Method: GET

---

## Rate Limiting (Future Implementation)

Response headers will include:

```
X-RateLimit-Limit: 100
X-RateLimit-Window: 60
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1617312060
```

---

## Common Issues

### "Invalid JSON in request body"
- Ensure Content-Type is `application/json`
- Validate JSON syntax

### "Missing or invalid authentication token"
- Include Authorization header: `Authorization: Bearer <token>`
- Token may have expired (refresh it)

### "Validation failed"
- Check required fields
- Verify password strength requirements
- Ensure email format is valid

### "User not found or inactive"
- Account may be disabled
- Check if user was created

---

## Security Notes

1. **Never commit tokens** - Use environment variables
2. **Use HTTPS in production** - Never use HTTP
3. **Token expiration** - Access tokens expire in 15 minutes
4. **Refresh tokens** - Valid for 7 days
5. **Password hashing** - bcrypt with 12 rounds

---

**For more details, see IMPLEMENTATION_GUIDE.md or SETUP_GUIDE.md**

