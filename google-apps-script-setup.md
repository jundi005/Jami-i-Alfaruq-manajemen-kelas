# Google Apps Script untuk Pondok Pesantren Absensi System

## Setup Instructions

### 1. Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet dengan nama: "Absensi Pondok Pesantren"
3. Buat 3 sheets:
   - `Absensi` - untuk data absensi harian
   - `Santri` - untuk master data santri
   - `Laporan` - untuk rekap bulanan

### 2. Setup Sheet Structure

#### Sheet "Absensi" (Column Headers):
- Kolom A: Tanggal
- Kolom B: NIS
- Kolom C: Nama
- Kolom D: Kelas
- Kolom E: Status
- Kolom F: Keterangan
- Kolom G: Waktu Input
- Kolom H: ID Absensi

#### Sheet "Santri" (Column Headers):
- Kolom A: NIS
- Kolom B: Nama
- Kolom C: Jenis Kelamin
- Kolom D: Kelas
- Kolom E: Tempat Lahir
- Kolom F: Tanggal Lahir
- Kolom G: Alamat
- Kolom H: No Telepon
- Kolom I: Nama Ortu
- Kolom J: ID Santri

#### Sheet "Laporan" (Column Headers):
- Kolom A: Bulan
- Kolom B: Kelas
- Kolom C: Total Santri
- Kolom D: Hadir
- Kolom E: Sakit
- Kolom F: Izin
- Kolom G: Alpha
- Kolom H: % Kehadiran
- Kolom I: Tanggal Update

### 3. Install Apps Script
1. Di Google Sheets, menu: Extensions → Apps Script
2. Copy semua code dari `google-apps-script.js`
3. Paste ke editor Apps Script
4. Save project (Ctrl+S)

### 4. Deploy sebagai Web App
1. Klik tombol Deploy → New deployment
2. Pilih "Web app"
3. Configuration:
   - Description: "Pondok Pesantren Absensi API"
   - Execute as: "Me" (email Anda)
   - Who has access: "Anyone" (untuk API calls)
4. Klik Deploy
5. Copy Web app URL (akan digunakan di Next.js)

### 5. Setup di Next.js
1. Tambah environment variable:
   ```
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
2. Restart development server

### 6. Test Integration
1. Buka aplikasi Next.js
2. Klik tombol "Sync to Google Sheets"
3. Check data di Google Sheets

## Features

### API Endpoints:
- `POST /` - Sync absensi data
- `POST /santri` - Sync master data santri
- `POST /laporan` - Sync laporan bulanan
- `GET /status` - Check sync status

### Auto-Features:
- Auto-format tanggal
- Duplicate prevention
- Error logging
- Data validation
- Conditional formatting

## Security Notes
- Web app URL bersifat rahasia
- Bisa diproteksi dengan API key tambahan
- Monitor usage di Google Cloud Console