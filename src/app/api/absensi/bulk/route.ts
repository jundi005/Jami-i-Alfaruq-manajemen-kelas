import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tanggal, absensiData } = body

    if (!tanggal || !absensiData || !Array.isArray(absensiData)) {
      return NextResponse.json(
        { error: 'Tanggal dan data absensi harus diisi' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const item of absensiData) {
      try {
        const { santriId, status, keterangan } = item

        if (!santriId || !status) {
          errors.push({ santriId, error: 'Santri ID dan status harus diisi' })
          continue
        }

        // Check if absensi already exists
        const existingAbsensi = await db.absensi.findFirst({
          where: {
            santriId,
            tanggal: new Date(tanggal)
          }
        })

        if (existingAbsensi) {
          // Update existing
          const updated = await db.absensi.update({
            where: { id: existingAbsensi.id },
            data: {
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
          results.push(updated)
        } else {
          // Create new
          const created = await db.absensi.create({
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
          results.push(created)
        }
      } catch (error) {
        errors.push({ santriId: item.santriId, error: 'Failed to process absensi' })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} absensi records`,
      results,
      errors
    })
  } catch (error) {
    console.error('Error processing bulk absensi:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk absensi' },
      { status: 500 }
    )
  }
}