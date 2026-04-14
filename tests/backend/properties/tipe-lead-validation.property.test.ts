import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ConflictError } from "../../../backend/src/errors";

/**
 * Feature: sco-lead-management, Property 18: Validasi tipe Lead terhadap master data
 * Validates: Requirements 4.3
 *
 * For any tipe_id that does NOT exist in master data Tipe_Lead,
 * creating a Lead with that tipe should be rejected.
 *
 * We test the tipeLeadService directly:
 * 1. When creating a Tipe Lead with a nama that already exists → ConflictError is thrown
 * 2. When creating a Tipe Lead with a unique nama → creation succeeds
 */

const mockFindByNama = vi.fn();
const mockCreate = vi.fn();
const mockFindAll = vi.fn();

vi.mock("../../../backend/src/repositories/tipe-lead.repository", () => ({
  tipeLeadRepository: {
    findByNama: (...args: unknown[]) => mockFindByNama(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    findAll: (...args: unknown[]) => mockFindAll(...args),
  },
}));

// Import after mock setup
import { tipeLeadService } from "../../../backend/src/services/tipe-lead.service";

/** Arbitrary for UUID-like strings */
const uuidArb = fc.uuid();

/** Arbitrary for non-empty tipe lead names (trimmed, printable) */
const tipeNamaArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

describe("Feature: sco-lead-management, Property 18: Validasi tipe Lead terhadap master data", () => {
  beforeEach(() => {
    mockFindByNama.mockReset();
    mockCreate.mockReset();
    mockFindAll.mockReset();
  });

  it("should throw ConflictError when creating a Tipe Lead with a nama that already exists", async () => {
    /**
     * **Validates: Requirements 4.3**
     *
     * For any nama string and userId, if a Tipe Lead with that nama already exists
     * in master data, the service must reject creation with a ConflictError.
     */
    await fc.assert(
      fc.asyncProperty(tipeNamaArb, uuidArb, async (nama, userId) => {
        // Simulate that a Tipe Lead with this nama already exists
        mockFindByNama.mockResolvedValue({
          id: "existing-tipe-id",
          nama,
          createdAt: new Date(),
          createdBy: "some-user-id",
        });

        await expect(tipeLeadService.create(nama, userId)).rejects.toThrow(
          ConflictError
        );

        expect(mockFindByNama).toHaveBeenCalledWith(nama);
        // create should NOT be called when duplicate exists
        expect(mockCreate).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it("should successfully create a Tipe Lead when nama is unique", async () => {
    /**
     * **Validates: Requirements 4.3**
     *
     * For any unique nama string and userId, if no Tipe Lead with that nama exists,
     * the service must successfully create and return the new Tipe Lead.
     */
    await fc.assert(
      fc.asyncProperty(tipeNamaArb, uuidArb, async (nama, userId) => {
        // Simulate that no Tipe Lead with this nama exists
        mockFindByNama.mockResolvedValue(null);

        const createdTipe = {
          id: "new-tipe-id",
          nama,
          createdAt: new Date(),
          createdBy: userId,
        };
        mockCreate.mockResolvedValue(createdTipe);

        const result = await tipeLeadService.create(nama, userId);

        expect(result).toEqual(createdTipe);
        expect(mockFindByNama).toHaveBeenCalledWith(nama);
        expect(mockCreate).toHaveBeenCalledWith({
          nama,
          createdBy: userId,
        });
      }),
      { numRuns: 100 }
    );
  });
});
