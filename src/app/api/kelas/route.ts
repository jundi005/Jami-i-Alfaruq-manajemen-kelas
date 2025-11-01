import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const kelas = await db.kelas.findMany({
      include: {
        santri: {
          select: {
            id: true
          }
        }
      }
    })

    const kelasWithCount = kelas.map(k => ({
      ...k,
      jumlahSantri: k.santri.length
    }))

    return NextResponse.json(kelasWithCount)
  } catch (error) {
    console.error('Error fetching kelas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kelas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, tingkat, jurusan, waliKelas, kapasitas } = body

    if (!nama || !tingkat) {
      return NextResponse.json(
        { error: 'Nama dan tingkat kelas harus diisi' },
        { status: 400 }
      )
    }

    const kelas = await db.kelas.create({
      data: {
        nama,
        tingkat,
        jurusan,
        waliKelas,
        kapasitas: kapasitas || 30
      }
    })

    return NextResponse.json(kelas, { status: 201 })
  } catch (error) {
    console.error('Error creating kelas:', error)
    return NextResponse.json(
      { error: 'Failed to create kelas' },
      { status: 500 }
    )
  }
}