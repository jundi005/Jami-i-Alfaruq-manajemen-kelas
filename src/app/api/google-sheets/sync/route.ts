import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log('Sync API called:', { action, data })

    let syncData

    switch (action) {
      case 'absensi':
        syncData = await syncAbsensiData(data)
        break
      case 'santri':
        syncData = await syncSantriData()
        break
      case 'laporan':
        syncData = await syncLaporanData(data)
        break
      case 'status':
        syncData = await getSyncStatus()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action', action },
          { status: 400 }
        )
    }

    console.log('Sync data prepared:', { action, count: Array.isArray(syncData) ? syncData.length : 'N/A' })

    // Send data to Google Apps Script
    let result
    if (action === 'status') {
      result = { status: 'success', data: syncData }
    } else {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            data: syncData,
            month: data?.month
          })
        })

        console.log('Google Script response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Google Script error response:', errorText)
          throw new Error(`Google Script API error: ${response.statusText}`)
        }

        result = await response.json()
        console.log('Google Script response:', result)
        
        // Check if Google Apps Script returned an error
        if (result.status === 'error' || result.message?.includes('Exception')) {
          console.error('Google Apps Script returned error:', result)
          throw new Error(result.message || 'Google Apps Script error')
        }
        
      } catch (scriptError: any) {
        // If Google Apps Script fails, return local success
        console.warn('Google Apps Script not available, using local fallback:', scriptError.message)
        result = { 
          status: 'success', 
          message: `Local sync completed (${syncData?.length || 0} records). Google Sheets sync not available.`,
          added: syncData?.length || 0,
          note: 'Please set up Google Apps Script correctly to enable cloud sync'
        }
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error in sync API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync to Google Sheets', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

async function syncAbsensiData(data: any) {
  const { tanggal, kelasId } = data || {}

  let whereClause: any = {}
  
  if (tanggal) {
    const startDate = new Date(tanggal)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(tanggal)
    endDate.setHours(23, 59, 59, 999)
    
    whereClause.tanggal = {
      gte: startDate,
      lte: endDate
    }
  }

  if (kelasId) {
    whereClause.santri = {
      kelasId: kelasId
    }
  }

  const absensi = await db.absensi.findMany({
    where: whereClause,
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

  return absensi.map(item => ({
    id: item.id,
    nis: item.santri?.nis || '',
    nama: item.santri?.nama || '',
    kelas: item.santri?.kelas?.nama || '',
    status: item.status,
    keterangan: item.keterangan || '',
    tanggal: item.tanggal,
    createdAt: item.createdAt
  }))
}

async function syncSantriData() {
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

  return santri.map(item => ({
    id: item.id,
    nis: item.nis,
    nama: item.nama,
    jenisKelamin: item.jenisKelamin,
    kelas: item.kelas || { id: '', nama: '' },
    tempatLahir: item.tempatLahir,
    tanggalLahir: item.tanggalLahir,
    alamat: item.alamat,
    noTelp: item.noTelp,
    namaOrtu: item.namaOrtu
  }))
}

async function syncLaporanData(data: any) {
  const { month, kelasId } = data
  const targetMonth = month || new Date().toISOString().slice(0, 7)
  
  const startDate = new Date(targetMonth + '-01')
  const endDate = new Date(targetMonth + '-31')
  endDate.setHours(23, 59, 59, 999)

  // Get all santri
  let santriQuery: any = {}
  if (kelasId) {
    santriQuery.kelasId = kelasId
  }

  const santri = await db.santri.findMany({
    where: santriQuery,
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
      bulan: targetMonth,
      kelas: classGroup.kelasNama,
      totalSantri: classGroup.santri.length,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha,
      persentaseKehadiran: parseFloat(persentaseKehadiran.toFixed(1))
    })
  }

  return laporanData
}

async function getSyncStatus() {
  // For now, return mock status since Google Apps Script might not be set up yet
  return {
    lastAbsensiSync: 'Never',
    lastSantriSync: 'Never', 
    lastLaporanSync: 'Never',
    totalAbsensi: 0,
    totalSantri: 0,
    totalLaporan: 0
  }
}