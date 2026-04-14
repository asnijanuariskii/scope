import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: sco-lead-management, Property 8: Setiap Lead hanya memiliki satu PIC aktif
 * Feature: sco-lead-management, Property 9: Re-assign menonaktifkan assignment lama dan membuat assignment baru
 * Validates: Requirements 5.2, 5.3
 */

// --- Mocks ---

const mockFindById_lead = vi.fn();
const mockFindById_user = vi.fn();
const mockFindActiveByLeadId = vi.fn();
const mockCreate = vi.fn();
const mockDeactivate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("../../../backend/src/repositories/lead.repository", () => ({
  leadRepository: {
    findById: (...args: unknown[]) => mockFindById_lead(...args),
  },
}));

vi.mock("../../../backend/src/repositories/user.repository", () => ({
  userRepository: {
    findById: (...args: unknown[]) => mockFindById_user(...args),
  },
}));

vi.mock("../../../backend/src/repositories/assignment.repository", () => ({
  assignmentRepository: {
    findActiveByLeadId: (...args: unknown[]) => mockFindActiveByLeadId(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    deactivate: (...args: unknown[]) => mockDeactivate(...args),
  },
}));

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

// Import after mocks
import { assignmentService } from "../../../backend/src/services/assignment.service";
import { ConflictError, NotFoundError } from "../../../backend/src/errors";

// --- Arbitraries ---

const uuidArb = fc.uuid();
const notesArb = fc.string({ minLength: 1, maxLength: 200 });

/** Helper: mock a valid Lead */
function mockValidLead(leadId: string) {
  mockFindById_lead.mockResolvedValue({
    id: leadId,
    namaEo: "Test EO",
    isDeleted: false,
  });
}

/** Helper: mock a valid PIC user */
function mockValidPic(picId: string) {
  mockFindById_user.mockResolvedValue({
    id: picId,
    role: "PIC",
    isDeleted: false,
  });
}

/** Helper: mock an active assignment */
function mockActiveAssignment(leadId: string, picId: string, assignmentId: string) {
  mockFindActiveByLeadId.mockResolvedValue({
    id: assignmentId,
    leadId,
    picId,
    isActive: true,
    assignedAt: new Date(),
    reassignedAt: null,
    reassignedNotes: null,
  });
}

// =============================================================================
// Property 8: Setiap Lead hanya memiliki satu PIC aktif
// =============================================================================

describe("Feature: sco-lead-management, Property 8: Setiap Lead hanya memiliki satu PIC aktif", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 5.2**
   *
   * For any Lead that already has an active assignment, calling assign()
   * must throw ConflictError — preventing a second active PIC.
   */
  it("should throw ConflictError when assigning a Lead that already has an active PIC", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        uuidArb,
        uuidArb,
        async (leadId, existingPicId, newPicId, existingAssignmentId, userId) => {
          mockValidLead(leadId);
          mockValidPic(newPicId);
          mockActiveAssignment(leadId, existingPicId, existingAssignmentId);

          await expect(
            assignmentService.assign(leadId, newPicId, userId)
          ).rejects.toThrow(ConflictError);

          // create should never be called — no second active assignment
          expect(mockCreate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.2**
   *
   * For any Lead with no active assignment, calling assign() should succeed
   * and create exactly one active assignment.
   */
  it("should create an active assignment when Lead has no active PIC", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        async (leadId, picId, userId) => {
          mockValidLead(leadId);
          mockValidPic(picId);
          mockFindActiveByLeadId.mockResolvedValue(null);

          const createdAssignment = {
            id: "new-assignment-id",
            leadId,
            picId,
            isActive: true,
            assignedAt: new Date(),
            pic: { id: picId, role: "PIC" },
          };
          mockCreate.mockResolvedValue(createdAssignment);

          const result = await assignmentService.assign(leadId, picId, userId);

          expect(result).toEqual(createdAssignment);
          expect(mockCreate).toHaveBeenCalledWith({
            leadId,
            picId,
            isActive: true,
            assignedBy: userId,
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// Property 9: Re-assign menonaktifkan assignment lama dan membuat assignment baru
// =============================================================================

describe("Feature: sco-lead-management, Property 9: Re-assign menonaktifkan assignment lama dan membuat assignment baru", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * For any reassign operation on a Lead with an active assignment:
   * - The old assignment gets isActive=false and reassignedAt set (via deactivate)
   * - A new assignment gets isActive=true (via create)
   * - Both operations happen inside a transaction
   */
  it("should deactivate old assignment and create new active assignment on reassign", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        uuidArb,
        notesArb,
        uuidArb,
        async (leadId, oldPicId, newPicId, oldAssignmentId, notes, userId) => {
          mockValidLead(leadId);
          mockValidPic(newPicId);
          mockActiveAssignment(leadId, oldPicId, oldAssignmentId);

          const deactivatedAssignment = {
            id: oldAssignmentId,
            leadId,
            picId: oldPicId,
            isActive: false,
            reassignedAt: expect.any(Date),
            reassignedNotes: notes,
          };
          mockDeactivate.mockResolvedValue(deactivatedAssignment);

          const newAssignment = {
            id: "new-assignment-id",
            leadId,
            picId: newPicId,
            isActive: true,
            assignedAt: new Date(),
            pic: { id: newPicId, role: "PIC" },
          };
          mockCreate.mockResolvedValue(newAssignment);

          // Mock $transaction to execute the callback immediately
          mockTransaction.mockImplementation(async (cb: Function) => {
            return cb({} /* tx placeholder */);
          });

          const result = await assignmentService.reassign(leadId, newPicId, notes, userId);

          // Verify old assignment was deactivated with correct notes
          expect(mockDeactivate).toHaveBeenCalledWith(
            oldAssignmentId,
            notes,
            expect.anything() // tx
          );

          // Verify new assignment was created as active
          expect(mockCreate).toHaveBeenCalledWith(
            {
              leadId,
              picId: newPicId,
              isActive: true,
              assignedBy: userId,
            },
            expect.anything() // tx
          );

          // Result should be the new active assignment
          expect(result).toEqual(newAssignment);
          expect(result.isActive).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * For any reassign attempt on a Lead with no active assignment,
   * the service should throw NotFoundError.
   */
  it("should throw NotFoundError when reassigning a Lead with no active assignment", () => {
    fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        notesArb,
        uuidArb,
        async (leadId, newPicId, notes, userId) => {
          mockValidLead(leadId);
          mockValidPic(newPicId);
          mockFindActiveByLeadId.mockResolvedValue(null);

          await expect(
            assignmentService.reassign(leadId, newPicId, notes, userId)
          ).rejects.toThrow(NotFoundError);

          // Neither deactivate nor create should be called
          expect(mockDeactivate).not.toHaveBeenCalled();
          expect(mockCreate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
