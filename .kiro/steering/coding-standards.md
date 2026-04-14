---
inclusion: auto
---

# Coding Standards

## General
- Write minimal code. Every line must earn its place.
- Clear, readable names: `snake_case` for backend, `camelCase` for frontend.
- Short functions. One function does one thing.
- Return early on errors. Avoid deep nesting.
- No dead code. No unnecessary abstractions.

## API
- Consistent response format across all endpoints.
- Validate and sanitize all input at API boundary.

## Database
- UUID primary keys.
- `TIMESTAMPTZ` for all date/time columns.
- `BIGINT` for money (store in smallest unit, e.g. cents).

## AI Coding Pitfalls to Avoid

1. Race conditions in async flows — never write only the happy path. Consider concurrent requests, double-clicks, overlapping async calls, shared mutable state. Use DB transactions or mutex where needed.

2. Silent error swallowing — never write try/catch that catches everything and logs nothing. Every catch must log with context or re-throw.

3. Naive retry logic — never retry without exponential backoff and max retry limit. Backoff: 1s, 2s, 4s, give up. Max 3 retries.

4. State assumptions — never assume clean state. Production has dirty data, partial writes, null fields. Always validate state before acting.

5. Missing idempotency — every payment handler, webhook, and state-changing API must be idempotent. Use unique request IDs, ON CONFLICT upserts, and idempotency keys.
