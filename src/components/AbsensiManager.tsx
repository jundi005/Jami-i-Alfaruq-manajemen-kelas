'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserCheck, Calendar, Users, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

interface Kelas {
  id: string
  nama: string
  tingkat: string
  santri: Array<{ id: string; nama: string }>
}

interface Santri {
  id: string
  nis: string
  nama: string
  kelas: { id: string; nama: string }
}

interface Absensi {
  id: string
  santriId: string
  tanggal: string
  status: string
  keterangan?: string
  santri: {
    id: string
    nis: string
    nama: string
    kelas: { id: string; nama: string }
  }
}

export default function AbsensiManager() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [santri, setSantri] = useState<Santri[]>([])
  const [absensi, setAbsensi] = useState<Absensi[]>([])
  const [loading, setLoading] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkAbsensi, setBulkAbsensi] = useState<{ santriId: string; status: string; keterangan?: string }[]>([])

  useEffect(() => {
    fetchKelas()
  }, [])

  useEffect(() => {
    if (selectedKelas) {
      fetchSantri()
      fetchAbsensi()
    }
  }, [selectedKelas, selectedDate])

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

  const fetchSantri = async () => {
    if (!selectedKelas) return
    
    try {
      const response = await fetch(`/api/santri`)
      if (response.ok) {
        const data = await response.json()
        const filteredSantri = data.filter((s: Santri) => s.kelas.id === selectedKelas)
        setSantri(filteredSantri)
      }
    } catch (error) {
      console.error('Error fetching santri:', error)
    }
  }

  const fetchAbsensi = async () => {
    if (!selectedKelas) return
    
    try {
      const response = await fetch(`/api/absensi?tanggal=${selectedDate}&kelasId=${selectedKelas}`)
      if (response.ok) {
        const data = await response.json()
        setAbsensi(data)
      }
    } catch (error) {
      console.error('Error fetching absensi:', error)
    }
  }

  const handleBulkAbsensi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/absensi/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal: selectedDate,
          absensiData: bulkAbsensi
        }),
      })

      if (response.ok) {
        await fetchAbsensi()
        setIsBulkDialogOpen(false)
        setBulkAbsensi([])
      }
    } catch (error) {
      console.error('Error saving bulk absensi:', error)
    } finally {
      setLoading(false)
    }
  }

  const prepareBulkAbsensi = () => {
    const prepared = santri.map(s => {
      const existing = absensi.find(a => a.santriId === s.id)
      return {
        santriId: s.id,
        status: existing?.status || 'Hadir',
        keterangan: existing?.keterangan || ''
      }
    })
    setBulkAbsensi(prepared)
    setIsBulkDialogOpen(true)
  }

  const updateBulkAbsensiItem = (santriId: string, field: 'status' | 'keterangan', value: string) => {
    setBulkAbsensi(prev => 
      prev.map(item => 
        item.santriId === santriId 
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hadir': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Sakit': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'Izin': return <Clock className="h-4 w-4 text-blue-600" />
      case 'Alpha': return <XCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800'
      case 'Sakit': return 'bg-yellow-100 text-yellow-800'
      case 'Izin': return 'bg-blue-100 text-blue-800'
      case 'Alpha': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStats = () => {
    const total = santri.length
    const hadir = absensi.filter(a => a.status === 'Hadir').length
    const sakit = absensi.filter(a => a.status === 'Sakit').length
    const izin = absensi.filter(a => a.status === 'Izin').length
    const alpha = absensi.filter(a => a.status === 'Alpha').length
    
    return { total, hadir, sakit, izin, alpha }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Manajemen Absensi</h3>
          <p className="text-sm text-gray-600">Input dan monitoring absensi santri</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input
            id="tanggal"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
        <div className="flex items-end">
          <Button 
            onClick={prepareBulkAbsensi}
            disabled={!selectedKelas || santri.length === 0}
            className="w-full"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Input Absensi
          </Button>
        </div>
      </div>

      {selectedKelas && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-gray-600">Total Santri</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
                <p className="text-sm text-gray-600">Hadir</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.sakit}</div>
                <p className="text-sm text-gray-600">Sakit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
                <p className="text-sm text-gray-600">Izin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.alpha}</div>
                <p className="text-sm text-gray-600">Alpha</p>
              </CardContent>
            </Card>
          </div>

          {/* Absensi Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Absensi</CardTitle>
              <CardDescription>
                Rekap absensi kelas {kelas.find(k => k.id === selectedKelas)?.nama} - {selectedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {santri.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600">Belum ada santri di kelas ini</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    santri.map((s) => {
                      const absensiItem = absensi.find(a => a.santriId === s.id)
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.nis}</TableCell>
                          <TableCell>{s.nama}</TableCell>
                          <TableCell>
                            {absensiItem ? (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(absensiItem.status)}
                                <Badge className={getStatusColor(absensiItem.status)}>
                                  {absensiItem.status}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="outline">Belum absen</Badge>
                            )}
                          </TableCell>
                          <TableCell>{absensiItem?.keterangan || '-'}</TableCell>
                          <TableCell>
                            {absensiItem ? new Date(absensiItem.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Absensi Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Input Absensi Kelas</DialogTitle>
            <DialogDescription>
              Input absensi untuk semua santri kelas {kelas.find(k => k.id === selectedKelas)?.nama} pada {selectedDate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkAbsensi.map((item) => {
                    const santriItem = santri.find(s => s.id === item.santriId)
                    return (
                      <TableRow key={item.santriId}>
                        <TableCell className="font-medium">{santriItem?.nis}</TableCell>
                        <TableCell>{santriItem?.nama}</TableCell>
                        <TableCell>
                          <Select 
                            value={item.status} 
                            onValueChange={(value) => updateBulkAbsensiItem(item.santriId, 'status', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hadir">Hadir</SelectItem>
                              <SelectItem value="Sakit">Sakit</SelectItem>
                              <SelectItem value="Izin">Izin</SelectItem>
                              <SelectItem value="Alpha">Alpha</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Keterangan"
                            value={item.keterangan || ''}
                            onChange={(e) => updateBulkAbsensiItem(item.santriId, 'keterangan', e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleBulkAbsensi} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Absensi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}