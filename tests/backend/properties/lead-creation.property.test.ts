import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ConflictError } from "../../../backend/src/errors";

/**
 * Feature: sco-lead-management, Property 1: Lead baru selalu berstatus New Lead
 * Feature: sco-lead-management, Property 2: Uniqueness nama_eo bersifat case-insensitive dan trimmed
 * Validates: Requirements 1.1, 1.3
 */

// --- Mocks ---

const mockFindByNamaEo = vi.fn();
const mockCreateLead = vi.fn();
const mockFindById = vi.fn();

vi.mock("../../../backend/src/repositories/lead.repository", () => ({
  leadRepository: {
    findByNamaEo: (...args: unknown[]) => mockFindByNamaEo(...args),
    create: (...args: unknown[]) => mockCreateLead(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
  },
}));

const mockTipeFindById = vi.fn();

vi.mock("../../../backend/src/repositories/tipe-lead.repository", () => ({
  tipeLeadRepository: {
    findById: (...args: unknown[]) => mockTipeFindById(...args),
  },
}));

// Import after mock setup
import { leadService } from "../../../backend/src/services/lead.service";

// --- Arbitraries ---

/** Arbitrary for UUID-like strings */
const uuidArb = fc.uuid();

/** Arbitrary for non-empty nama_eo strings (trimmed, printable, at least 1 char after trim) */
const namaEoArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim());

/** Arbitrary for valid CreateLeadInput data */
const createLeadInputArb = fc.record({
  nama_eo: namaEoArb,
  tipe_id: uuidArb,
  alamat: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
  speciality: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  link_sosmed: fc.option(fc.constant(""), { nil: undefined }),
});

// --- Property 1 ---

describe("Feature: sco-lead-management, Property 1: Lead baru selalu berstatus New Lead", () => {
  beforeEach(() => {
    mockFindByNamaEo.mockReset();
    mockCreateLead.mockReset();
    mockTipeFindById.mockReset();
    mockFindById.mockReset();
  });

  it("should create a lead with initial status NEW_LEAD for any valid input", async () => {
    /**
     * **Validates: Requirements 1.1**
     *
     * For any valid Lead data, when created, the lead should have
     * an initial status of NEW_LEAD via statuses.create.
     */
    await fc.assert(
      fc.asyncProperty(createLeadInputArb, uuidArb, async (input, userId) => {
        // No duplicate exists
        mockFindByNamaEo.mockResolvedValue(null);

        // Valid tipe exists
        mockTipeFindById.mockResolvedValue({
          id: input.tipe_id,
          nama: "Test Tipe",
          createdAt: new Date(),
          createdBy: userId,
        });

        // Capture the create call input and return it
        let capturedData: unknown = null;
        mockCreateLead.mockImplementation((data: unknown) => {
          capturedData = data;
          return Promise.resolve({
            id: "new-lead-id",
            namaEo: input.nama_eo.trim(),
            tipeId: input.tipe_id,
            alamat: input.alamat,
            createdAt: new Date(),
          });
        });

        await leadService.create(input, userId);

        // Verify create was called
        expect(mockCreateLead).toHaveBeenCalledOnce();

        // Verify the captured data includes statuses.create with status NEW_LEAD
        const createData = capturedData as Record<string, unknown>;
        expect(createData).toHaveProperty("statuses");

        const statuses = createData.statuses as { create: { status: string } };
        expect(statuses).toHaveProperty("create");
        expect(statuses.create).toHaveProperty("status", "NEW_LEAD");
      }),
      { numRuns: 100 },
    );
  });
});

// --- Property 2 ---

describe("Feature: sco-lead-management, Property 2: Uniqueness nama_eo bersifat case-insensitive dan trimmed", () => {
  beforeEach(() => {
    mockFindByNamaEo.mockReset();
    mockCreateLead.mockReset();
    mockTipeFindById.mockReset();
    mockFindById.mockReset();
  });

  it("should reject creation with ConflictError for case variations and whitespace padding of existing nama_eo", async () => {
    /**
     * **Validates: Requirements 1.3**
     *
     * For any string nama_eo, if a Lead with that name already exists,
     * creating with case variations (upper, lower, mixed) or whitespace
     * padding should be rejected with ConflictError.
     */
    await fc.assert(
      fc.asyncProperty(namaEoArb, uuidArb, uuidArb, async (namaEo, tipeId, userId) => {
        // Simulate existing lead for any findByNamaEo call
        const existingLead = {
          id: "existing-lead-id",
          namaEo: namaEo,
          tipeId: tipeId,
          isDeleted: false,
        };
        mockFindByNamaEo.mockResolvedValue(existingLead);

        // Valid tipe (should not matter since conflict check comes first)
        mockTipeFindById.mockResolvedValue({
          id: tipeId,
          nama: "Test Tipe",
          createdAt: new Date(),
          createdBy: userId,
        });

        const baseInput = {
          nama_eo: namaEo,
          tipe_id: tipeId,
          alamat: "Test Address",
        };

        // Variation 1: uppercase
        await expect(
          leadService.create({ ...baseInput, nama_eo: namaEo.toUpperCase() }, userId),
        ).rejects.toThrow(ConflictError);

        // Variation 2: lowercase
        await expect(
          leadService.create({ ...baseInput, nama_eo: namaEo.toLowerCase() }, userId),
        ).rejects.toThrow(ConflictError);

        // Variation 3: with leading/trailing spaces
        await expect(
          leadService.create({ ...baseInput, nama_eo: `  ${namaEo}  ` }, userId),
        ).rejects.toThrow(ConflictError);

        // Variation 4: original case
        await expect(
          leadService.create({ ...baseInput, nama_eo: namaEo }, userId),
        ).rejects.toThrow(ConflictError);
      }),
      { numRuns: 100 },
    );
  });
});
