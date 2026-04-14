# Dokumen Requirements — SCO Lead Management

## Pendahuluan

SCO (Semesta Creative Organizer) adalah unit baru yang bergerak di bidang event organizer. Unit ini aktif mencari dan mengembangkan kerja sama dengan EO/Mitra. Saat ini proses pencatatan data EO/Mitra, assignment PIC, serta tracking aktivitas follow-up masih dilakukan secara manual dan belum terpusat. Aplikasi internal ini bertujuan menyediakan sistem terpusat untuk mengelola data EO/Mitra, assignment PIC, tracking status pipeline, serta dokumentasi aktivitas follow-up secara terstruktur dan terukur.

## Glosarium

- **Sistem**: Aplikasi internal SCO Lead Management secara keseluruhan (backend API dan frontend web).
- **Lead**: Data calon partner (EO/Mitra) yang akan diprospek oleh tim SCO. Ditampilkan di UI sebagai "EO/Mitra".
- **Contact_Person**: Data kontak yang terkait dengan sebuah Lead, terdiri dari nama, nomor telepon, dan jabatan. Satu Lead dapat memiliki lebih dari satu Contact_Person.
- **PIC**: Peran Business Development yang bertanggung jawab melakukan follow-up terhadap Lead yang di-assign kepadanya.
- **Superior**: Peran atasan yang dapat melihat seluruh data, melakukan assign/re-assign Lead ke PIC, dan memonitor performa tim.
- **Superadmin**: Peran dengan akses penuh termasuk CRUD data Lead, CRUD master user, dan soft delete.
- **Tipe_Lead**: Kategori jenis Lead (contoh: EO, Venue, Pemerintahan, Komunitas, UMKM, Mitra/Tenant). Merupakan master data yang dapat dikelola oleh Superadmin dan Superior.
- **Status_Pipeline**: Status progres Lead yang mengikuti urutan transisi tertentu: New Lead, Contacted, In Discussion, Pitching, Negotiation, On Hold, Deal, Lost.
- **Activity**: Catatan aktivitas follow-up yang dilakukan PIC terhadap Lead, dengan tipe: Call, Chat, atau Visit.
- **Assignment**: Relasi penugasan satu Lead ke satu PIC yang aktif pada satu waktu.
- **Audit_Trail**: Catatan perubahan pada entitas Lead, Assignment, Status, dan Activity yang mencatat nilai sebelum dan sesudah perubahan.
- **Evidence**: File bukti kunjungan berupa gambar (JPG/PNG, maks 5MB) yang wajib diunggah saat Activity bertipe Visit.

## Requirements

### Requirement 1: Manajemen Data Lead

**User Story:** Sebagai pengguna SCO, saya ingin mengelola data EO/Mitra secara terpusat, sehingga pencatatan data calon partner terstruktur dan mudah diakses.

#### Acceptance Criteria

1. WHEN Superadmin atau Superior atau PIC membuat Lead baru dengan data yang valid, THE Sistem SHALL menyimpan Lead dengan status awal "New Lead" dan mencatat created_at secara otomatis.
2. THE Sistem SHALL menyimpan field Lead berikut: nama_eo (string, wajib, unik), tipe (wajib, dari master Tipe_Lead), alamat (string, wajib), speciality (string, opsional), link_sosmed (string, opsional), last_activity_date (datetime, otomatis), last_activity_type (string, otomatis), created_at (datetime), is_deleted (boolean), deleted_at (datetime, opsional).
3. WHEN pengguna membuat atau memperbarui Lead dengan nama_eo yang sudah ada (perbandingan case-insensitive dan trimmed), THE Sistem SHALL menolak operasi tersebut dan menampilkan pesan error duplikasi.
4. WHEN Superadmin melakukan soft delete terhadap Lead, THE Sistem SHALL mengubah is_deleted menjadi true dan mencatat deleted_at, tanpa menghapus data secara permanen.
5. WHEN Superadmin atau Superior memperbarui data Lead, THE Sistem SHALL menyimpan perubahan dan mencatat perubahan di Audit_Trail.
6. WHILE pengguna dengan role PIC mengakses daftar Lead, THE Sistem SHALL hanya menampilkan Lead yang di-assign kepada PIC tersebut.
7. WHILE pengguna dengan role Superior mengakses daftar Lead, THE Sistem SHALL menampilkan seluruh data Lead.

### Requirement 2: Manajemen Contact Person

**User Story:** Sebagai pengguna SCO, saya ingin mencatat beberapa Contact Person untuk setiap Lead, sehingga informasi kontak calon partner terdokumentasi lengkap.

#### Acceptance Criteria

1. WHEN pengguna menambahkan Contact_Person ke sebuah Lead dengan data yang valid (nama, no_telp, jabatan wajib diisi), THE Sistem SHALL menyimpan Contact_Person tersebut dan mengaitkannya dengan Lead terkait.
2. THE Sistem SHALL mendukung relasi one-to-many antara Lead dan Contact_Person, sehingga satu Lead dapat memiliki lebih dari satu Contact_Person.
3. WHEN pengguna memperbarui data Contact_Person, THE Sistem SHALL menyimpan perubahan dan mencatat perubahan di Audit_Trail.

### Requirement 3: Manajemen Master User

**User Story:** Sebagai Superadmin, saya ingin mengelola data user (PIC, Superior, Superadmin), sehingga hak akses dan data tim SCO terkelola dengan baik.

#### Acceptance Criteria

1. WHEN Superadmin membuat user baru dengan data yang valid (nama, employee_id, phone_number, role), THE Sistem SHALL menyimpan data user tersebut.
2. WHEN Superadmin memperbarui data user, THE Sistem SHALL menyimpan perubahan data user.
3. WHEN Superadmin melakukan soft delete terhadap user, THE Sistem SHALL mengubah is_deleted menjadi true dan mencatat deleted_at, tanpa menghapus data secara permanen.
4. THE Sistem SHALL menyimpan field User berikut: nama (string), employee_id (string), phone_number (string), role (enum: Superadmin, Superior, PIC), is_deleted (boolean), deleted_at (datetime, opsional).

### Requirement 4: Manajemen Tipe Lead

**User Story:** Sebagai Superadmin atau Superior, saya ingin mengelola master data Tipe Lead, sehingga kategori EO/Mitra dapat disesuaikan sesuai kebutuhan.

#### Acceptance Criteria

1. WHEN Superadmin atau Superior menambahkan Tipe_Lead baru, THE Sistem SHALL menyimpan Tipe_Lead tersebut ke master data.
2. THE Sistem SHALL menyediakan Tipe_Lead default berikut: EO, Venue, Pemerintahan, Komunitas, UMKM, Mitra/Tenant.
3. WHEN pengguna membuat Lead, THE Sistem SHALL memvalidasi bahwa tipe yang dipilih ada di master data Tipe_Lead.

### Requirement 5: Assignment Lead ke PIC

**User Story:** Sebagai Superior, saya ingin meng-assign dan re-assign Lead ke PIC, sehingga setiap Lead memiliki penanggung jawab yang jelas.

#### Acceptance Criteria

1. WHEN Superior meng-assign Lead ke PIC, THE Sistem SHALL membuat record Assignment dengan assigned_at, menandai assignment sebagai aktif (is_active = true), dan mencatat perubahan di Audit_Trail.
2. THE Sistem SHALL memastikan setiap Lead hanya memiliki satu PIC aktif pada satu waktu.
3. WHEN Superior melakukan re-assign Lead ke PIC baru, THE Sistem SHALL menonaktifkan assignment lama (is_active = false), mencatat reassigned_at dan reassigned_notes, membuat assignment baru untuk PIC baru, dan mempertahankan seluruh riwayat Activity dan Status sebelumnya.
4. WHEN Lead di-reassign ke PIC baru, THE Sistem SHALL memastikan PIC baru dapat melanjutkan update status tetapi tidak dapat mengedit Activity yang dibuat oleh PIC sebelumnya.
5. THE Sistem SHALL menyimpan histori assignment termasuk PIC sebelumnya, tanggal assign, dan tanggal reassign.

### Requirement 6: Status Pipeline Tracking

**User Story:** Sebagai pengguna SCO, saya ingin melacak status progres setiap Lead melalui pipeline, sehingga progress follow-up termonitor dengan jelas.

#### Acceptance Criteria

1. THE Sistem SHALL mendukung status pipeline berikut: New Lead, Contacted, In Discussion, Pitching, Negotiation, On Hold, Deal, Lost.
2. THE Sistem SHALL menerapkan aturan transisi status berikut secara ketat:
   - New Lead → Contacted
   - Contacted → In Discussion
   - In Discussion → Pitching atau On Hold
   - Pitching → Negotiation atau Lost
   - Negotiation → Deal atau Lost
   - On Hold → In Discussion
3. WHEN pengguna mencoba melakukan transisi status yang tidak sesuai aturan, THE Sistem SHALL menolak perubahan tersebut dan menampilkan pesan error yang menjelaskan transisi yang diperbolehkan.
4. WHEN pengguna memperbarui status Lead, THE Sistem SHALL mencatat status baru, updated_at, dan updated_by di tabel Leads_Status, serta mencatat perubahan di Audit_Trail.
5. WHEN pengguna mencoba memperbarui status Lead tanpa membuat Activity terlebih dahulu, THE Sistem SHALL menolak perubahan status dan menampilkan pesan bahwa Activity harus dibuat sebelum update status.

### Requirement 7: Activity Log

**User Story:** Sebagai PIC, saya ingin mencatat aktivitas follow-up (Call, Chat, Visit) terhadap Lead yang di-assign, sehingga seluruh interaksi terdokumentasi.

#### Acceptance Criteria

1. WHEN PIC membuat Activity baru untuk Lead yang di-assign kepadanya, THE Sistem SHALL menyimpan Activity dengan field: activity_type (enum: Call, Chat, Visit), notes (wajib), next_follow_up_date (wajib), evidence (wajib jika activity_type = Visit), dan created_at secara otomatis.
2. WHEN PIC membuat Activity baru, THE Sistem SHALL memperbarui field last_activity_date dan last_activity_type pada Lead terkait berdasarkan Activity terbaru.
3. IF PIC mencoba membuat Activity tanpa mengisi notes, THEN THE Sistem SHALL menolak operasi dan menampilkan pesan bahwa notes wajib diisi.
4. WHILE pengguna dengan role Superior mengakses Activity log, THE Sistem SHALL menampilkan seluruh Activity dari semua Lead tanpa kemampuan mengubah Activity yang dibuat oleh PIC.
5. WHEN PIC membuat Activity dengan tipe Visit tanpa mengunggah Evidence, THE Sistem SHALL menolak operasi dan menampilkan pesan bahwa bukti kunjungan wajib diunggah.

### Requirement 8: Upload Bukti Kunjungan

**User Story:** Sebagai PIC, saya ingin mengunggah bukti kunjungan saat melakukan Visit, sehingga aktivitas kunjungan dapat diverifikasi.

#### Acceptance Criteria

1. WHEN PIC mengunggah file Evidence untuk Activity bertipe Visit, THE Sistem SHALL memvalidasi bahwa file berformat JPG atau PNG.
2. WHEN PIC mengunggah file Evidence yang melebihi 5MB, THE Sistem SHALL menolak unggahan dan menampilkan pesan bahwa ukuran file maksimal adalah 5MB.
3. WHEN file Evidence valid diunggah, THE Sistem SHALL menyimpan file dan mengaitkan path file tersebut dengan record Activity terkait.

### Requirement 9: Monitoring dan Filter Lead

**User Story:** Sebagai Superior atau Superadmin, saya ingin memfilter dan mencari data Lead, sehingga monitoring progress tim lebih mudah dan efisien.

#### Acceptance Criteria

1. THE Sistem SHALL menyediakan fitur filter pada halaman monitoring Lead berdasarkan: Status, PIC, Tipe, dan Last Activity Date.
2. THE Sistem SHALL menyediakan fitur pencarian (search) pada halaman monitoring Lead berdasarkan nama EO/Mitra.
3. WHEN pengguna menerapkan satu atau lebih filter, THE Sistem SHALL menampilkan hanya Lead yang sesuai dengan seluruh kriteria filter yang dipilih.
4. WHEN pengguna menerapkan filter dan pencarian secara bersamaan, THE Sistem SHALL menampilkan Lead yang memenuhi kriteria filter dan kata kunci pencarian.

### Requirement 10: Audit Trail

**User Story:** Sebagai pengguna SCO, saya ingin seluruh perubahan data tercatat di audit trail, sehingga riwayat perubahan dapat ditelusuri.

#### Acceptance Criteria

1. WHEN terjadi perubahan pada entitas Lead, Assignment, Status, atau Activity, THE Sistem SHALL mencatat record Audit_Trail dengan field: entity_name, entity_id, changed_by, previous_value, new_value, dan change_time.
2. THE Sistem SHALL menyimpan Audit_Trail secara immutable sehingga record yang sudah tercatat tidak dapat diubah atau dihapus.
3. WHEN Lead di-reassign ke PIC baru, THE Sistem SHALL mempertahankan seluruh Audit_Trail dari PIC sebelumnya dan mengaitkannya dengan Lead tersebut.

### Requirement 11: Otorisasi Berbasis Role

**User Story:** Sebagai pengelola sistem, saya ingin akses fitur dibatasi berdasarkan role pengguna, sehingga keamanan dan integritas data terjaga.

#### Acceptance Criteria

1. WHILE pengguna dengan role Superadmin mengakses Sistem, THE Sistem SHALL mengizinkan operasi Create, Read, Update, dan Soft Delete pada data Lead serta CRUD pada master User.
2. WHILE pengguna dengan role Superior mengakses Sistem, THE Sistem SHALL mengizinkan operasi Create, Read, dan Update pada data Lead, assign/re-assign Lead ke PIC, serta melihat seluruh data dan Activity tanpa dapat mengubah Activity yang dibuat PIC.
3. WHILE pengguna dengan role PIC mengakses Sistem, THE Sistem SHALL mengizinkan operasi Create Lead, Read dan Update hanya pada Lead yang di-assign kepadanya, membuat Activity, dan mengunggah Evidence.
4. WHEN pengguna mencoba mengakses resource atau operasi di luar hak akses role-nya, THE Sistem SHALL menolak akses dan mengembalikan response error otorisasi.
5. WHILE pengguna dengan role PIC mengakses Lead yang tidak di-assign kepadanya, THE Sistem SHALL menolak akses dan mengembalikan response error otorisasi.
