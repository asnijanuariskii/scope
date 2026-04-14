export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Token tidak valid atau tidak ditemukan") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki akses untuk operasi ini") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(404, "NOT_FOUND", `${entity} dengan ID ${id} tidak ditemukan`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}

export class FileTooLargeError extends AppError {
  constructor() {
    super(413, "FILE_TOO_LARGE", "Ukuran file maksimal adalah 5MB");
  }
}

export class InvalidFileTypeError extends AppError {
  constructor() {
    super(415, "INVALID_FILE_TYPE", "File harus berformat JPG atau PNG");
  }
}
