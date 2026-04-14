import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { evidenceFileSchema } from "../../../backend/src/validators/file.validator";

/**
 * Feature: sco-lead-management, Property 14: Validasi file evidence (format dan ukuran)
 * Validates: Requirements 8.1, 8.2
 *
 * For any file uploaded as evidence, the file is accepted if and only if
 * its format is JPG or PNG and its size does not exceed 5MB.
 * Files with other formats or size > 5MB must be rejected.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// --- Arbitraries ---

const validMimetypeArb = fc.constantFrom("image/jpeg", "image/png");

const invalidMimetypeArb = fc.constantFrom(
  "application/pdf",
  "text/plain",
  "image/gif",
  "image/webp",
  "image/bmp",
  "application/zip",
  "video/mp4",
  "audio/mpeg",
  "application/octet-stream",
  "text/html",
);

/** Valid file size: 0 to 5MB inclusive */
const validSizeArb = fc.integer({ min: 0, max: MAX_FILE_SIZE });

/** Invalid file size: strictly greater than 5MB */
const invalidSizeArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 4 });

// =============================================================================
// Property 14: Validasi file evidence (format dan ukuran)
// =============================================================================

describe("Feature: sco-lead-management, Property 14: Validasi file evidence (format dan ukuran)", () => {
  /**
   * **Validates: Requirements 8.1, 8.2**
   *
   * Files with valid mimetype (image/jpeg or image/png) AND size <= 5MB
   * should always pass validation.
   */
  it("should accept files with valid mimetype (image/jpeg, image/png) and size <= 5MB", () => {
    fc.assert(
      fc.property(validMimetypeArb, validSizeArb, (mimetype, size) => {
        const result = evidenceFileSchema.safeParse({ mimetype, size });
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 8.1**
   *
   * Files with invalid mimetype should always fail validation,
   * regardless of file size.
   */
  it("should reject files with invalid mimetype", () => {
    fc.assert(
      fc.property(invalidMimetypeArb, validSizeArb, (mimetype, size) => {
        const result = evidenceFileSchema.safeParse({ mimetype, size });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 8.2**
   *
   * Files with size > 5MB should always fail validation,
   * regardless of mimetype.
   */
  it("should reject files with size exceeding 5MB", () => {
    fc.assert(
      fc.property(validMimetypeArb, invalidSizeArb, (mimetype, size) => {
        const result = evidenceFileSchema.safeParse({ mimetype, size });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 8.1, 8.2**
   *
   * Files with both invalid mimetype AND size > 5MB should also fail.
   */
  it("should reject files with both invalid mimetype and size exceeding 5MB", () => {
    fc.assert(
      fc.property(invalidMimetypeArb, invalidSizeArb, (mimetype, size) => {
        const result = evidenceFileSchema.safeParse({ mimetype, size });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
