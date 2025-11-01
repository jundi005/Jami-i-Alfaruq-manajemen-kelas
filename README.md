# Sistem Absensi Pondok Pesantren

Aplikasi web untuk manajemen absensi santri pondok pesantren yang dibangun dengan Next.js 15, TypeScript, dan Prisma.

## Fitur

### 🏠 Dashboard
- Statistik real-time kehadiran santri
- Log absensi terkini
- Akses cepat ke fitur utama
- Visualisasi data dengan chart

### 📚 Manajemen Kelas (CRUD)
- Tambah, edit, dan hapus data kelas
- Informasi wali kelas dan kapasitas
- Monitoring jumlah santri per kelas
- Filter berdasarkan tingkat dan jurusan

### 👥 Manajemen Santri (CRUD)
- Data lengkap santri (NIS, nama, biodata, orang tua)
- Pencarian santri berdasarkan nama atau NIS
- Assign santri ke kelas
- Upload foto santri (coming soon)

### ✅ Sistem Absensi
- Input absensi per kelas atau individual
- Status kehadiran: Hadir, Sakit, Izin, Alpha
- Catatan keterangan untuk setiap absensi
- Real-time update dashboard

### 📊 Laporan
- Generate laporan harian, mingguan, bulanan
- Export data ke CSV
- Statistik kehadiran per santri
- Rekapitulasi per kelas

## Teknologi

- **Frontend**: Next.js 15 dengan App Router
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM dengan SQLite
- **UI**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript

## Cara Menjalankan

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd pondok-absensi
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
npm run db:push
```

4. Jalankan development server
```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000)

## Cara Penggunaan

### 1. Load Sample Data
Untuk memulai, klik tombol "Load Sample Data" di dashboard untuk membuat data contoh:
- 6 kelas (X IPA 1, X IPS 1, XI IPA 1, XI IPS 1, XII IPA 1, XII IPS 1)
- 8 santri sample
- Data absensi hari ini

### 2. Manajemen Kelas
- Pilih tab "Data Kelas"
- Klik "Tambah Kelas" untuk menambah kelas baru
- Isi nama kelas, tingkat, jurusan, wali kelas, dan kapasitas
- Edit atau hapus kelas dengan tombol aksi

### 3. Manajemen Santri
- Pilih tab "Data Santri"
- Klik "Tambah Santri" untuk menambah santri baru
- Isi data lengkap santri termasuk NIS, nama, jenis kelamin, dll
- Gunakan fitur pencarian untuk mencari santri
- Assign santri ke kelas yang tersedia

### 4. Input Absensi
- Pilih tab "Absensi"
- Pilih tanggal dan kelas
- Klik "Input Absensi" untuk membuka dialog bulk input
- Pilih status kehadiran untuk setiap santri (Hadir, Sakit, Izin, Alpha)
- Tambahkan keterangan jika diperlukan
- Klik "Simpan Absensi"

### 5. Laporan
- Pilih tab "Laporan"
- Pilih bulan dan kelas yang ingin dilihat
- Lihat statistik kehadiran dan detail per santri
- Klik "Export CSV" untuk download laporan

## API Endpoints

### Kelas
- `GET /api/kelas` - Get all kelas
- `POST /api/kelas` - Create kelas
- `GET /api/kelas/[id]` - Get kelas by ID
- `PUT /api/kelas/[id]` - Update kelas
- `DELETE /api/kelas/[id]` - Delete kelas

### Santri
- `GET /api/santri` - Get all santri
- `POST /api/santri` - Create santri
- `GET /api/santri/[id]` - Get santri by ID
- `PUT /api/santri/[id]` - Update santri
- `DELETE /api/santri/[id]` - Delete santri

### Absensi
- `GET /api/absensi` - Get absensi with filters
- `POST /api/absensi` - Create single absensi
- `POST /api/absensi/bulk` - Create bulk absensi

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Seed Data
- `POST /api/seed` - Create sample data

## Database Schema

### Kelas
- id, nama, tingkat, jurusan, waliKelas, kapasitas
- Relasi ke Santri (one-to-many)

### Santri
- id, nis, nama, jenisKelamin, tempatLahir, tanggalLahir, alamat, noTelp, namaOrtu, kelasId
- Relasi ke Kelas (many-to-one) dan Absensi (one-to-many)

### Absensi
- id, santriId, tanggal, status, keterangan
- Relasi ke Santri (many-to-one)
- Unique constraint pada (santriId, tanggal)

## Deployment

### Netlify
1. Build aplikasi:
```bash
npm run build
```

2. Deploy ke Netlify:
- Push code ke GitHub
- Connect repository ke Netlify
- Set build command: `npm run build`
- Set publish directory: `.next`

### Environment Variables
- `DATABASE_URL`: Path ke database SQLite
- `NEXTAUTH_SECRET`: Secret untuk authentication (jika digunakan)

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

Untuk support atau pertanyaan, silakan contact development team.# Jami-i-Alfaruq-manajemen-kelas
