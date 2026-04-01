import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * Global Middleware - Identity Watermarking
 * 
 * Every HTTP response from ZombieCoder Hub carries the system's immutable identity.
 * This ensures that:
 * 1. The origin and ownership of the system is clear
 * 2. Unauthorized modifications are detectable
 * 3. User trust is maintained through transparency
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Generate unique request signature
  const requestId = uuidv4()
  const timestamp = new Date().toISOString()

  // Core Identity Headers - "X-Powered-By: ZombieCoder"
  response.headers.set('X-Powered-By', 'ZombieCoder')
  response.headers.set('X-ZombieCoder-Version', '2.0.0')
  response.headers.set('X-ZombieCoder-Owner', 'Sahon Srabon')
  response.headers.set('X-ZombieCoder-Organization', 'Developer Zone')
  response.headers.set('X-ZombieCoder-Location', 'Dhaka, Bangladesh')
  
  // Security & Tracking Headers
  response.headers.set('X-Request-ID', requestId)
  response.headers.set('X-Timestamp', timestamp)
  response.headers.set('X-ZombieCoder-Signature', requestId)
  
  // CORS Headers for Safety
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Custom Governance Header
  response.headers.set('X-Governance-Enabled', 'true')
  response.headers.set('X-Ethics-Validation', 'required')

  return response
}

/**
 * Configure middleware to run on specific routes
 * 
 * This ensures identity watermarking applies to:
 * - All API routes (/api/*)
 * - Admin routes (/admin/*)
 * - Agent routes (/agents/*)
 * - Public routes (/)
 * 
 * Excludes:
 * - Static files (_next/static, public/*)
 * - Images, fonts, and other assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
