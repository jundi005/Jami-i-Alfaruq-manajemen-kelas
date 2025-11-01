import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0]

    // Get total counts
    const totalSantri = await db.santri.count()
    const totalKelas = await db.kelas.count()

    // Get today's attendance
    const startDate = new Date(tanggal)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(tanggal)
    endDate.setHours(23, 59, 59, 999)

    const todayAbsensi = await db.absensi.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const hadirHariIni = todayAbsensi.filter(a => a.status === 'Hadir').length
    const sakitHariIni = todayAbsensi.filter(a => a.status === 'Sakit').length
    const izinHariIni = todayAbsensi.filter(a => a.status === 'Izin').length
    const alphaHariIni = todayAbsensi.filter(a => a.status === 'Alpha').length

    // Get recent absensi
    const recentAbsensi = await db.absensi.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
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
      }
    })

    // Get attendance by class for today
    const attendanceByClass = await db.absensi.groupBy({
      by: ['santriId'],
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      stats: {
        totalSantri,
        totalKelas,
        hadirHariIni,
        sakitHariIni,
        izinHariIni,
        alphaHariIni
      },
      recentAbsensi: recentAbsensi.map(item => ({
        id: item.id,
        nama: item.santri.nama,
        kelas: item.santri.kelas.nama,
        status: item.status,
        waktu: item.createdAt.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}