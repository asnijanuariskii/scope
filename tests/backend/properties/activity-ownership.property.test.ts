import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 10: PIC baru tidak dapat mengedit Activity PIC sebelumnya
 * Validates: Requirements 5.4
 *
 * For any Activity created by a previous PIC, after a Lead is reassigned to a new PIC,
 * the new PIC must be denied when trying to edit that Activity.
 */

// --- Mocks ---

const mockActivityFindById = vi.fn();
const mockActivityUpdate = vi.fn();
const mockLeadFindById = vi.fn();

vi.mock("../../../backend/src/repositories/activity.repository", () => ({
  activityRepository: {
    create: vi.fn(),
    findByLeadId: vi.fn(),
    findById: (...args: unknown[]) => mockActivityFindById(...args),
    update: (...args: unknown[]) => mockActivityUpdate(...args),
  },
}));

vi.mock("../../../backend/src/repositories/lead.repository", () => ({
  leadRepository: {
    findById: (...args: unknown[]) => mockLeadFindById(...args),
  },
}));

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    lead: { update: vi.fn() },
  },
}));

// Import after mocks
import { activityService } from "../../../backend/src/services/activity.service";
import { ForbiddenError } from "../../../backend/src/errors";

// --- Arbitraries ---

const uuidArb = fc.uuid();

const ACTIVITY_TYPES = ["CALL", "CHAT", "VISIT"] as const;
type ActivityType = (typeof ACTIVITY_TYPES)[number];

const activityTypeArb = fc.constantFrom<ActivityType>(...ACTIVITY_TYPES);
const validNotesArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);
const futureDateArb = fc.date({ min: new Date() }).map((d) => d.toISOString());

// =============================================================================
// Property 10: PIC baru tidak dapat mengedit Activity PIC sebelumnya
// =============================================================================

describe("Feature: sco-lead-management, Property 10: PIC baru tidak dapat mengedit Activity PIC sebelumnya", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 5.4**
   *
   * When a PIC tries to update an activity created by a different PIC
   * (createdBy !== userId), ForbiddenError is thrown.
   */
  it("should throw ForbiddenError when PIC tries to edit Activity created by another PIC", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        activityTypeArb,
        validNotesArb,
        futureDateArb,
        async (activityId, createdByPic, newPicUserId, activityType, notes, followUpDate) => {
          // Ensure the two PICs are different
          fc.pre(createdByPic !== newPicUserId);

          // Mock: activity exists and was created by the previous PIC
          mockActivityFindById.mockResolvedValue({
            id: activityId,
            leadId: "lead-id",
            createdBy: createdByPic,
            activityType,
            notes: "Original notes",
            nextFollowUpDate: new Date(),
            evidencePath: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // New PIC tries to update the activity
          await expect(
            activityService.update(
              activityId,
              { activity_type: activityType, notes, next_follow_up_date: followUpDate },
              newPicUserId,
            ),
          ).rejects.toThrow(ForbiddenError);

          // Repository update should never be called
          expect(mockActivityUpdate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 5.4**
   *
   * When a PIC updates their own activity (createdBy === userId),
   * the update should succeed.
   */
  it("should allow PIC to update their own Activity (createdBy === userId)", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        activityTypeArb,
        validNotesArb,
        futureDateArb,
        async (activityId, picUserId, activityType, notes, followUpDate) => {
          // Mock: activity exists and was created by the same PIC
          const existingActivity = {
            id: activityId,
            leadId: "lead-id",
            createdBy: picUserId,
            activityType,
            notes: "Original notes",
            nextFollowUpDate: new Date(),
            evidencePath: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockActivityFindById.mockResolvedValue(existingActivity);

          const updatedActivity = {
            ...existingActivity,
            activityType,
            notes: notes.trim(),
            nextFollowUpDate: new Date(followUpDate),
            updatedAt: new Date(),
          };
          mockActivityUpdate.mockResolvedValue(updatedActivity);

          // Same PIC updates their own activity — should succeed
          const result = await activityService.update(
            activityId,
            { activity_type: activityType, notes, next_follow_up_date: followUpDate },
            picUserId,
          );

          expect(result).toEqual(updatedActivity);
          expect(mockActivityUpdate).toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});
