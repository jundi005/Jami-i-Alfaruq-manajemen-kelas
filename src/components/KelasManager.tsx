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
import { BookOpen, Edit, Trash2, Plus } from 'lucide-react'

interface Kelas {
  id: string
  nama: string
  tingkat: string
  jurusan?: string
  waliKelas?: string
  kapasitas: number
  jumlahSantri: number
  createdAt: string
  updatedAt: string
}

export default function KelasManager() {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    tingkat: '',
    jurusan: '',
    waliKelas: '',
    kapasitas: 30
  })

  useEffect(() => {
    fetchKelas()
  }, [])

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas')
      if (response.ok) {
        const data = await response.json()
        setKelas(data)
      }
    } catch (error) {
      console.error('Error fetching kelas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingKelas ? `/api/kelas/${editingKelas.id}` : '/api/kelas'
      const method = editingKelas ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchKelas()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving kelas:', error)
    }
  }

  const handleEdit = (kelasItem: Kelas) => {
    setEditingKelas(kelasItem)
    setFormData({
      nama: kelasItem.nama,
      tingkat: kelasItem.tingkat,
      jurusan: kelasItem.jurusan || '',
      waliKelas: kelasItem.waliKelas || '',
      kapasitas: kelasItem.kapasitas
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        const response = await fetch(`/api/kelas/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchKelas()
        }
      } catch (error) {
        console.error('Error deleting kelas:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingKelas(null)
    setFormData({
      nama: '',
      tingkat: '',
      jurusan: '',
      waliKelas: '',
      kapasitas: 30
    })
  }

  const openDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Data Kelas</h3>
          <p className="text-sm text-gray-600">Manajemen data kelas pondok pesantren</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingKelas ? 'Edit data kelas yang sudah ada.' : 'Tambahkan kelas baru ke sistem.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Kelas</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="X IPA 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tingkat">Tingkat</Label>
                  <Select value={formData.tingkat} onValueChange={(value) => setFormData({ ...formData, tingkat: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X">X</SelectItem>
                      <SelectItem value="XI">XI</SelectItem>
                      <SelectItem value="XII">XII</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Input
                  id="jurusan"
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  placeholder="IPA / IPS / Bahasa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waliKelas">Wali Kelas</Label>
                <Input
                  id="waliKelas"
                  value={formData.waliKelas}
                  onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                  placeholder="Nama wali kelas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kapasitas">Kapasitas</Label>
                <Input
                  id="kapasitas"
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) })}
                  min="1"
                  max="50"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingKelas ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Jumlah Santri</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600">Belum ada data kelas</p>
                    <p className="text-sm text-gray-500">Tambahkan kelas baru untuk memulai</p>
                  </TableCell>
                </TableRow>
              ) : (
                kelas.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.tingkat}</TableCell>
                    <TableCell>{item.jurusan || '-'}</TableCell>
                    <TableCell>{item.waliKelas || '-'}</TableCell>
                    <TableCell>{item.kapasitas}</TableCell>
                    <TableCell>
                      <Badge variant={item.jumlahSantri >= item.kapasitas ? 'destructive' : 'secondary'}>
                        {item.jumlahSantri}/{item.kapasitas}
                      </Badge>
                    </TableCell>
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