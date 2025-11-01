'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Users, Edit, Trash2, Plus, Search } from 'lucide-react'

interface Kelas {
  id: string
  nama: string
  tingkat: string
}

interface Santri {
  id: string
  nis: string
  nama: string
  jenisKelamin: string
  tempatLahir?: string
  tanggalLahir?: string
  alamat?: string
  noTelp?: string
  namaOrtu?: string
  kelasId: string
  kelas: Kelas
  createdAt: string
  updatedAt: string
}

export default function SantriManager() {
  const [santri, setSantri] = useState<Santri[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    noTelp: '',
    namaOrtu: '',
    kelasId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [santriResponse, kelasResponse] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/kelas')
      ])

      if (santriResponse.ok) {
        const santriData = await santriResponse.json()
        setSantri(santriData)
      }

      if (kelasResponse.ok) {
        const kelasData = await kelasResponse.json()
        setKelas(kelasData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSantri ? `/api/santri/${editingSantri.id}` : '/api/santri'
      const method = editingSantri ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving santri:', error)
    }
  }

  const handleEdit = (santriItem: Santri) => {
    setEditingSantri(santriItem)
    setFormData({
      nis: santriItem.nis,
      nama: santriItem.nama,
      jenisKelamin: santriItem.jenisKelamin,
      tempatLahir: santriItem.tempatLahir || '',
      tanggalLahir: santriItem.tanggalLahir ? new Date(santriItem.tanggalLahir).toISOString().split('T')[0] : '',
      alamat: santriItem.alamat || '',
      noTelp: santriItem.noTelp || '',
      namaOrtu: santriItem.namaOrtu || '',
      kelasId: santriItem.kelasId
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      try {
        const response = await fetch(`/api/santri/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchData()
        }
      } catch (error) {
        console.error('Error deleting santri:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingSantri(null)
    setFormData({
      nis: '',
      nama: '',
      jenisKelamin: '',
      tempatLahir: '',
      tanggalLahir: '',
      alamat: '',
      noTelp: '',
      namaOrtu: '',
      kelasId: ''
    })
  }

  const openDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredSantri = santri.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kelas.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Data Santri</h3>
          <p className="text-sm text-gray-600">Manajemen data santri pondok pesantren</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Santri
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingSantri ? 'Edit data santri yang sudah ada.' : 'Tambahkan santri baru ke sistem.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Nomor Induk Santri"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap santri"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select value={formData.jenisKelamin} onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kelasId">Kelas</Label>
                  <Select value={formData.kelasId} onValueChange={(value) => setFormData({ ...formData, kelasId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelas.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama} ({k.tingkat})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    placeholder="Tempat lahir"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noTelp">No. Telepon</Label>
                  <Input
                    id="noTelp"
                    value={formData.noTelp}
                    onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                    placeholder="Nomor telepon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaOrtu">Nama Orang Tua</Label>
                  <Input
                    id="namaOrtu"
                    value={formData.namaOrtu}
                    onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                    placeholder="Nama orang tua/wali"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingSantri ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari santri..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Nama Ortu</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSantri.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Tidak ada santri yang ditemukan' : 'Belum ada data santri'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'Coba kata kunci pencarian lain' : 'Tambahkan santri baru untuk memulai'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSantri.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nis}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>
                      <Badge variant={item.jenisKelamin === 'Laki-laki' ? 'default' : 'secondary'}>
                        {item.jenisKelamin}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.kelas.nama}</TableCell>
                    <TableCell>{item.noTelp || '-'}</TableCell>
                    <TableCell>{item.namaOrtu || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}