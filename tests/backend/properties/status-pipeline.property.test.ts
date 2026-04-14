import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 6: Transisi status pipeline mengikuti aturan ketat
 * Feature: sco-lead-management, Property 7: Status tidak dapat diperbarui tanpa Activity
 * Validates: Requirements 6.2, 6.3, 6.5
 */

// --- Mocks ---

const mockLeadFindFirst = vi.fn();
const mockActivityCount = vi.fn();
const mockLeadStatusCreate = vi.fn();

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    lead: {
      findFirst: (...args: unknown[]) => mockLeadFindFirst(...args),
    },
    activity: {
      count: (...args: unknown[]) => mockActivityCount(...args),
    },
    leadStatus: {
      create: (...args: unknown[]) => mockLeadStatusCreate(...args),
    },
  },
}));

// Import after mocks
import {
  validateTransition,
  STATUS_TRANSITIONS,
  statusPipelineService,
} from "../../../backend/src/services/status-pipeline.service";
import { ValidationError } from "../../../backend/src/errors";

// --- Constants ---

const ALL_STATUSES = [
  "NEW_LEAD",
  "CONTACTED",
  "IN_DISCUSSION",
  "PITCHING",
  "NEGOTIATION",
  "ON_HOLD",
  "DEAL",
  "LOST",
] as const;

type PipelineStatus = (typeof ALL_STATUSES)[number];

/** Arbitrary that picks a single PipelineStatus */
const statusArb = fc.constantFrom<PipelineStatus>(...ALL_STATUSES);

// =============================================================================
// Property 6: Transisi status pipeline mengikuti aturan ketat
// =============================================================================

describe("Feature: sco-lead-management, Property 6: Transisi status pipeline mengikuti aturan ketat", () => {
  /**
   * **Validates: Requirements 6.2**
   *
   * For any pair (current, target), validateTransition returns true
   * if and only if target is in STATUS_TRANSITIONS[current].
   */
  it("validateTransition returns true iff target is in STATUS_TRANSITIONS[current]", () => {
    fc.assert(
      fc.property(statusArb, statusArb, (current, target) => {
        const allowed = STATUS_TRANSITIONS[current] ?? [];
        const expected = allowed.includes(target as any);
        const result = validateTransition(current as any, target as any);

        expect(result).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 6.3**
   *
   * For any pair (current, target) where target is NOT in STATUS_TRANSITIONS[current],
   * validateTransition must return false — invalid transitions are always rejected.
   */
  it("invalid transitions are always rejected", () => {
    fc.assert(
      fc.property(statusArb, statusArb, (current, target) => {
        const allowed = STATUS_TRANSITIONS[current] ?? [];
        fc.pre(!allowed.includes(target as any));

        expect(validateTransition(current as any, target as any)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * Terminal statuses (DEAL, LOST) have no valid outgoing transitions.
   */
  it("terminal statuses DEAL and LOST have no valid transitions", () => {
    const terminalStatuses: PipelineStatus[] = ["DEAL", "LOST"];

    for (const terminal of terminalStatuses) {
      fc.assert(
        fc.property(statusArb, (target) => {
          expect(validateTransition(terminal as any, target as any)).toBe(false);
        }),
        { numRuns: 100 },
      );
    }
  });
});

// =============================================================================
// Property 7: Status tidak dapat diperbarui tanpa Activity
// =============================================================================

describe("Feature: sco-lead-management, Property 7: Status tidak dapat diperbarui tanpa Activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 6.5**
   *
   * For any Lead that has zero activities, updateStatus must throw
   * ValidationError with message "Activity harus dibuat sebelum update status".
   */
  it("should reject status update when lead has no activities", () => {
    fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (leadId, userId) => {
          // Mock lead exists with current status NEW_LEAD and a valid transition target
          mockLeadFindFirst.mockResolvedValue({
            id: leadId,
            isDeleted: false,
            statuses: [{ status: "NEW_LEAD", updatedAt: new Date() }],
          });

          // Mock zero activities
          mockActivityCount.mockResolvedValue(0);

          await expect(
            statusPipelineService.updateStatus(leadId, "CONTACTED" as any, userId),
          ).rejects.toThrow(ValidationError);

          await expect(
            statusPipelineService.updateStatus(leadId, "CONTACTED" as any, userId),
          ).rejects.toThrow("Activity harus dibuat sebelum update status");

          // leadStatus.create should never be called
          expect(mockLeadStatusCreate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 6.5**
   *
   * For any Lead that has at least one activity and a valid transition,
   * updateStatus should succeed (not throw ValidationError about activities).
   */
  it("should allow status update when lead has activities and transition is valid", () => {
    fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 100 }),
        async (leadId, userId, activityCount) => {
          // Mock lead with NEW_LEAD status
          mockLeadFindFirst.mockResolvedValue({
            id: leadId,
            isDeleted: false,
            statuses: [{ status: "NEW_LEAD", updatedAt: new Date() }],
          });

          // Mock activities exist
          mockActivityCount.mockResolvedValue(activityCount);

          // Mock successful status creation
          const createdStatus = {
            id: "new-status-id",
            leadId,
            status: "CONTACTED",
            updatedAt: new Date(),
            updatedBy: userId,
          };
          mockLeadStatusCreate.mockResolvedValue(createdStatus);

          const result = await statusPipelineService.updateStatus(
            leadId,
            "CONTACTED" as any,
            userId,
          );

          expect(result).toEqual(createdStatus);
          expect(mockLeadStatusCreate).toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});
