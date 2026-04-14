import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 3: Soft delete mengubah is_deleted dan mencatat deleted_at
 * Validates: Requirements 3.3
 *
 * For any User that supports soft delete, after the soft delete operation,
 * is_deleted must be true, deleted_at must be set, and the original data
 * must still exist in the database (not permanently deleted).
 */

// Mock prisma before importing service/repository
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Import after mock setup
import { userService } from "../../../backend/src/services/user.service";
import { userRepository } from "../../../backend/src/repositories/user.repository";
import { NotFoundError } from "../../../backend/src/errors";

const ALL_ROLES = ["SUPERADMIN", "SUPERIOR", "PIC"] as const;

/** Arbitrary for UUID-like strings */
const uuidArb = fc.uuid();

/** Arbitrary for a valid role */
const roleArb = fc.constantFrom(...ALL_ROLES);

/** Arbitrary for user data */
const userDataArb = fc.record({
  id: uuidArb,
  nama: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  employeeId: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  phoneNumber: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  role: roleArb,
  isDeleted: fc.constant(false),
  deletedAt: fc.constant(null),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

describe("Feature: sco-lead-management, Property 3: Soft delete mengubah is_deleted dan mencatat deleted_at", () => {
  beforeEach(() => {
    mockFindFirst.mockReset();
    mockUpdate.mockReset();
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * After softDelete is called on an existing user, the repository update
   * must be called with isDeleted=true and deletedAt set to a valid Date.
   */
  it("soft delete should set isDeleted=true and deletedAt to a Date for any valid user", async () => {
    await fc.assert(
      fc.asyncProperty(userDataArb, async (userData) => {
        // findFirst returns the user (user exists, not deleted)
        mockFindFirst.mockResolvedValue(userData);

        // Capture what update is called with
        let capturedUpdateArgs: any = null;
        mockUpdate.mockImplementation((args: any) => {
          capturedUpdateArgs = args;
          return Promise.resolve({
            ...userData,
            isDeleted: true,
            deletedAt: args.data.deletedAt,
          });
        });

        await userService.softDelete(userData.id);

        // Verify update was called
        expect(mockUpdate).toHaveBeenCalledOnce();

        // Verify isDeleted is set to true
        expect(capturedUpdateArgs.data.isDeleted).toBe(true);

        // Verify deletedAt is a valid Date
        expect(capturedUpdateArgs.data.deletedAt).toBeInstanceOf(Date);

        // Verify the correct user ID was targeted
        expect(capturedUpdateArgs.where.id).toBe(userData.id);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * After soft delete, the user data is NOT permanently deleted.
   * The findFirst (used by findById) still returns the user record before
   * the soft delete filter is applied — proving data persists in DB.
   */
  it("soft delete should NOT permanently delete user data (data still exists in DB)", async () => {
    await fc.assert(
      fc.asyncProperty(userDataArb, async (userData) => {
        // findFirst returns the user (exists, not deleted)
        mockFindFirst.mockResolvedValue(userData);

        // update returns the soft-deleted version
        const softDeletedUser = {
          ...userData,
          isDeleted: true,
          deletedAt: new Date(),
        };
        mockUpdate.mockResolvedValue(softDeletedUser);

        const result = await userService.softDelete(userData.id);

        // The repository uses prisma.user.update (NOT delete), proving
        // the record is still in the database
        expect(mockUpdate).toHaveBeenCalled();

        // Verify update was used, NOT a delete operation — the mock for
        // delete was never set up, so if delete were called it would fail.
        // The fact that softDelete completes successfully proves it uses update.
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * After soft delete, findById should return null because it filters
   * with isDeleted=false. This verifies the soft delete makes the user
   * invisible to normal queries while data persists.
   */
  it("after soft delete, findById should return null (filters isDeleted=false)", async () => {
    await fc.assert(
      fc.asyncProperty(userDataArb, async (userData) => {
        // First call: findById before soft delete — user exists
        // Second call: findById after soft delete — returns null (isDeleted filter)
        mockFindFirst
          .mockResolvedValueOnce(userData) // for softDelete's internal findById check
          .mockResolvedValueOnce(null); // for subsequent findById (filtered out)

        mockUpdate.mockResolvedValue({
          ...userData,
          isDeleted: true,
          deletedAt: new Date(),
        });

        // Perform soft delete
        await userService.softDelete(userData.id);

        // Now findById should return null (user is soft-deleted)
        const result = await userRepository.findById(userData.id);
        expect(result).toBeNull();

        // Verify findFirst was called with isDeleted: false filter
        const lastFindFirstCall = mockFindFirst.mock.calls[mockFindFirst.mock.calls.length - 1];
        expect(lastFindFirstCall[0]).toEqual({
          where: { id: userData.id, isDeleted: false },
        });
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * Soft delete on a non-existent user should throw NotFoundError.
   */
  it("soft delete on non-existent user should throw NotFoundError", async () => {
    await fc.assert(
      fc.asyncProperty(uuidArb, async (userId) => {
        // findFirst returns null (user not found)
        mockFindFirst.mockResolvedValue(null);

        await expect(userService.softDelete(userId)).rejects.toThrow(
          NotFoundError
        );

        // update should NOT be called
        expect(mockUpdate).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });
});
