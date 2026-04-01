import { NextRequest } from 'next/server';
import { checkDatabaseHealth } from '@/src/lib/db/client';
import { success, error } from '@/src/lib/api/response';
import { addSecurityHeaders } from '@/src/lib/api/middleware';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  database: 'up' | 'down';
  api: 'up' | 'down';
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();

    return success({
      status: 'healthy',
      database: dbHealthy ? 'up' : 'down',
      api: 'up',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        api: 'up',
      },
      uptime: Math.floor((Date.now() - startTime) / 1000),
    });
  } catch (err) {
    console.error('[Health] Error:', err);
    return addSecurityHeaders(
      success(
        {
          status: 'unhealthy',
          database: 'down',
          api: 'up',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          services: {
            database: 'down',
            api: 'up',
          },
          uptime: Math.floor((Date.now() - startTime) / 1000),
        },
        503
      )
    );
  }
}
