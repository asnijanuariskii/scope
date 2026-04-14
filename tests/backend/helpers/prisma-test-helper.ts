import { PrismaClient } from '@prisma/client';

/**
 * Creates an isolated Prisma client for testing.
 * Uses interactive transactions that get rolled back after each test,
 * ensuring test isolation without polluting the database.
 */

type IsolatedTestFn = (prisma: PrismaClient) => Promise<void>;

/**
 * Wraps a test case in a Prisma interactive transaction that always rolls back.
 * This ensures each test runs in isolation with no side effects on the database.
 *
 * Usage:
 * ```ts
 * it('should create a lead', () =>
 *   withRollback(async (prisma) => {
 *     const lead = await prisma.lead.create({ data: { ... } });
 *     expect(lead).toBeDefined();
 *   })
 * );
 * ```
 */
export async function withRollback(fn: IsolatedTestFn): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.$transaction(async (tx) => {
      // Execute the test function with the transactional client
      await fn(tx as unknown as PrismaClient);

      // Always throw to trigger rollback — this is intentional
      throw new RollbackError();
    });
  } catch (error) {
    if (error instanceof RollbackError) {
      // Expected — transaction was rolled back successfully
      return;
    }
    // Re-throw unexpected errors
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Sentinel error class used to trigger transaction rollback.
 * This is not a real error — it's a control flow mechanism.
 */
class RollbackError extends Error {
  constructor() {
    super('ROLLBACK');
    this.name = 'RollbackError';
  }
}

/**
 * Creates a fresh PrismaClient for tests that don't need transaction rollback
 * (e.g., read-only tests or tests that manage their own cleanup).
 */
export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient();
}
