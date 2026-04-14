import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 11: Activity memperbarui last_activity pada Lead
 * Feature: sco-lead-management, Property 12: Activity tanpa notes ditolak
 * Feature: sco-lead-management, Property 13: Activity Visit tanpa evidence ditolak
 * Validates: Requirements 7.2, 7.3, 7.5
 */

// --- Mocks ---

const mockActivityCreate = vi.fn();
const mockActivityFindByLeadId = vi.fn();
const mockActivityFindById = vi.fn();
const mockActivityUpdate = vi.fn();

const mockLeadFindById = vi.fn();

const mockLeadUpdate = vi.fn();

vi.mock("../../../backend/src/repositories/activity.repository", () => ({
  activityRepository: {
    create: (...args: unknown[]) => mockActivityCreate(...args),
    findByLeadId: (...args: unknown[]) => mockActivityFindByLeadId(...args),
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
    lead: {
      update: (...args: unknown[]) => mockLeadUpdate(...args),
    },
  },
}));

// Import after mocks
import { activityService } from "../../../backend/src/services/activity.service";
import { ValidationError } from "../../../backend/src/errors";

// --- Arbitraries ---

const ACTIVITY_TYPES = ["CALL", "CHAT", "VISIT"] as const;
type ActivityType = (typeof ACTIVITY_TYPES)[number];

const uuidArb = fc.uuid();
const activityTypeArb = fc.constantFrom<ActivityType>(...ACTIVITY_TYPES);
const nonVisitTypeArb = fc.constantFrom<ActivityType>("CALL", "CHAT");
const validNotesArb = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0);
const futureDateArb = fc.date({ min: new Date() }).map((d) => d.toISOString());

/** Generate whitespace-only strings (empty, spaces, tabs, newlines) */
const whitespaceOnlyArb = fc.oneof(
  fc.constant(""),
  fc.constant(" "),
  fc.constant("  "),
  fc.constant("\t"),
  fc.constant("\n"),
  fc.constant("   \t\n  "),
  fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 1, maxLength: 20 }),
);

/** Helper: mock a valid Lead */
function mockValidLead(leadId: string) {
  mockLeadFindById.mockResolvedValue({
    id: leadId,
    namaEo: "Test EO",
    isDeleted: false,
    lastActivityDate: null,
    lastActivityType: null,
  });
}

// =============================================================================
// Property 11: Activity memperbarui last_activity pada Lead
// =============================================================================

describe("Feature: sco-lead-management, Property 11: Activity memperbarui last_activity pada Lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 7.2**
   *
   * For any valid Activity created for a Lead, the Lead's lastActivityDate
   * and lastActivityType must be updated to match the created Activity.
   */
  it("should update lead lastActivityDate and lastActivityType after creating an activity", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        activityTypeArb,
        validNotesArb,
        futureDateArb,
        uuidArb,
        async (leadId, activityType, notes, followUpDate, userId) => {
          mockValidLead(leadId);

          const createdAt = new Date();
          const createdActivity = {
            id: "activity-id",
            leadId,
            createdBy: userId,
            activityType,
            notes: notes.trim(),
            nextFollowUpDate: new Date(followUpDate),
            evidencePath: activityType === "VISIT" ? "/evidence/test.jpg" : null,
            createdAt,
            updatedAt: createdAt,
          };
          mockActivityCreate.mockResolvedValue(createdActivity);
          mockLeadUpdate.mockResolvedValue({});

          const evidencePath = activityType === "VISIT" ? "/evidence/test.jpg" : undefined;

          await activityService.create(
            leadId,
            { activity_type: activityType, notes, next_follow_up_date: followUpDate },
            userId,
            evidencePath,
          );

          // Verify prisma.lead.update was called with correct lastActivity fields
          expect(mockLeadUpdate).toHaveBeenCalledWith({
            where: { id: leadId },
            data: {
              lastActivityDate: createdActivity.createdAt,
              lastActivityType: createdActivity.activityType,
            },
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

// =============================================================================
// Property 12: Activity tanpa notes ditolak
// =============================================================================

describe("Feature: sco-lead-management, Property 12: Activity tanpa notes ditolak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any Activity with empty or whitespace-only notes,
   * the service must throw a ValidationError.
   */
  it("should throw ValidationError when notes is empty or whitespace-only", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        activityTypeArb,
        whitespaceOnlyArb,
        futureDateArb,
        uuidArb,
        async (leadId, activityType, emptyNotes, followUpDate, userId) => {
          mockValidLead(leadId);

          const evidencePath = activityType === "VISIT" ? "/evidence/test.jpg" : undefined;

          await expect(
            activityService.create(
              leadId,
              { activity_type: activityType, notes: emptyNotes, next_follow_up_date: followUpDate },
              userId,
              evidencePath,
            ),
          ).rejects.toThrow(ValidationError);

          // Activity should never be created
          expect(mockActivityCreate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// =============================================================================
// Property 13: Activity Visit tanpa evidence ditolak
// =============================================================================

describe("Feature: sco-lead-management, Property 13: Activity Visit tanpa evidence ditolak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 7.5**
   *
   * For any Activity with type VISIT and no evidencePath,
   * the service must throw a ValidationError.
   */
  it("should throw ValidationError when activity type is VISIT without evidence", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        validNotesArb,
        futureDateArb,
        uuidArb,
        async (leadId, notes, followUpDate, userId) => {
          mockValidLead(leadId);

          await expect(
            activityService.create(
              leadId,
              { activity_type: "VISIT", notes, next_follow_up_date: followUpDate },
              userId,
              undefined, // no evidence
            ),
          ).rejects.toThrow(ValidationError);

          // Activity should never be created
          expect(mockActivityCreate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 7.5**
   *
   * For CALL and CHAT activity types, evidence is NOT required —
   * creation should succeed without evidencePath.
   */
  it("should succeed for CALL and CHAT without evidence", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        nonVisitTypeArb,
        validNotesArb,
        futureDateArb,
        uuidArb,
        async (leadId, activityType, notes, followUpDate, userId) => {
          mockValidLead(leadId);

          const createdAt = new Date();
          const createdActivity = {
            id: "activity-id",
            leadId,
            createdBy: userId,
            activityType,
            notes: notes.trim(),
            nextFollowUpDate: new Date(followUpDate),
            evidencePath: null,
            createdAt,
            updatedAt: createdAt,
          };
          mockActivityCreate.mockResolvedValue(createdActivity);
          mockLeadUpdate.mockResolvedValue({});

          const result = await activityService.create(
            leadId,
            { activity_type: activityType, notes, next_follow_up_date: followUpDate },
            userId,
            undefined, // no evidence — should be fine for CALL/CHAT
          );

          expect(result).toEqual(createdActivity);
          expect(mockActivityCreate).toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});
