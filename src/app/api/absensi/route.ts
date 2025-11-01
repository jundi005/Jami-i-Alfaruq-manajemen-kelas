import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tanggal = searchParams.get('tanggal')
    const kelasId = searchParams.get('kelasId')

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

    return NextResponse.json(absensi)
  } catch (error) {
    console.error('Error fetching absensi:', error)
    return NextResponse.json(
      { error: 'Failed to fetch absensi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { santriId, tanggal, status, keterangan } = body

    if (!santriId || !tanggal || !status) {
      return NextResponse.json(
        { error: 'Santri ID, tanggal, dan status harus diisi' },
        { status: 400 }
      )
    }

    // Check if absensi already exists for this santri and date
    const existingAbsensi = await db.absensi.findFirst({
      where: {
        santriId,
        tanggal: new Date(tanggal)
      }
    })

    if (existingAbsensi) {
      return NextResponse.json(
        { error: 'Absensi untuk santri ini pada tanggal tersebut sudah ada' },
        { status: 400 }
      )
    }

    const absensi = await db.absensi.create({
      data: {
        santriId,
        tanggal: new Date(tanggal),
        status,
        keterangan
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

    return NextResponse.json(absensi, { status: 201 })
  } catch (error) {
    console.error('Error creating absensi:', error)
    return NextResponse.json(
      { error: 'Failed to create absensi' },
      { status: 500 }
    )
  }
}