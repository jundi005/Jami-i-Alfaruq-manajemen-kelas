import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const santri = await db.santri.findUnique({
      where: { id: params.id },
      include: {
        kelas: true
      }
    })

    if (!santri) {
      return NextResponse.json(
        { error: 'Santri not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(santri)
  } catch (error) {
    console.error('Error fetching santri:', error)
    return NextResponse.json(
      { error: 'Failed to fetch santri' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const santri = await db.santri.update({
      where: { id: params.id },
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

    return NextResponse.json(santri)
  } catch (error) {
    console.error('Error updating santri:', error)
    return NextResponse.json(
      { error: 'Failed to update santri' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.santri.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Santri deleted successfully' })
  } catch (error) {
    console.error('Error deleting santri:', error)
    return NextResponse.json(
      { error: 'Failed to delete santri' },
      { status: 500 }
    )
  }
}