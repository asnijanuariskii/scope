# Implementation Plan: SCO Lead Management

## Overview

Implementasi full-stack aplikasi SCO Lead Management menggunakan Node.js + Express + TypeScript (backend), React + TypeScript (frontend), PostgreSQL + Prisma (database), dan Vitest + fast-check (testing). Setiap task membangun di atas task sebelumnya secara inkremental.

## Tasks

- [ ] 1. Setup project structure dan konfigurasi dasar
  - [ ] 1.1 Inisialisasi backend project
    - Buat `backend/package.json` dengan dependencies: express, prisma, @prisma/client, zod, jsonwebtoken, multer, cors, dotenv
    - Buat `backend/tsconfig.json` dengan konfigurasi TypeScript strict mode
    - Buat `backend/src/index.ts` sebagai entry point Express server
    - Buat file `.env.example` dengan variabel: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, UPLOAD_DIR, PORT
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 Inisialisasi frontend project
    - Buat React + TypeScript project di `frontend/` menggunakan Vite
    - Install dependencies: react-router-dom, @tanstack/react-query, zod, axios
    - Konfigurasi `vite.config.ts` dengan proxy ke backend API
    - _Requirements: 9.1, 9.2_

  - [ ] 1.3 Setup testing framework
    - Install vitest, fast-check, supertest, @types/supertest di root atau backend
    - Buat `vitest.config.ts` dengan konfigurasi untuk backend tests
    - Buat test helper untuk Prisma transaction rollback
    - _Requirements: semua (testing infrastructure)_

- [ ] 2. Database schema dan Prisma setup
  - [ ] 2.1 Buat Prisma schema dan migrasi
    - Buat `backend/prisma/schema.prisma` dengan semua 8 model: User, Lead, TipeLead, ContactPerson, Assignment, LeadStatus, Activity, AuditTrail
    - Definisikan enum: Role (SUPERADMIN, SUPERIOR, PIC), PipelineStatus (8 status), ActivityType (CALL, CHAT, VISIT)
    - Tambahkan relasi, unique constraints (nama_eo case-insensitive, employee_id), index (audit_trail entity_name + entity_id)
    - Jalankan `prisma migrate dev` untuk generate migrasi
    - _Requirements: 1.2, 2.2, 3.4, 4.1, 4.2, 5.5, 6.1, 6.4, 7.1, 10.1_

  - [ ] 2.2 Buat seed data untuk Tipe Lead default
    - Buat `backend/prisma/seed.ts` dengan data default: EO, Venue, Pemerintahan, Komunitas, UMKM, Mitra/Tenant
    - Buat seed untuk user Superadmin awal
    - _Requirements: 4.2_

- [ ] 3. Backend core: error handling, validation, dan middleware
  - [ ] 3.1 Implementasi custom error classes
    - Buat `backend/src/errors/index.ts` dengan class: AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, FileTooLargeError, InvalidFileTypeError
    - Buat global error handler middleware di `backend/src/middleware/error-handler.ts`
    - Handle AppError, ZodError, Multer LIMIT_FILE_SIZE, dan unexpected errors
    - _Requirements: 1.3, 6.3, 6.5, 7.3, 7.5, 8.1, 8.2, 11.4_

  - [ ] 3.2 Implementasi Zod validation schemas
    - Buat `backend/src/validators/lead.validator.ts` — createLeadSchema, updateLeadSchema, leadFilterSchema
    - Buat `backend/src/validators/contact.validator.ts` — createContactSchema, updateContactSchema
    - Buat `backend/src/validators/user.validator.ts` — createUserSchema, updateUserSchema
    - Buat `backend/src/validators/activity.validator.ts` — createActivitySchema
    - Buat `backend/src/validators/status.validator.ts` — updateStatusSchema
    - Buat `backend/src/validators/file.validator.ts` — evidenceFileSchema
    - Buat validation middleware factory di `backend/src/middleware/validate.ts`
    - _Requirements: 1.2, 1.3, 2.1, 3.1, 3.4, 7.1, 7.3, 8.1, 8.2_

  - [ ] 3.3 Implementasi Auth middleware (JWT)
    - Buat `backend/src/middleware/auth.ts` — verifikasi JWT dari header Authorization
    - Decode payload { userId, role, employeeId } dan attach ke `req.user`
    - Handle token expired, invalid token, missing token
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 3.4 Implementasi RBAC middleware
    - Buat `backend/src/middleware/rbac.ts` — factory function `authorize(...allowedRoles)`
    - Buat Lead ownership middleware untuk PIC — verifikasi assignment aktif
    - Return 403 jika role tidak sesuai atau PIC bukan assignee aktif
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 3.5 Write property tests untuk RBAC
    - **Property 17: RBAC menolak akses di luar hak role**
    - **Validates: Requirements 11.4**

  - [ ]* 3.6 Write property tests untuk PIC ownership
    - **Property 5: PIC hanya melihat Lead yang di-assign kepadanya**
    - **Validates: Requirements 1.6, 11.5**

- [ ] 4. Checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementasi User Management (CRUD)
  - [ ] 5.1 Implementasi User repository dan service
    - Buat `backend/src/repositories/user.repository.ts` — CRUD operations dengan soft delete
    - Buat `backend/src/services/user.service.ts` — business logic: create, findAll, findById, update, softDelete
    - Pastikan soft delete mengubah is_deleted=true dan mencatat deleted_at
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 5.2 Implementasi User routes
    - Buat `backend/src/routes/user.routes.ts` — POST, GET (list), GET (detail), PUT, DELETE
    - Terapkan auth middleware, RBAC (Superadmin only), dan validation middleware
    - _Requirements: 3.1, 3.2, 3.3, 11.1_

  - [ ]* 5.3 Write property test untuk soft delete User
    - **Property 3: Soft delete mengubah is_deleted dan mencatat deleted_at**
    - **Validates: Requirements 3.3**

- [ ] 6. Implementasi Tipe Lead Management
  - [ ] 6.1 Implementasi Tipe Lead repository, service, dan routes
    - Buat `backend/src/repositories/tipe-lead.repository.ts`
    - Buat `backend/src/services/tipe-lead.service.ts`
    - Buat `backend/src/routes/tipe-lead.routes.ts` — POST (Superadmin, Superior), GET (All)
    - Validasi nama unik
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 6.2 Write property test untuk validasi tipe Lead
    - **Property 18: Validasi tipe Lead terhadap master data**
    - **Validates: Requirements 4.3**

- [ ] 7. Implementasi Lead Management (CRUD)
  - [ ] 7.1 Implementasi Lead repository dan service
    - Buat `backend/src/repositories/lead.repository.ts` — CRUD dengan soft delete, filter, search, pagination
    - Buat `backend/src/services/lead.service.ts` — create (auto status NEW_LEAD), findAll (filtered by role), findById, update, softDelete
    - Implementasi case-insensitive uniqueness check untuk nama_eo (trim + lowercase comparison)
    - Implementasi filter: status, pic_id, tipe_id, last_activity_date range, search (nama_eo case-insensitive)
    - Pastikan PIC hanya melihat Lead yang di-assign kepadanya
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 9.1, 9.2, 9.3, 9.4_

  - [ ] 7.2 Implementasi Lead routes
    - Buat `backend/src/routes/lead.routes.ts` — POST, GET (list), GET (detail), PUT, DELETE
    - Terapkan auth, RBAC, validation, dan ownership middleware sesuai endpoint
    - POST: Superadmin, Superior, PIC | PUT: Superadmin, Superior | DELETE: Superadmin only
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 11.1, 11.2, 11.3_

  - [ ]* 7.3 Write property tests untuk Lead creation dan uniqueness
    - **Property 1: Lead baru selalu berstatus New Lead**
    - **Property 2: Uniqueness nama_eo bersifat case-insensitive dan trimmed**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 7.4 Write property test untuk soft delete Lead
    - **Property 3: Soft delete mengubah is_deleted dan mencatat deleted_at**
    - **Validates: Requirements 1.4**

  - [ ]* 7.5 Write property tests untuk filter dan pencarian Lead
    - **Property 15: Filter dan pencarian Lead menggunakan logika AND**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 8. Implementasi Contact Person Management
  - [ ] 8.1 Implementasi Contact Person repository, service, dan routes
    - Buat `backend/src/repositories/contact.repository.ts`
    - Buat `backend/src/services/contact.service.ts` — create, findByLead, update
    - Buat `backend/src/routes/contact.routes.ts` — POST, GET, PUT (nested under /api/leads/:leadId/contacts)
    - Validasi field wajib: nama, no_telp, jabatan
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9. Checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implementasi Assignment (Assign/Re-assign PIC)
  - [ ] 10.1 Implementasi Assignment repository dan service
    - Buat `backend/src/repositories/assignment.repository.ts`
    - Buat `backend/src/services/assignment.service.ts` — assign, reassign, getHistory, getActiveAssignment
    - Pastikan hanya satu PIC aktif per Lead (deactivate assignment lama saat reassign)
    - Saat reassign: set is_active=false pada assignment lama, catat reassigned_at dan reassigned_notes, buat assignment baru
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 10.2 Implementasi Assignment routes
    - Buat `backend/src/routes/assignment.routes.ts` — POST assign (Superior), GET history (Superadmin, Superior)
    - Nested under /api/leads/:leadId/assignments
    - _Requirements: 5.1, 11.2_

  - [ ]* 10.3 Write property tests untuk Assignment
    - **Property 8: Setiap Lead hanya memiliki satu PIC aktif**
    - **Property 9: Re-assign menonaktifkan assignment lama dan membuat assignment baru**
    - **Validates: Requirements 5.2, 5.3**

- [ ] 11. Implementasi Status Pipeline
  - [ ] 11.1 Implementasi Status Pipeline service
    - Buat `backend/src/services/status-pipeline.service.ts` — updateStatus, getHistory, validateTransition
    - Implementasi STATUS_TRANSITIONS map sesuai state machine di design
    - Validasi: transisi harus sesuai aturan, Lead harus punya minimal 1 Activity sebelum update status
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 11.2 Implementasi Status Pipeline routes
    - Buat `backend/src/routes/status.routes.ts` — POST update status, GET history
    - Nested under /api/leads/:leadId/status
    - Terapkan auth, RBAC (Superadmin, Superior, PIC), dan ownership middleware
    - _Requirements: 6.1, 6.4, 11.1, 11.2, 11.3_

  - [ ]* 11.3 Write property tests untuk Status Pipeline
    - **Property 6: Transisi status pipeline mengikuti aturan ketat**
    - **Property 7: Status tidak dapat diperbarui tanpa Activity**
    - **Validates: Requirements 6.2, 6.3, 6.5**

- [ ] 12. Implementasi Activity Log dan Evidence Upload
  - [ ] 12.1 Implementasi Activity service
    - Buat `backend/src/services/activity.service.ts` — create, findByLead, update
    - Validasi: notes wajib (tidak kosong/whitespace), Visit wajib evidence
    - Update last_activity_date dan last_activity_type pada Lead setelah Activity dibuat
    - PIC hanya bisa edit Activity miliknya sendiri (cek created_by)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 12.2 Implementasi Evidence upload dengan Multer
    - Buat `backend/src/middleware/upload.ts` — konfigurasi Multer: dest folder, file filter (JPG/PNG only), size limit (5MB)
    - Buat `backend/src/routes/evidence.routes.ts` — POST upload, GET download/view
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 12.3 Implementasi Activity routes
    - Buat `backend/src/routes/activity.routes.ts` — POST, GET, PUT
    - Nested under /api/leads/:leadId/activities
    - POST dan PUT: PIC only (dengan ownership check), GET: All (filtered by role)
    - _Requirements: 7.1, 7.4, 11.3_

  - [ ]* 12.4 Write property tests untuk Activity
    - **Property 11: Activity memperbarui last_activity pada Lead**
    - **Property 12: Activity tanpa notes ditolak**
    - **Property 13: Activity Visit tanpa evidence ditolak**
    - **Validates: Requirements 7.2, 7.3, 7.5**

  - [ ]* 12.5 Write property test untuk file upload
    - **Property 14: Validasi file evidence (format dan ukuran)**
    - **Validates: Requirements 8.1, 8.2**

  - [ ]* 12.6 Write property test untuk PIC ownership pada Activity
    - **Property 10: PIC baru tidak dapat mengedit Activity PIC sebelumnya**
    - **Validates: Requirements 5.4**

- [ ] 13. Implementasi Audit Trail
  - [ ] 13.1 Implementasi Audit Trail service
    - Buat `backend/src/services/audit-trail.service.ts` — log, getByEntity, getByLead
    - Catat previous_value dan new_value sebagai JSON
    - Pastikan Audit Trail immutable (tidak ada update/delete endpoint)
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 13.2 Integrasikan Audit Trail ke semua service yang relevan
    - Tambahkan audit logging di: LeadService (create, update, softDelete), ContactService (create, update), AssignmentService (assign, reassign), StatusPipelineService (updateStatus), ActivityService (create, update)
    - _Requirements: 1.5, 2.3, 5.1, 6.4, 10.1_

  - [ ] 13.3 Implementasi Audit Trail routes
    - Buat `backend/src/routes/audit-trail.routes.ts` — GET /api/leads/:leadId/audit-trail
    - RBAC: Superadmin dan Superior only
    - _Requirements: 10.1, 10.2, 11.1, 11.2_

  - [ ]* 13.4 Write property tests untuk Audit Trail
    - **Property 4: Setiap mutasi pada entitas yang dilacak menghasilkan Audit Trail**
    - **Property 16: Audit Trail bersifat immutable**
    - **Validates: Requirements 1.5, 2.3, 6.4, 10.1, 10.2**

- [ ] 14. Wiring backend: register semua routes dan middleware
  - Daftarkan semua route modules di `backend/src/index.ts` atau `backend/src/app.ts`
  - Pasang middleware stack: CORS → Body Parser → Auth → Routes → Error Handler
  - Buat `backend/src/routes/index.ts` sebagai central route registry
  - _Requirements: semua_

- [ ] 15. Checkpoint — Pastikan semua backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Frontend: setup dan shared components
  - [ ] 16.1 Setup frontend structure dan konfigurasi
    - Buat folder structure: components/, hooks/, services/, types/, utils/, pages/
    - Buat `frontend/src/types/index.ts` — TypeScript interfaces untuk semua entity (Lead, User, Activity, dll)
    - Buat `frontend/src/services/api.ts` — Axios instance dengan JWT interceptor
    - Setup React Query provider di `frontend/src/App.tsx`
    - Setup React Router dengan route definitions
    - _Requirements: semua (frontend infrastructure)_

  - [ ] 16.2 Implementasi Auth context dan login flow
    - Buat `frontend/src/context/AuthContext.tsx` — JWT token management, user state
    - Buat `frontend/src/pages/LoginPage.tsx` — form login
    - Buat protected route wrapper yang redirect ke login jika belum auth
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 16.3 Implementasi layout components
    - Buat `frontend/src/components/layout/Sidebar.tsx` — navigasi berdasarkan role
    - Buat `frontend/src/components/layout/Header.tsx` — info user, logout
    - Buat `frontend/src/components/layout/MainLayout.tsx` — wrapper layout utama
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 16.4 Implementasi shared/reusable components
    - Buat komponen: Button, Modal, Input, Select, FileUpload, Pagination, StatusBadge
    - Pastikan komponen accessible (label, aria attributes)
    - _Requirements: semua (UI infrastructure)_

- [ ] 17. Frontend: halaman Lead Management
  - [ ] 17.1 Implementasi Lead list page dengan filter dan search
    - Buat `frontend/src/pages/LeadsPage.tsx` — tabel Lead dengan pagination
    - Buat `frontend/src/components/leads/LeadTable.tsx`
    - Buat `frontend/src/components/leads/LeadFilters.tsx` — filter: Status, PIC, Tipe, Last Activity Date
    - Buat `frontend/src/hooks/useLeads.ts` — React Query hook untuk fetch leads
    - Implementasi search bar untuk nama_eo
    - _Requirements: 1.6, 1.7, 9.1, 9.2, 9.3, 9.4_

  - [ ] 17.2 Implementasi Lead form (create/edit)
    - Buat `frontend/src/components/leads/LeadForm.tsx` — form dengan Zod validation
    - Field: nama_eo, tipe (dropdown dari master), alamat, speciality, link_sosmed
    - Handle create dan update mode
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 17.3 Implementasi Lead detail page
    - Buat `frontend/src/pages/LeadDetailPage.tsx` — tampilkan detail Lead, Contact Persons, Status history, Activities, Assignment info
    - Buat tabs atau sections untuk setiap bagian
    - _Requirements: 1.1, 2.2, 5.5, 6.1, 7.1_

- [ ] 18. Frontend: halaman Contact Person, Assignment, dan Status
  - [ ] 18.1 Implementasi Contact Person components
    - Buat `frontend/src/components/contacts/ContactList.tsx` — daftar contact per Lead
    - Buat `frontend/src/components/contacts/ContactForm.tsx` — form tambah/edit contact
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 18.2 Implementasi Assignment components
    - Buat `frontend/src/components/assignments/AssignmentForm.tsx` — form assign/reassign PIC (dropdown PIC)
    - Buat `frontend/src/components/assignments/AssignmentHistory.tsx` — histori assignment
    - _Requirements: 5.1, 5.3, 5.5_

  - [ ] 18.3 Implementasi Status Pipeline components
    - Buat `frontend/src/components/pipeline/StatusTransition.tsx` — dropdown status yang hanya menampilkan transisi valid
    - Buat `frontend/src/components/pipeline/PipelineBoard.tsx` — visualisasi pipeline (opsional: kanban view)
    - Buat `frontend/src/components/pipeline/StatusBadge.tsx` — badge warna per status
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 19. Frontend: halaman Activity dan Evidence
  - [ ] 19.1 Implementasi Activity components
    - Buat `frontend/src/components/activities/ActivityList.tsx` — daftar activity per Lead
    - Buat `frontend/src/components/activities/ActivityForm.tsx` — form create/edit activity (type, notes, next_follow_up_date)
    - Tampilkan evidence jika ada, disable edit untuk Activity milik PIC lain
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 19.2 Implementasi Evidence upload component
    - Buat `frontend/src/components/activities/EvidenceUpload.tsx` — file upload dengan preview, validasi client-side (JPG/PNG, max 5MB)
    - Tampilkan error message jika file tidak valid
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 20. Frontend: halaman User Management dan Audit Trail
  - [ ] 20.1 Implementasi User Management page
    - Buat `frontend/src/pages/UsersPage.tsx` — tabel user, form create/edit, soft delete
    - Hanya tampilkan untuk Superadmin
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.1_

  - [ ] 20.2 Implementasi Audit Trail view
    - Buat `frontend/src/components/audit/AuditTrailTable.tsx` — tabel audit trail per Lead
    - Tampilkan: entity_name, perubahan (previous → new), changed_by, change_time
    - Hanya tampilkan untuk Superadmin dan Superior
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2_

- [ ] 21. Checkpoint — Pastikan frontend dan backend terintegrasi
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Integrasi akhir dan wiring
  - [ ] 22.1 Buat Auth endpoints (login/refresh)
    - Buat `backend/src/routes/auth.routes.ts` — POST /api/auth/login, POST /api/auth/refresh
    - Implementasi JWT token generation (access + refresh)
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 22.2 Update OpenAPI spec
    - Update `docs/openapi.yaml` dengan semua endpoint, request/response schemas, dan error codes
    - _Requirements: semua_

  - [ ]* 22.3 Write integration tests
    - Buat integration tests di `tests/integration/` untuk flow utama: lead lifecycle, assignment pipeline, auth-rbac
    - Test end-to-end flows menggunakan Supertest
    - _Requirements: semua_

- [ ] 23. Final checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Task bertanda `*` bersifat opsional dan bisa dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoint memastikan validasi inkremental di setiap fase
- Property tests memvalidasi 18 correctness properties dari design document
- Unit tests memvalidasi contoh spesifik dan edge cases
