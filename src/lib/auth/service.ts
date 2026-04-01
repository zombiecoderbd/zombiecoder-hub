import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthenticationService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private readonly accessTokenExpiry = 15 * 60; // 15 minutes
  private readonly refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days

  /**
   * Hash password using bcrypt
   * @param password - Raw password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   * @param password - Raw password to check
   * @param hash - Hash to compare against
   * @returns true if password matches
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param sessionId - Session ID
   * @returns JWT token
   */
  generateAccessToken(userId: string, email: string, role: string, sessionId: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      role,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
    };

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      issuer: 'ZombieCoder',
      subject: userId,
    });
  }

  /**
   * Generate JWT refresh token
   * @param userId - User ID
   * @param sessionId - Session ID
   * @returns Refresh token
   */
  generateRefreshToken(userId: string, sessionId: string): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry,
    };

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      issuer: 'ZombieCoder',
      subject: userId,
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(userId: string, email: string, role: string): TokenPair {
    const sessionId = uuidv4();
    return {
      accessToken: this.generateAccessToken(userId, email, role, sessionId),
      refreshToken: this.generateRefreshToken(userId, sessionId),
      expiresIn: this.accessTokenExpiry,
    };
  }

  /**
   * Verify JWT token
   * @param token - JWT token to verify
   * @returns Decoded payload or null
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'ZombieCoder',
      });
      return decoded as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token or null
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generate session token for API clients
   */
  generateSessionToken(userId: string): string {
    return uuidv4();
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain numbers');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain special characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
export const authService = new AuthenticationService();

/**
 * Standalone JWT verification helper for direct import
 * @param token - JWT token to verify
 * @returns Decoded payload or null
 */
export async function verifyJWT(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  return authService.verifyToken(token);
}
