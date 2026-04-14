import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 4: Setiap mutasi pada entitas yang dilacak menghasilkan Audit Trail
 * Feature: sco-lead-management, Property 16: Audit Trail bersifat immutable
 * Validates: Requirements 1.5, 2.3, 6.4, 10.1, 10.2
 */

// --- Mocks ---

const mockAuditTrailCreate = vi.fn();

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    auditTrail: {
      create: (...args: unknown[]) => mockAuditTrailCreate(...args),
    },
  },
  prisma: {
    auditTrail: {
      create: (...args: unknown[]) => mockAuditTrailCreate(...args),
    },
  },
}));

// Import after mocks
import { auditTrailService } from "../../../backend/src/services/audit-trail.service";

// --- Arbitraries ---

const TRACKED_ENTITIES = ["Lead", "ContactPerson", "Assignment", "LeadStatus", "Activity"] as const;

const entityNameArb = fc.constantFrom(...TRACKED_ENTITIES);
const uuidArb = fc.uuid();

/** Generate a random JSON-like object for previousValue / newValue */
const jsonValueArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  fc.oneof(
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
  ),
  { minKeys: 1, maxKeys: 5 },
);

// =============================================================================
// Property 4: Setiap mutasi pada entitas yang dilacak menghasilkan Audit Trail
// =============================================================================

describe("Feature: sco-lead-management, Property 4: Setiap mutasi pada entitas yang dilacak menghasilkan Audit Trail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 1.5, 2.3, 6.4, 10.1**
   *
   * For any mutation on a tracked entity, auditTrailService.log must create
   * a record with all required fields: entityName, entityId, changedBy,
   * previousValue, and newValue.
   */
  it("should create an audit trail record with all required fields for any tracked entity mutation", () => {
    fc.assert(
      fc.asyncProperty(
        entityNameArb,
        uuidArb,
        uuidArb,
        jsonValueArb,
        jsonValueArb,
        async (entityName, entityId, changedBy, previousValue, newValue) => {
          const fakeRecord = {
            id: "audit-id",
            entityName,
            entityId,
            changedBy,
            previousValue,
            newValue,
            changeTime: new Date(),
          };
          mockAuditTrailCreate.mockResolvedValue(fakeRecord);

          const result = await auditTrailService.log({
            entityName,
            entityId,
            changedBy,
            previousValue,
            newValue,
          });

          // Verify create was called exactly once
          expect(mockAuditTrailCreate).toHaveBeenCalledTimes(1);

          // Verify the data passed to prisma.auditTrail.create contains all required fields
          const callArg = mockAuditTrailCreate.mock.calls[0][0];
          expect(callArg).toHaveProperty("data");
          expect(callArg.data.entityName).toBe(entityName);
          expect(callArg.data.entityId).toBe(entityId);
          expect(callArg.data.changedBy).toBe(changedBy);
          // previousValue and newValue are passed (may be transformed to Prisma.JsonNull)
          expect(callArg.data).toHaveProperty("previousValue");
          expect(callArg.data).toHaveProperty("newValue");

          // Verify the returned record matches
          expect(result).toEqual(fakeRecord);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.1**
   *
   * When previousValue or newValue is null/undefined, the service should
   * still create the audit record (using Prisma.JsonNull internally).
   */
  it("should handle null previousValue and newValue gracefully", () => {
    fc.assert(
      fc.asyncProperty(
        entityNameArb,
        uuidArb,
        uuidArb,
        async (entityName, entityId, changedBy) => {
          const fakeRecord = {
            id: "audit-id",
            entityName,
            entityId,
            changedBy,
            previousValue: null,
            newValue: null,
            changeTime: new Date(),
          };
          mockAuditTrailCreate.mockResolvedValue(fakeRecord);

          const result = await auditTrailService.log({
            entityName,
            entityId,
            changedBy,
            previousValue: null,
            newValue: null,
          });

          expect(mockAuditTrailCreate).toHaveBeenCalledTimes(1);
          expect(result).toEqual(fakeRecord);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// =============================================================================
// Property 16: Audit Trail bersifat immutable
// =============================================================================

describe("Feature: sco-lead-management, Property 16: Audit Trail bersifat immutable", () => {
  /**
   * **Validates: Requirements 10.2**
   *
   * The auditTrailService must NOT expose any update, delete, or remove methods.
   * This is a structural property — the service object itself must be immutable
   * by design (no mutation endpoints).
   */
  it("should not have update, delete, or remove methods on auditTrailService", () => {
    const forbiddenMethods = ["update", "delete", "remove", "destroy", "edit", "patch"];

    fc.assert(
      fc.property(
        fc.constantFrom(...forbiddenMethods),
        (methodName) => {
          expect(auditTrailService).not.toHaveProperty(methodName);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.2**
   *
   * The auditTrailService should only expose read and log methods.
   * Verify that all keys on the service are in the allowed set.
   */
  it("should only expose allowed methods (log, getByEntity, getByLead)", () => {
    const allowedMethods = ["log", "getByEntity", "getByLead"];
    const actualMethods = Object.keys(auditTrailService);

    for (const method of actualMethods) {
      expect(allowedMethods).toContain(method);
    }
  });
});
