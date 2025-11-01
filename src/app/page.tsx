'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, Users, UserCheck, AlertCircle, BookOpen, UserPlus, FileText, Home, Database, Cloud } from 'lucide-react'
import KelasManager from '@/components/KelasManager'
import SantriManager from '@/components/SantriManager'
import AbsensiManager from '@/components/AbsensiManager'
import LaporanManager from '@/components/LaporanManager'
import GoogleSheetsManager from '@/components/GoogleSheetsManager'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalKelas: 0,
    hadirHariIni: 0,
    sakitHariIni: 0,
    izinHariIni: 0,
    alphaHariIni: 0
  })

  const [recentAbsensi, setRecentAbsensi] = useState([])

  useEffect(() => {
    // Fetch real data from API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentAbsensi(data.recentAbsensi)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to mock data
        setStats({
          totalSantri: 150,
          totalKelas: 6,
          hadirHariIni: 142,
          sakitHariIni: 3,
          izinHariIni: 4,
          alphaHariIni: 1
        })

        setRecentAbsensi([
          { id: 1, nama: 'Ahmad Rizki', kelas: 'X IPA 1', status: 'Hadir', waktu: '07:30' },
          { id: 2, nama: 'Siti Nurhaliza', kelas: 'X IPS 1', status: 'Hadir', waktu: '07:32' },
          { id: 3, nama: 'Budi Santoso', kelas: 'XI IPA 2', status: 'Sakit', waktu: '08:00' },
          { id: 4, nama: 'Dewi Lestari', kelas: 'XII IPA 1', status: 'Izin', waktu: '08:15' },
        ])
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800'
      case 'Sakit': return 'bg-yellow-100 text-yellow-800'
      case 'Izin': return 'bg-blue-100 text-blue-800'
      case 'Alpha': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const seedSampleData = async () => {
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Sample data berhasil dibuat:\n- ${data.kelas} kelas\n- ${data.santri} santri\n- ${data.absensi} absensi`)
        // Refresh dashboard data
        window.location.reload()
      } else {
        alert('Gagal membuat sample data')
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      alert('Terjadi kesalahan saat membuat sample data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Absensi Pondok Pesantren</h1>
        <p className="text-gray-600">Sistem manajemen absensi santri terintegrasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSantri}</div>
            <p className="text-xs text-muted-foreground">Aktif terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKelas}</div>
            <p className="text-xs text-muted-foreground">Kelas aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hadirHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.hadirHariIni / stats.totalSantri) * 100).toFixed(1)}% kehadiran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.sakitHariIni + stats.izinHariIni + stats.alphaHariIni}
            </div>
            <p className="text-xs text-muted-foreground">
              S: {stats.sakitHariIni}, I: {stats.izinHariIni}, A: {stats.alphaHariIni}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="absensi" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Absensi
          </TabsTrigger>
          <TabsTrigger value="santri" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Santri
          </TabsTrigger>
          <TabsTrigger value="kelas" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Data Kelas
          </TabsTrigger>
          <TabsTrigger value="laporan" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Laporan
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Absensi */}
            <Card>
              <CardHeader>
                <CardTitle>Absensi Terkini</CardTitle>
                <CardDescription>Log absensi santri hari ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAbsensi.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.nama}</p>
                        <p className="text-sm text-gray-600">{item.kelas}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{item.waktu}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Akses cepat ke fitur utama</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" onClick={seedSampleData}>
                  <Database className="mr-2 h-4 w-4" />
                  Load Sample Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tambah Santri Baru
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Tambah Kelas Baru
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Input Absensi Manual
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Export Laporan Bulanan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="absensi">
          <AbsensiManager />
        </TabsContent>

        <TabsContent value="santri">
          <SantriManager />
        </TabsContent>

        <TabsContent value="kelas">
          <KelasManager />
        </TabsContent>

        <TabsContent value="laporan">
          <LaporanManager />
        </TabsContent>

        <TabsContent value="sync">
          <GoogleSheetsManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}