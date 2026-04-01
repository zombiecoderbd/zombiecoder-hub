import { NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

interface ErrorDetails {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Success response
 */
export function success<T>(
  data: T,
  statusCode: number = 200,
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: statusCode }
  );
}

/**
 * Error response
 */
export function error(
  message: string,
  statusCode: number = 400,
  code?: string,
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: statusCode }
  );
}

/**
 * Validation error response
 */
export function validationError(
  errors: Record<string, string[]>,
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: 422 }
  );
}

/**
 * Unauthorized response
 */
export function unauthorized(
  message: string = 'Unauthorized',
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: 401 }
  );
}

/**
 * Forbidden response
 */
export function forbidden(
  message: string = 'Forbidden',
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: 403 }
  );
}

/**
 * Not found response
 */
export function notFound(
  message: string = 'Not found',
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: 404 }
  );
}

/**
 * Server error response
 */
export function serverError(
  message: string = 'Internal server error',
  requestId: string = generateRequestId(),
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '2.0.0',
      },
    },
    { status: 500 }
  );
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse request body with validation
 */
export async function parseRequestBody<T>(
  request: Request
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch (err) {
    return { success: false, error: 'Invalid JSON in request body' };
  }
}
