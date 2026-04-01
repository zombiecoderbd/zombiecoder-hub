import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance
 * Ensures single connection pool across the application
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return false;
  }
}

/**
 * Graceful shutdown of database connection
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Get Prisma client instance
 */
export function getDbClient(): PrismaClient {
  return prisma;
}

export default prisma;
