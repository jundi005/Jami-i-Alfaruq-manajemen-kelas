'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Calendar, Users, BarChart3, TrendingUp, AlertCircle } from 'lucide-react'

interface Kelas {
  id: string
  nama: string
  tingkat: string
}

interface Santri {
  id: string
  nis: string
  nama: string
  kelas: { id: string; nama: string }
}

interface LaporanData {
  santri: {
    id: string
    nis: string
    nama: string
    kelas: { id: string; nama: string }
  }
  totalHadir: number
  totalSakit: number
  totalIzin: number
  totalAlpha: number
  persentaseKehadiran: number
}

export default function LaporanManager() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedKelas, setSelectedKelas] = useState('')
  const [reportType, setReportType] = useState('bulanan')
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [laporanData, setLaporanData] = useState<LaporanData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchKelas()
  }, [])

  useEffect(() => {
    if (selectedKelas && selectedMonth) {
      fetchLaporanData()
    }
  }, [selectedKelas, selectedMonth, reportType])

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas')
      if (response.ok) {
        const data = await response.json()
        setKelas(data)
      }
    } catch (error) {
      console.error('Error fetching kelas:', error)
    }
  }

  const fetchLaporanData = async () => {
    if (!selectedKelas) return
    
    setLoading(true)
    try {
      // Generate laporan data (mock untuk demo)
      const santriResponse = await fetch('/api/santri')
      if (santriResponse.ok) {
        const santriData = await santriResponse.json()
        const filteredSantri = santriData.filter((s: Santri) => s.kelas.id === selectedKelas)
        
        // Mock data untuk demo
        const mockLaporanData: LaporanData[] = filteredSantri.map((s: Santri) => ({
          santri: s,
          totalHadir: Math.floor(Math.random() * 20) + 5,
          totalSakit: Math.floor(Math.random() * 3),
          totalIzin: Math.floor(Math.random() * 2),
          totalAlpha: Math.floor(Math.random() * 2),
          persentaseKehadiran: 0
        }))

        // Calculate persentase kehadiran
        mockLaporanData.forEach(item => {
          const total = item.totalHadir + item.totalSakit + item.totalIzin + item.totalAlpha
          item.persentaseKehadiran = total > 0 ? (item.totalHadir / total) * 100 : 0
        })

        setLaporanData(mockLaporanData)
      }
    } catch (error) {
      console.error('Error fetching laporan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['NIS', 'Nama', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Persentase Kehadiran']
    const csvContent = [
      headers.join(','),
      ...laporanData.map(item => [
        item.santri.nis,
        item.santri.nama,
        item.santri.kelas.nama,
        item.totalHadir,
        item.totalSakit,
        item.totalIzin,
        item.totalAlpha,
        `${item.persentaseKehadiran.toFixed(1)}%`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-absensi-${selectedMonth}-${kelas.find(k => k.id === selectedKelas)?.nama}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSummaryStats = () => {
    const totalSantri = laporanData.length
    const avgKehadiran = totalSantri > 0 
      ? laporanData.reduce((sum, item) => sum + item.persentaseKehadiran, 0) / totalSantri 
      : 0
    const totalHadir = laporanData.reduce((sum, item) => sum + item.totalHadir, 0)
    const totalSakit = laporanData.reduce((sum, item) => sum + item.totalSakit, 0)
    const totalIzin = laporanData.reduce((sum, item) => sum + item.totalIzin, 0)
    const totalAlpha = laporanData.reduce((sum, item) => sum + item.totalAlpha, 0)

    return {
      totalSantri,
      avgKehadiran,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha
    }
  }

  const stats = getSummaryStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Laporan Absensi</h3>
          <p className="text-sm text-gray-600">Generate dan download laporan absensi</p>
        </div>
        <Button onClick={exportToCSV} disabled={laporanData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bulan">Bulan</Label>
          <Input
            id="bulan"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kelas">Kelas</Label>
          <Select value={selectedKelas} onValueChange={setSelectedKelas}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelas.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipe">Tipe Laporan</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bulanan">Bulanan</SelectItem>
              <SelectItem value="mingguan">Mingguan</SelectItem>
              <SelectItem value="harian">Harian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedKelas && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Total Santri</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalSantri}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Avg. Kehadiran</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.avgKehadiran.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Total Hadir</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalHadir}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-gray-600">Total Alpha</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.totalAlpha}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Laporan</CardTitle>
              <CardDescription>
                Rekap absensi {reportType} kelas {kelas.find(k => k.id === selectedKelas)?.nama} - {selectedMonth}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>Loading...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-center">Hadir</TableHead>
                      <TableHead className="text-center">Sakit</TableHead>
                      <TableHead className="text-center">Izin</TableHead>
                      <TableHead className="text-center">Alpha</TableHead>
                      <TableHead className="text-center">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporanData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-600">Tidak ada data laporan</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      laporanData.map((item) => (
                        <TableRow key={item.santri.id}>
                          <TableCell className="font-medium">{item.santri.nis}</TableCell>
                          <TableCell>{item.santri.nama}</TableCell>
                          <TableCell>{item.santri.kelas.nama}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {item.totalHadir}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {item.totalSakit}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {item.totalIzin}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              {item.totalAlpha}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={item.persentaseKehadiran >= 90 ? 'default' : 'destructive'}
                            >
                              {item.persentaseKehadiran.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}