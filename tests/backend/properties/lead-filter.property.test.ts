import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import type { Prisma } from "@prisma/client";

/**
 * Feature: sco-lead-management, Property 15: Filter dan pencarian Lead menggunakan logika AND
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 *
 * For any combination of filters (Status, PIC, Tipe, Last Activity Date) and search keyword,
 * every Lead returned must satisfy ALL active filter criteria AND contain the search keyword
 * in nama_eo (case-insensitive).
 */

// --- Mocks ---

const mockFindAll = vi.fn();
const mockCount = vi.fn();
const mockFindByNamaEo = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();

vi.mock("../../../backend/src/repositories/lead.repository", () => ({
  leadRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    count: (...args: unknown[]) => mockCount(...args),
    findByNamaEo: (...args: unknown[]) => mockFindByNamaEo(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

vi.mock("../../../backend/src/repositories/tipe-lead.repository", () => ({
  tipeLeadRepository: {
    findById: vi.fn(),
  },
}));

// Import after mock setup
import { leadService } from "../../../backend/src/services/lead.service";

// --- Arbitraries ---

const uuidArb = fc.uuid();

const pipelineStatuses = [
  "NEW_LEAD",
  "CONTACTED",
  "IN_DISCUSSION",
  "PITCHING",
  "NEGOTIATION",
  "ON_HOLD",
  "DEAL",
  "LOST",
] as const;

const statusArb = fc.constantFrom(...pipelineStatuses);

const searchArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

/** Generate a valid ISO datetime string for date range filters */
const isoDateArb = fc
  .date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") })
  .map((d) => d.toISOString());

/** Arbitrary for LeadFilterInput with random combinations of filters */
const filterArb = fc.record({
  status: fc.option(statusArb, { nil: undefined }),
  pic_id: fc.option(uuidArb, { nil: undefined }),
  tipe_id: fc.option(uuidArb, { nil: undefined }),
  last_activity_from: fc.option(isoDateArb, { nil: undefined }),
  last_activity_to: fc.option(isoDateArb, { nil: undefined }),
  search: fc.option(searchArb, { nil: undefined }),
  page: fc.integer({ min: 1, max: 10 }),
  limit: fc.integer({ min: 1, max: 100 }),
});

/** AuthUser for SUPERIOR role (sees all leads, no PIC restriction) */
const superiorUserArb = uuidArb.map((id) => ({
  userId: id,
  role: "SUPERIOR" as const,
  employeeId: "EMP-SUP",
}));

/** AuthUser for PIC role (restricted to assigned leads) */
const picUserArb = uuidArb.map((id) => ({
  userId: id,
  role: "PIC" as const,
  employeeId: "EMP-PIC",
}));

// --- Tests ---

describe("Feature: sco-lead-management, Property 15: Filter dan pencarian Lead menggunakan logika AND", () => {
  beforeEach(() => {
    mockFindAll.mockReset();
    mockCount.mockReset();
    mockFindByNamaEo.mockReset();
    mockFindById.mockReset();

    // Default: return empty results
    mockFindAll.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("isDeleted: false is always present in the where clause for any filter combination", async () => {
    /**
     * **Validates: Requirements 9.1**
     *
     * For any combination of filters and any user role, the where clause
     * must always include isDeleted: false to exclude soft-deleted leads.
     */
    await fc.assert(
      fc.asyncProperty(filterArb, superiorUserArb, async (filters, user) => {
        let capturedWhere: Prisma.LeadWhereInput | null = null;

        mockFindAll.mockImplementation((where: Prisma.LeadWhereInput) => {
          capturedWhere = where;
          return Promise.resolve([]);
        });
        mockCount.mockResolvedValue(0);

        await leadService.findAll(filters, user);

        expect(capturedWhere).not.toBeNull();
        expect(capturedWhere!.isDeleted).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("when multiple filters are applied, the where clause includes ALL filter conditions (AND logic)", async () => {
    /**
     * **Validates: Requirements 9.3**
     *
     * For any combination of active filters, every filter condition must
     * appear in the where clause simultaneously (AND logic).
     */
    await fc.assert(
      fc.asyncProperty(filterArb, superiorUserArb, async (filters, user) => {
        let capturedWhere: Prisma.LeadWhereInput | null = null;

        mockFindAll.mockImplementation((where: Prisma.LeadWhereInput) => {
          capturedWhere = where;
          return Promise.resolve([]);
        });
        mockCount.mockResolvedValue(0);

        await leadService.findAll(filters, user);

        expect(capturedWhere).not.toBeNull();
        const where = capturedWhere!;

        // isDeleted always present
        expect(where.isDeleted).toBe(false);

        // If status filter is set, statuses condition must be present
        if (filters.status !== undefined) {
          expect(where.statuses).toBeDefined();
          expect((where.statuses as { some: { status: string } }).some.status).toBe(
            filters.status,
          );
        }

        // If tipe_id filter is set, tipeId must be present
        if (filters.tipe_id !== undefined) {
          expect(where.tipeId).toBe(filters.tipe_id);
        }

        // If last_activity_from is set, lastActivityDate.gte must be present
        if (filters.last_activity_from !== undefined) {
          expect(where.lastActivityDate).toBeDefined();
          expect(
            (where.lastActivityDate as { gte?: Date }).gte,
          ).toEqual(new Date(filters.last_activity_from));
        }

        // If last_activity_to is set, lastActivityDate.lte must be present
        if (filters.last_activity_to !== undefined) {
          expect(where.lastActivityDate).toBeDefined();
          expect(
            (where.lastActivityDate as { lte?: Date }).lte,
          ).toEqual(new Date(filters.last_activity_to));
        }

        // If search is set, namaEo contains filter must be present
        if (filters.search !== undefined) {
          expect(where.namaEo).toBeDefined();
          expect(
            (where.namaEo as { contains: string; mode: string }).contains,
          ).toBe(filters.search);
        }

        // If pic_id is set, assignments filter must include picId
        if (filters.pic_id !== undefined) {
          expect(where.assignments).toBeDefined();
          const assignmentSome = (where.assignments as { some: { picId: string; isActive: boolean } }).some;
          expect(assignmentSome.picId).toBe(filters.pic_id);
          expect(assignmentSome.isActive).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("when search is applied, namaEo contains filter is added with case-insensitive mode", async () => {
    /**
     * **Validates: Requirements 9.2, 9.4**
     *
     * For any search keyword, the where clause must include a namaEo
     * filter with contains and mode: 'insensitive'.
     */
    await fc.assert(
      fc.asyncProperty(searchArb, superiorUserArb, async (search, user) => {
        let capturedWhere: Prisma.LeadWhereInput | null = null;

        mockFindAll.mockImplementation((where: Prisma.LeadWhereInput) => {
          capturedWhere = where;
          return Promise.resolve([]);
        });
        mockCount.mockResolvedValue(0);

        const filters = { search, page: 1, limit: 20 };
        await leadService.findAll(filters, user);

        expect(capturedWhere).not.toBeNull();
        const namaEoFilter = capturedWhere!.namaEo as {
          contains: string;
          mode: string;
        };
        expect(namaEoFilter).toBeDefined();
        expect(namaEoFilter.contains).toBe(search);
        expect(namaEoFilter.mode).toBe("insensitive");
      }),
      { numRuns: 100 },
    );
  });

  it("for PIC role, assignments filter with picId and isActive is always added", async () => {
    /**
     * **Validates: Requirements 9.1**
     *
     * For any PIC user and any filter combination, the where clause must
     * always include an assignments filter restricting to the PIC's active assignments.
     */
    await fc.assert(
      fc.asyncProperty(filterArb, picUserArb, async (filters, user) => {
        let capturedWhere: Prisma.LeadWhereInput | null = null;

        mockFindAll.mockImplementation((where: Prisma.LeadWhereInput) => {
          capturedWhere = where;
          return Promise.resolve([]);
        });
        mockCount.mockResolvedValue(0);

        await leadService.findAll(filters, user);

        expect(capturedWhere).not.toBeNull();
        const where = capturedWhere!;

        // PIC restriction must always be present
        expect(where.assignments).toBeDefined();
        const assignmentSome = (where.assignments as { some: Record<string, unknown> }).some;
        expect(assignmentSome.picId).toBe(user.userId);
        expect(assignmentSome.isActive).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
