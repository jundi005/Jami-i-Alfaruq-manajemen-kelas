import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kelas = await db.kelas.findUnique({
      where: { id: params.id },
      include: {
        santri: true
      }
    })

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kelas)
  } catch (error) {
    console.error('Error fetching kelas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kelas' },
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
    const { nama, tingkat, jurusan, waliKelas, kapasitas } = body

    const kelas = await db.kelas.update({
      where: { id: params.id },
      data: {
        nama,
        tingkat,
        jurusan,
        waliKelas,
        kapasitas
      }
    })

    return NextResponse.json(kelas)
  } catch (error) {
    console.error('Error updating kelas:', error)
    return NextResponse.json(
      { error: 'Failed to update kelas' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.kelas.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Kelas deleted successfully' })
  } catch (error) {
    console.error('Error deleting kelas:', error)
    return NextResponse.json(
      { error: 'Failed to delete kelas' },
      { status: 500 }
    )
  }
}