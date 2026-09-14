# 🎓 Sistem Informasi Akademik (SIAKAD) Universitas Suzuran - Frontend

Aplikasi frontend Sistem Informasi Akademik (SIAKAD) modern, responsif, dan kaya fitur yang dibangun menggunakan **React 19**, **Vite**, dan **Tailwind CSS v4**. Sistem ini dirancang untuk mendukung manajemen akademik terpadu dengan sistem Role-Based Access Control (RBAC) untuk **Admin**, **Dosen**, dan **Mahasiswa**.

---

## 📑 Daftar Isi
- [✨ Fitur Utama](#-fitur-utama)
- [👥 Hak Akses & Peran Pengguna (RBAC)](#-hak-akses--peran-pengguna-rbac)
- [🛠️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
- [📁 Struktur Direktori](#-struktur-direktori)
- [🚀 Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [🐳 Menjalankan dengan Docker](#-menjalankan-dengan-docker)
- [🌐 Konfigurasi Integrasi API (Backend)](#-konfigurasi-integrasi-api-backend)
- [🎨 Tema & UI/UX](#-tema--uiux)
- [⚡ Optimasi & Performa](#-optimasi--performa)

---

## ✨ Fitur Utama

### 1. 🔐 Autentikasi & Otorisasi Terpadu
- Login berbasis Bearer Token (tersimpan di `localStorage`).
- Proteksi route & sesi otomatis (Auto-redirect & auto-logout saat token kadaluarsa / 401).
- Otomatis menyesuaikan tampilan menu dan hak akses sesuai role pengguna.

### 2. 📊 Dashboard Interaktif
- Ringkasan statistik metrik akademik (Total Mahasiswa, Dosen, Kelas Aktif, Mata Kuliah, Fakultas, Prodi).
- Indikator visual Tahun Akademik & Semester aktif.
- Quick action cards dan data terkini.

### 3. 🏢 Manajemen Data Master (Admin)
- **Fakultas & Program Studi**: CRUD data fakultas dan prodi terintegrasi.
- **Tahun Akademik**: Manajemen semester, aktivasi tahun ajaran aktif secara instan.
- **Mata Kuliah**: Manajemen kode, nama, bobot SKS, dan program studi terkait.
- **Kelas Kuliah**: Pengaturan kelas, kapasitas, jadwal kuliah (hari, jam, ruangan), dan plotting multi-dosen pengampu.

### 4. 👨‍🏫 Portal Dosen (Lecturer Portal)
- **Daftar Kelas Aktif**: Melihat mata kuliah dan kelas yang sedang diampu pada semester berjalan.
- **Mahasiswa Bimbingan**: Rekapitulasi mahasiswa perwalian/PA (Dosen Pembimbing Akademik).
- **Manajemen Nilai (KHS)**: Input & kalkulasi nilai akhir serta huruf mutu mahasiswa secara instan.
- **Sistem Absensi / Presensi**: Pembuatan sesi pertemuan (meeting), rekap kehadiran mahasiswa (Hadir, Izin, Sakit, Alpa).
- **Manajemen Ujian**: Penjadwalan ujian UTS/UAS (ruangan, waktu, metode daring/luring, pengawas).

### 5. 🎓 Portal Mahasiswa (Student Portal)
- **KRS & KHS**: Pemilihan kelas kuliah, riwayat nilai per semester, kalkulasi IPS & IPK, serta fitur cetak KHS.
- **Jadwal Kuliah**: Kalender jadwal perkuliahan mingguan interaktif (accordion hari, jam, ruang, dosen) dan riwayat presensi mandiri.
- **Profil Mahasiswa**: Informasi identitas, prodi, fakultas, IPK akumulatif, dan dosen pembimbing akademik.

### 6. 👥 Manajemen Pengguna & Keamanan
- CRUD Akun Pengguna (`UserTab`) dengan pemetaan role dan relasi profil (Dosen/Mahasiswa/Admin).
- `DynamicFormModal` universal mendukung upload file foto profil (`FormData`) dan penanganan error validasi backend.
- Konfirmasi penghapusan data interaktif berbasis modal kustom untuk mencegah kesalahan penghapusan data.

---

## 👥 Hak Akses & Peran Pengguna (RBAC)

| Modul / Menu | Admin | Dosen | Mahasiswa | Keterangan |
| :--- | :---: | :---: | :---: | :--- |
| **Dashboard** | ✅ | ✅ | ✅ | Statistik & informasi semester aktif |
| **Fakultas & Prodi** | ✅ | ❌ | ❌ | Data master fakultas & prodi |
| **Tahun Akademik** | ✅ | ❌ | ❌ | Pengaturan semester aktif |
| **Data Dosen** | ✅ | ❌ | ❌ | Master data dosen & akun login |
| **Data Mahasiswa** | ✅ | ❌ | ❌ | Master data mahasiswa & akun login |
| **Mata Kuliah** | ✅ | ❌ | ❌ | Master kurikulum & SKS |
| **Kelas Kuliah** | ✅ | ❌ | ❌ | Penjadwalan & plotting dosen |
| **Portal Dosen** | ✅ | ✅ | ❌ | Penilaian KHS, Absensi, Ujian, Bimbingan |
| **KRS & KHS** | ✅ | ❌ | ✅ | Registrasi mata kuliah & cek nilai |
| **Jadwal Kuliah** | ❌ | ❌ | ✅ | Jadwal kuliah mingguan mahasiswa |
| **Manajemen User** | ✅ | ❌ | ❌ | Akun & kredensial pengguna |
| **Profil Saya** | ✅ *(Admin)* | ✅ *(Dosen)* | ✅ *(Mhs)* | Manajemen profil & info personal |

---

## 🛠️ Arsitektur & Teknologi

- **Library UI**: [React 19](https://react.dev/)
- **Build Tool & Dev Server**: [Vite 6](https://vite.dev/)
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/) dengan custom CSS variable tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Native `fetch` wrapper dengan interceptor token + `axios`
- **Font**: Google Fonts *(Lexend Deca)*
- **Containerization**: Docker & Docker Compose

---

## 📁 Struktur Direktori

```text
sia-universitas-suzuran-frontend/
├── Dockerfile                   # Konfigurasi container Docker frontend
├── docker-compose.yml           # Konfigurasi multi-container Docker
├── index.html                   # Entry point HTML aplikasi
├── package.json                 # Metadata proyek & daftar dependencies
├── vite.config.js               # Konfigurasi Vite & reverse proxy API backend
└── src/
    ├── assets/
    │   └── index.css            # Styling global, Tailwind v4 @theme, dan token warna
    ├── bootstrap.js             # Konfigurasi default axios & header AJAX
    ├── main.jsx                 # Entry point React root
    └── components/
        ├── App.jsx              # Komponen utama: routing, auth state, centralized CRUD
        ├── Header.jsx           # Top navbar: user status, semester aktif, switch tema, refresh
        ├── Sidebar.jsx          # Navigasi samping berbasis RBAC dan collapsible
        ├── Login.jsx            # Tampilan formulir login autentikasi
        ├── ThemeToggle.jsx      # Tombol beralih tema (Light, Dark, Custom Purple)
        ├── DynamicFormModal.jsx # Modal dinamis untuk CRUD seluruh entitas data
        ├── DashboardTab.jsx     # Tab ringkasan statistik dan metrik kampus
        ├── FakultasTab.jsx      # Tab CRUD data fakultas
        ├── ProdiTab.jsx         # Tab CRUD data program studi
        ├── TahunAkademikTab.jsx # Tab CRUD & toggle aktivasi tahun akademik
        ├── DosenTab.jsx         # Tab CRUD data dosen & penugasan
        ├── MahasiswaTab.jsx     # Tab CRUD data mahasiswa & profil
        ├── MataKuliahTab.jsx    # Tab CRUD data mata kuliah & bobot SKS
        ├── KelasKuliahTab.jsx   # Tab CRUD kelas, jadwal ruang/waktu, & dosen pengampu
        ├── KelasMahasiswaTab.jsx# Tab KRS, KHS, & transkrip nilai mahasiswa
        ├── JadwalKuliahTab.jsx  # Tab jadwal mingguan mahasiswa & riwayat absensi
        ├── LecturerPortalTab.jsx# Portal dosen: nilai, absensi pertemuan, ujian, perwalian
        ├── ProfilAdminTab.jsx   # Pengaturan & profil admin
        ├── ProfilDosenTab.jsx   # Informasi detail & profil dosen
        ├── ProfilMahasiswaTab.jsx # Informasi detail & profil mahasiswa
        ├── UserTab.jsx          # Manajemen akun user & email
        ├── RoleTab.jsx          # Halaman informasi peran sistem
        └── ui/                  # Komponen antarmuka modular
            ├── ActionButtons.jsx# Tombol aksi Edit/Delete seragam
            ├── MetricCard.jsx   # Komponen kartu statistik metrik
            ├── PageHeader.jsx   # Header judul & deskripsi halaman
            ├── PrimaryButton.jsx# Tombol aksi utama (Add/Save)
            ├── SearchInput.jsx  # Input pencarian seragam
            └── WelcomeBanner.jsx# Banner sambutan pengguna
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- **Node.js**: Versi 20.x atau lebih baru
- **npm**: Versi 10.x atau lebih baru
- **Backend API**: Server backend SIAKAD berjalan di `http://127.0.0.1:8000` (atau sesuaikan pada proxy)

### Langkah-langkah
1. **Clone repositori**:
   ```bash
   git clone https://github.com/MasGENJEH/sia-universitas-suzuran-frontend.git
   cd sia-universitas-suzuran-frontend
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173` (atau port yang dialokasikan oleh Vite).

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

5. **Pratinjau build produksi**:
   ```bash
   npm run preview
   ```

---

## 🐳 Menjalankan dengan Docker

Proyek ini telah dilengkapi dengan `Dockerfile` dan `docker-compose.yml` untuk kemudahan deployment:

```bash
# Build dan jalankan container di background
docker-compose up -d --build

# Cek log container
docker-compose logs -f frontend

# Hentikan container
docker-compose down
```

Aplikasi dapat diakses melalui port `http://localhost:5174`.

---

## 🌐 Konfigurasi Integrasi API (Backend)

Proxy telah dikonfigurasi di [vite.config.js](vite.config.js) untuk meneruskan permintaan `/api` dan `/storage` langsung ke backend Laravel di `http://127.0.0.1:8000`:

```javascript
server: {
  host: true,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
    '/storage': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

### Daftar Endpoint Utama Backend:
- **Autentikasi**: `POST /api/login`, `POST /api/logout`, `GET /api/user`
- **Data Master**: `/api/faculties`, `/api/study-programs`, `/api/academic-years`, `/api/courses`
- **Pengguna & Civitas**: `/api/lecturers`, `/api/students`, `/api/users`
- **Perkuliahan**: `/api/course-classes`, `/api/class-instructors`, `/api/enrollments`
- **Portal Dosen**:
  - `GET /api/lecturers/{id}/kelas-kuliah-aktif`
  - `GET /api/lecturers/{id}/mahasiswa-bimbingan`
  - `/api/absensis` (Rekap & input presensi)
  - `/api/exams` (Jadwal ujian)

---

## 🎨 Tema & UI/UX

Aplikasi mendukung 4 pilihan tema antarmuka yang dapat diganti sewaktu-waktu melalui tombol tema pada header atau login:
1. **Light Mode**: Bersih, modern dengan palet warna biru Monday.com (`#1053d5`).
2. **Dark Mode**: Elegan, kontras tinggi dan nyaman di mata (`#0f172a`).
3. **Theme Custom (Purple/Pink)**: Tema pastel kreatif ungu dan merah muda (`#462C7D`, `#FF70BF`).
4. **Theme Custom Dark**: Nuansa ungu gelap premium (`#11071F`).

---

## ⚡ Optimasi & Performa

- **Lazy Loading Tab (React.lazy + Suspense)**: Mengurangi ukuran initial bundle dengan memuat komponen tab hanya ketika dibuka oleh pengguna.
- **Lookup Maps O(1)**: Menggunakan `useMemo` hash map untuk relasi data master (misal: mencari nama prodi/dosen berdasarkan ID tanpa perulangan `Array.find` O(N)).
- **Targeted Entity Refresh**: Saat melakukan Create/Update/Delete (CUD), sistem hanya me-refresh entitas terkait (`refreshEntity('kelasMahasiswa')`) alih-alih me-request ulang seluruh 10 endpoint API secara bersamaan.
- **Debounced Search Query**: Mengoptimalkan performa pencarian dengan jeda debounce 300ms untuk mencegah re-render berlebihan saat mengetik.
- **Pagination / Virtual Limit**: Menyediakan kontrol penambahan item bertahap (*Show More*) pada daftar tabel yang panjang untuk menjaga responsivitas browser.
