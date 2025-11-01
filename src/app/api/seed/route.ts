import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create sample kelas
    const kelasData = [
      { nama: 'X IPA 1', tingkat: 'X', jurusan: 'IPA', waliKelas: 'Ahmad Fauzi', kapasitas: 30 },
      { nama: 'X IPS 1', tingkat: 'X', jurusan: 'IPS', waliKelas: 'Siti Rahayu', kapasitas: 30 },
      { nama: 'XI IPA 1', tingkat: 'XI', jurusan: 'IPA', waliKelas: 'Budi Santoso', kapasitas: 30 },
      { nama: 'XI IPS 1', tingkat: 'XI', jurusan: 'IPS', waliKelas: 'Dewi Lestari', kapasitas: 30 },
      { nama: 'XII IPA 1', tingkat: 'XII', jurusan: 'IPA', waliKelas: 'Eko Prasetyo', kapasitas: 30 },
      { nama: 'XII IPS 1', tingkat: 'XII', jurusan: 'IPS', waliKelas: 'Rina Wijaya', kapasitas: 30 }
    ]

    const createdKelas = []
    for (const k of kelasData) {
      const kelas = await db.kelas.upsert({
        where: { nama: k.nama },
        update: k,
        create: k
      })
      createdKelas.push(kelas)
    }

    // Create sample santri
    const santriData = [
      { nis: '2024001', nama: 'Ahmad Rizki', jenisKelamin: 'Laki-laki', kelasId: createdKelas[0].id, namaOrtu: 'Bapak Hidayat' },
      { nis: '2024002', nama: 'Siti Nurhaliza', jenisKelamin: 'Perempuan', kelasId: createdKelas[1].id, namaOrtu: 'Ibu Sumarni' },
      { nis: '2024003', nama: 'Budi Santoso', jenisKelamin: 'Laki-laki', kelasId: createdKelas[2].id, namaOrtu: 'Bapak Sutrisno' },
      { nis: '2024004', nama: 'Dewi Lestari', jenisKelamin: 'Perempuan', kelasId: createdKelas[3].id, namaOrtu: 'Ibu Wijayanti' },
      { nis: '2024005', nama: 'Eko Prasetyo', jenisKelamin: 'Laki-laki', kelasId: createdKelas[4].id, namaOrtu: 'Bapak Widodo' },
      { nis: '2024006', nama: 'Rina Wijaya', jenisKelamin: 'Perempuan', kelasId: createdKelas[5].id, namaOrtu: 'Ibu Siti Aminah' },
      { nis: '2024007', nama: 'Fajar Nugroho', jenisKelamin: 'Laki-laki', kelasId: createdKelas[0].id, namaOrtu: 'Bapak Subagyo' },
      { nis: '2024008', nama: 'Maya Sari', jenisKelamin: 'Perempuan', kelasId: createdKelas[1].id, namaOrtu: 'Ibu Purwanti' }
    ]

    const createdSantri = []
    for (const s of santriData) {
      const santri = await db.santri.upsert({
        where: { nis: s.nis },
        update: s,
        create: s
      })
      createdSantri.push(santri)
    }

    // Create sample absensi for today
    const today = new Date()
    today.setHours(7, 0, 0, 0)

    const absensiData = [
      { santriId: createdSantri[0].id, tanggal: today, status: 'Hadir', keterangan: '' },
      { santriId: createdSantri[1].id, tanggal: today, status: 'Hadir', keterangan: '' },
      { santriId: createdSantri[2].id, tanggal: today, status: 'Sakit', keterangan: 'Demam' },
      { santriId: createdSantri[3].id, tanggal: today, status: 'Izin', keterangan: 'Ada urusan keluarga' },
      { santriId: createdSantri[4].id, tanggal: today, status: 'Hadir', keterangan: '' },
      { santriId: createdSantri[5].id, tanggal: today, status: 'Hadir', keterangan: '' },
      { santriId: createdSantri[6].id, tanggal: today, status: 'Alpha', keterangan: '' },
      { santriId: createdSantri[7].id, tanggal: today, status: 'Hadir', keterangan: '' }
    ]

    for (const a of absensiData) {
      await db.absensi.upsert({
        where: {
          santriId_tanggal: {
            santriId: a.santriId,
            tanggal: a.tanggal
          }
        },
        update: a,
        create: a
      })
    }

    return NextResponse.json({
      message: 'Sample data created successfully',
      kelas: createdKelas.length,
      santri: createdSantri.length,
      absensi: absensiData.length
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}