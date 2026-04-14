import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors";

interface MulterError extends Error {
  code?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data tidak valid",
        details: err.errors,
      },
    });
    return;
  }

  // Multer file size error
  if ((err as MulterError).code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Ukuran file maksimal adalah 5MB",
      },
    });
    return;
  }

  // Unexpected errors
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan internal",
    },
  });
}
