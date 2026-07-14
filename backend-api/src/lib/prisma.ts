import { PrismaClient } from '@prisma/client';

/**
 * Single shared Prisma client for the whole API.
 * Reused across hot-reloads in development to avoid exhausting DB connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === code
  );
}

/** True when a Prisma operation failed because the target record does not exist. */
export function isRecordNotFound(error: unknown): boolean {
  return hasPrismaCode(error, 'P2025');
}

/** True when a Prisma operation failed due to a unique constraint violation. */
export function isUniqueConstraint(error: unknown): boolean {
  return hasPrismaCode(error, 'P2002');
}
