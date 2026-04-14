import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { authorize } from "../../../backend/src/middleware/rbac";
import { ForbiddenError } from "../../../backend/src/errors";
import type { Request, Response, NextFunction } from "express";

/**
 * Feature: sco-lead-management, Property 17: RBAC menolak akses di luar hak role
 * Validates: Requirements 11.4
 *
 * For any combination of (role, allowedRoles) where the role is NOT in allowedRoles,
 * the authorize middleware should throw ForbiddenError.
 * Conversely, when the role IS in allowedRoles, the middleware should call next() without error.
 */

const ALL_ROLES = ["SUPERADMIN", "SUPERIOR", "PIC"] as const;
type Role = (typeof ALL_ROLES)[number];

/** Arbitrary that picks a single Role value */
const roleArb = fc.constantFrom<Role>(...ALL_ROLES);

/** Arbitrary that picks a non-empty subset of roles (for allowedRoles) */
const roleSubsetArb = fc
  .subarray([...ALL_ROLES], { minLength: 1, maxLength: ALL_ROLES.length })
  .map((arr) => [...new Set(arr)]);

function mockReq(role: Role): Partial<Request> {
  return {
    user: {
      userId: "test-user-id",
      role: role as any,
      employeeId: "EMP-001",
    },
  };
}

function mockRes(): Partial<Response> {
  return {};
}

describe("Feature: sco-lead-management, Property 17: RBAC menolak akses di luar hak role", () => {
  it("should call next() without error when user role IS in allowedRoles", () => {
    fc.assert(
      fc.property(roleArb, roleSubsetArb, (role, allowedRoles) => {
        // Pre-condition: role must be in allowedRoles
        fc.pre(allowedRoles.includes(role));

        const middleware = authorize(...(allowedRoles as any[]));
        const req = mockReq(role) as Request;
        const res = mockRes() as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        middleware(req, res, next);

        expect(nextCalled).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("should throw ForbiddenError when user role is NOT in allowedRoles", () => {
    fc.assert(
      fc.property(roleArb, roleSubsetArb, (role, allowedRoles) => {
        // Pre-condition: role must NOT be in allowedRoles
        fc.pre(!allowedRoles.includes(role));

        const middleware = authorize(...(allowedRoles as any[]));
        const req = mockReq(role) as Request;
        const res = mockRes() as Response;
        const next: NextFunction = () => {};

        expect(() => middleware(req, res, next)).toThrow(ForbiddenError);
      }),
      { numRuns: 100 },
    );
  });

  it("should throw ForbiddenError when req.user is undefined", () => {
    fc.assert(
      fc.property(roleSubsetArb, (allowedRoles) => {
        const middleware = authorize(...(allowedRoles as any[]));
        const req = {} as Request;
        const res = mockRes() as Response;
        const next: NextFunction = () => {};

        expect(() => middleware(req, res, next)).toThrow(ForbiddenError);
      }),
      { numRuns: 100 },
    );
  });
});
