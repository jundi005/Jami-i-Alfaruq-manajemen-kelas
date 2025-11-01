import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
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

    return NextResponse.json(santri)
  } catch (error) {
    console.error('Error fetching santri:', error)
    return NextResponse.json(
      { error: 'Failed to fetch santri' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nis, 
      nama, 
      jenisKelamin, 
      tempatLahir, 
      tanggalLahir, 
      alamat, 
      noTelp, 
      namaOrtu, 
      kelasId 
    } = body

    if (!nis || !nama || !jenisKelamin || !kelasId) {
      return NextResponse.json(
        { error: 'NIS, nama, jenis kelamin, dan kelas harus diisi' },
        { status: 400 }
      )
    }

    const santri = await db.santri.create({
      data: {
        nis,
        nama,
        jenisKelamin,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        alamat,
        noTelp,
        namaOrtu,
        kelasId
      },
      include: {
        kelas: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    })

    return NextResponse.json(santri, { status: 201 })
  } catch (error) {
    console.error('Error creating santri:', error)
    return NextResponse.json(
      { error: 'Failed to create santri' },
      { status: 500 }
    )
  }
}