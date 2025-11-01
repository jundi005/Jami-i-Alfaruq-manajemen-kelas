// Auto-sync scheduler untuk Google Sheets
// Bisa dijalankan setiap hari/jam menggunakan cron job

import { db } from '@/lib/db'

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

export async function scheduleDailySync() {
  try {
    console.log('Starting daily sync to Google Sheets...')
    
    // Sync today's absensi
    const today = new Date().toISOString().split('T')[0]
    await syncAbsensiToSheets(today)
    
    // Sync master data santri (hanya jika ada perubahan)
    await syncSantriToSheets()
    
    // Sync laporan bulanan (hanya jika tanggal 1 atau akhir bulan)
    const todayDate = new Date()
    if (todayDate.getDate() === 1 || todayDate.getDate() === 30) {
      const currentMonth = todayDate.toISOString().slice(0, 7)
      await syncLaporanToSheets(currentMonth)
    }
    
    console.log('Daily sync completed successfully!')
    return { success: true, message: 'Daily sync completed' }
    
  } catch (error) {
    console.error('Daily sync failed:', error)
    return { success: false, error: error.message }
  }
}

export async function scheduleWeeklySync() {
  try {
    console.log('Starting weekly sync to Google Sheets...')
    
    // Sync semua absensi minggu ini
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    for (let date = weekStart; date <= weekEnd; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      await syncAbsensiToSheets(dateStr)
    }
    
    // Sync laporan mingguan
    const currentMonth = new Date().toISOString().slice(0, 7)
    await syncLaporanToSheets(currentMonth)
    
    console.log('Weekly sync completed successfully!')
    return { success: true, message: 'Weekly sync completed' }
    
  } catch (error) {
    console.error('Weekly sync failed:', error)
    return { success: false, error: error.message }
  }
}

export async function scheduleMonthlySync() {
  try {
    console.log('Starting monthly sync to Google Sheets...')
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Sync semua data bulanan
    await syncSantriToSheets()
    await syncLaporanToSheets(currentMonth)
    
    // Sync semua absensi bulan ini
    const startDate = new Date(currentMonth + '-01')
    const endDate = new Date(currentMonth + '-31')
    
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      await syncAbsensiToSheets(dateStr)
    }
    
    console.log('Monthly sync completed successfully!')
    return { success: true, message: 'Monthly sync completed' }
    
  } catch (error) {
    console.error('Monthly sync failed:', error)
    return { success: false, error: error.message }
  }
}

async function syncAbsensiToSheets(tanggal: string) {
  if (!GOOGLE_SCRIPT_URL) throw new Error('Google Script URL not configured')
  
  const startDate = new Date(tanggal)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(tanggal)
  endDate.setHours(23, 59, 59, 999)

  const absensi = await db.absensi.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      santri: {
        include: {
          kelas: {
            select: {
              id: true,
              nama: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const syncData = absensi.map(item => ({
    id: item.id,
    nis: item.santri.nis,
    nama: item.santri.nama,
    kelas: item.santri.kelas.nama,
    status: item.status,
    keterangan: item.keterangan || '',
    tanggal: item.tanggal,
    createdAt: item.createdAt
  }))

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'absensi',
      data: syncData
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to sync absensi: ${response.statusText}`)
  }

  return await response.json()
}

async function syncSantriToSheets() {
  if (!GOOGLE_SCRIPT_URL) throw new Error('Google Script URL not configured')
  
  const santri = await db.santri.findMany({
    include: {
      kelas: {
        select: {
          id: true,
          nama: true
        }
      }
    },
    orderBy: {
      nama: 'asc'
    }
  })

  const syncData = santri.map(item => ({
    id: item.id,
    nis: item.nis,
    nama: item.nama,
    jenisKelamin: item.jenisKelamin,
    kelas: item.kelas,
    tempatLahir: item.tempatLahir,
    tanggalLahir: item.tanggalLahir,
    alamat: item.alamat,
    noTelp: item.noTelp,
    namaOrtu: item.namaOrtu
  }))

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'santri',
      data: syncData
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to sync santri: ${response.statusText}`)
  }

  return await response.json()
}

async function syncLaporanToSheets(month: string) {
  if (!GOOGLE_SCRIPT_URL) throw new Error('Google Script URL not configured')
  
  const startDate = new Date(month + '-01')
  const endDate = new Date(month + '-31')
  endDate.setHours(23, 59, 59, 999)

  // Get all santri
  const santri = await db.santri.findMany({
    include: {
      kelas: {
        select: {
          id: true,
          nama: true
        }
      }
    }
  })

  // Group by kelas
  const kelasGroups = santri.reduce((acc, s) => {
    const kelasId = s.kelas.id
    if (!acc[kelasId]) {
      acc[kelasId] = {
        kelasId,
        kelasNama: s.kelas.nama,
        santri: []
      }
    }
    acc[kelasId].santri.push(s)
    return acc
  }, {} as any)

  // Calculate attendance for each class
  const laporanData = []
  
  for (const [kelasId, group] of Object.entries(kelasGroups)) {
    const classGroup = group as any
    const santriIds = classGroup.santri.map((s: any) => s.id)
    
    // Get absensi for this class and month
    const absensi = await db.absensi.findMany({
      where: {
        santriId: { in: santriIds },
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalHadir = absensi.filter(a => a.status === 'Hadir').length
    const totalSakit = absensi.filter(a => a.status === 'Sakit').length
    const totalIzin = absensi.filter(a => a.status === 'Izin').length
    const totalAlpha = absensi.filter(a => a.status === 'Alpha').length
    const totalAbsensi = totalHadir + totalSakit + totalIzin + totalAlpha
    
    const persentaseKehadiran = totalAbsensi > 0 
      ? (totalHadir / totalAbsensi) * 100 
      : 0

    laporanData.push({
      bulan: month,
      kelas: classGroup.kelasNama,
      totalSantri: classGroup.santri.length,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha,
      persentaseKehadiran: parseFloat(persentaseKehadiran.toFixed(1))
    })
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'laporan',
      data: laporanData,
      month: month
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to sync laporan: ${response.statusText}`)
  }

  return await response.json()
}

// API endpoint untuk trigger manual sync
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schedule } = body

    let result
    switch (schedule) {
      case 'daily':
        result = await scheduleDailySync()
        break
      case 'weekly':
        result = await scheduleWeeklySync()
        break
      case 'monthly':
        result = await scheduleMonthlySync()
        break
      default:
        return Response.json(
          { error: 'Invalid schedule type' },
          { status: 400 }
        )
    }

    return Response.json(result)
  } catch (error) {
    console.error('Schedule sync error:', error)
    return Response.json(
      { error: 'Failed to schedule sync', details: error.message },
      { status: 500 }
    )
  }
}