import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ForbiddenError } from "../../../backend/src/errors";
import type { Request, Response, NextFunction } from "express";

/**
 * Feature: sco-lead-management, Property 5: PIC hanya melihat Lead yang di-assign kepadanya
 * Validates: Requirements 1.6, 11.5
 *
 * For any set of Leads and a specific PIC, when the PIC accesses the Lead list,
 * every Lead returned must have an active assignment to that PIC, and no
 * unassigned Lead should appear.
 */

// Mock prisma before importing the middleware
const mockFindFirst = vi.fn();
vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    assignment: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
  prisma: {
    assignment: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

// Import after mock setup
import { checkLeadOwnership } from "../../../backend/src/middleware/rbac";

const ALL_ROLES = ["SUPERADMIN", "SUPERIOR", "PIC"] as const;
type Role = (typeof ALL_ROLES)[number];

/** Arbitrary for UUID-like strings */
const uuidArb = fc.uuid();

/** Arbitrary for non-PIC roles (SUPERADMIN, SUPERIOR) */
const nonPicRoleArb = fc.constantFrom<Role>("SUPERADMIN", "SUPERIOR");

function mockReq(
  role: Role,
  userId: string,
  leadId: string
): Partial<Request> {
  return {
    user: {
      userId,
      role: role as any,
      employeeId: "EMP-001",
    },
    params: { leadId } as any,
  };
}

function mockRes(): Partial<Response> {
  return {};
}

describe("Feature: sco-lead-management, Property 5: PIC hanya melihat Lead yang di-assign kepadanya", () => {
  beforeEach(() => {
    mockFindFirst.mockReset();
  });

  it("PIC with active assignment should be granted access (next() called)", async () => {
    fc.assert(
      fc.asyncProperty(uuidArb, uuidArb, async (userId, leadId) => {
        // Simulate an active assignment exists
        mockFindFirst.mockResolvedValue({
          id: "assignment-id",
          leadId,
          picId: userId,
          isActive: true,
        });

        const req = mockReq("PIC", userId, leadId) as Request;
        const res = mockRes() as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await checkLeadOwnership(req, res, next);

        expect(nextCalled).toBe(true);
        expect(mockFindFirst).toHaveBeenCalledWith({
          where: {
            leadId,
            picId: userId,
            isActive: true,
          },
        });
      }),
      { numRuns: 100 },
    );
  });

  it("PIC without active assignment should be denied access (ForbiddenError)", async () => {
    fc.assert(
      fc.asyncProperty(uuidArb, uuidArb, async (userId, leadId) => {
        // Simulate no active assignment
        mockFindFirst.mockResolvedValue(null);

        const req = mockReq("PIC", userId, leadId) as Request;
        const res = mockRes() as Response;
        const next: NextFunction = () => {};

        await expect(
          checkLeadOwnership(req, res, next)
        ).rejects.toThrow(ForbiddenError);

        expect(mockFindFirst).toHaveBeenCalledWith({
          where: {
            leadId,
            picId: userId,
            isActive: true,
          },
        });
      }),
      { numRuns: 100 },
    );
  });

  it("SUPERADMIN and SUPERIOR should always be granted access regardless of assignment", async () => {
    fc.assert(
      fc.asyncProperty(
        nonPicRoleArb,
        uuidArb,
        uuidArb,
        async (role, userId, leadId) => {
          const req = mockReq(role, userId, leadId) as Request;
          const res = mockRes() as Response;
          let nextCalled = false;
          const next: NextFunction = () => {
            nextCalled = true;
          };

          await checkLeadOwnership(req, res, next);

          expect(nextCalled).toBe(true);
          // prisma should NOT be queried for non-PIC roles
          expect(mockFindFirst).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 },
    );
  });
});
