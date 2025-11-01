'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Cloud, 
  Sync, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Users, 
  FileText 
} from 'lucide-react'

interface SyncStatus {
  lastAbsensiSync?: string
  lastSantriSync?: string
  lastLaporanSync?: string
  totalAbsensi?: number
  totalSantri?: number
  totalLaporan?: number
}

export default function GoogleSheetsManager() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedKelas, setSelectedKelas] = useState('')
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async (action: string, data?: any) => {
    setSyncing(true)
    setSyncResult(null)
    setError(null)

    try {
      console.log('Starting sync:', { action, data })
      
      const response = await fetch('/api/google-sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: data || {}
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Response result:', result)
      setSyncResult(result)

      if (result.status === 'success') {
        // Refresh status after successful sync
        setTimeout(() => handleSyncStatus(), 1000)
      }
    } catch (error: any) {
      console.error('Sync error:', error)
      setError(error.message || 'Unknown error occurred')
      setSyncResult({
        status: 'error',
        message: 'Failed to sync to Google Sheets',
        details: error.message || 'Unknown error occurred'
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncStatus = async () => {
    try {
      const response = await fetch('/api/google-sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'status'
        }),
      })

      const result = await response.json()
      if (result.status === 'success') {
        setSyncStatus(result.data)
      }
    } catch (error: any) {
      // Silently handle status check errors
      setSyncStatus({
        lastAbsensiSync: 'Never',
        lastSantriSync: 'Never',
        lastLaporanSync: 'Never',
        totalAbsensi: 0,
        totalSantri: 0,
        totalLaporan: 0
      })
    }
  }

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'syncing': return <Sync className="h-5 w-5 text-blue-600 animate-spin" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getSyncColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'syncing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Google Sheets Sync</h3>
          <p className="text-sm text-gray-600">Sinkronisasi data ke Google Spreadsheet</p>
        </div>
        <Button variant="outline" onClick={handleSyncStatus}>
          <Cloud className="mr-2 h-4 w-4" />
          Check Status
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Absensi</span>
                  <Badge variant="secondary">{syncStatus.totalAbsensi || 0} records</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Last sync: {syncStatus.lastAbsensiSync || 'Never'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Santri</span>
                  <Badge variant="secondary">{syncStatus.totalSantri || 0} records</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Last sync: {syncStatus.lastSantriSync || 'Never'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Laporan</span>
                  <Badge variant="secondary">{syncStatus.totalLaporan || 0} records</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Last sync: {syncStatus.lastLaporanSync || 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Result */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSyncIcon(syncResult.status)}
              Sync Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getSyncColor(syncResult.status)}>
                  {syncResult.status}
                </Badge>
                <span className="text-sm">{syncResult.message}</span>
              </div>
              
              {syncResult.status === 'success' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {syncResult.added !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{syncResult.added}</div>
                      <p className="text-xs text-gray-600">Added</p>
                    </div>
                  )}
                  {syncResult.updated !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{syncResult.updated}</div>
                      <p className="text-xs text-gray-600">Updated</p>
                    </div>
                  )}
                  {syncResult.errors && syncResult.errors.length > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{syncResult.errors.length}</div>
                      <p className="text-xs text-gray-600">Errors</p>
                    </div>
                  )}
                </div>
              )}
              
              {syncResult.note && (
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                  <strong>📌 Note:</strong> {syncResult.note}
                </div>
              )}
              
              {syncResult.details && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <strong>Details:</strong> {syncResult.details}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sync Santri
            </CardTitle>
            <CardDescription className="text-xs">
              Master data santri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleSync('santri')} 
              disabled={syncing}
              className="w-full"
              size="sm"
            >
              {syncing ? (
                <Sync className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Sync Santri
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sync Absensi
            </CardTitle>
            <CardDescription className="text-xs">
              Data absensi harian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-xs">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={new Date().toISOString().split('T')[0]}
                className="h-8 text-xs"
                readOnly
              />
            </div>
            <Button 
              onClick={() => handleSync('absensi', { 
                tanggal: new Date().toISOString().split('T')[0] 
              })} 
              disabled={syncing}
              className="w-full"
              size="sm"
            >
              {syncing ? (
                <Sync className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Sync Hari Ini
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sync Laporan
            </CardTitle>
            <CardDescription className="text-xs">
              Rekap bulanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bulan" className="text-xs">Bulan</Label>
              <Input
                id="bulan"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button 
              onClick={() => handleSync('laporan', { month: selectedMonth })} 
              disabled={syncing}
              className="w-full"
              size="sm"
            >
              {syncing ? (
                <Sync className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Sync Bulanan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sync className="h-4 w-4" />
              Sync All
            </CardTitle>
            <CardDescription className="text-xs">
              Semua data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                handleSync('santri')
                setTimeout(() => handleSync('absensi', { 
                  tanggal: new Date().toISOString().split('T')[0] 
                }), 1000)
                setTimeout(() => handleSync('laporan', { month: selectedMonth }), 2000)
              }} 
              disabled={syncing}
              className="w-full"
              size="sm"
              variant="default"
            >
              {syncing ? (
                <Sync className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Sync All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>Buat Google Spreadsheet baru dengan nama "Absensi Pondok Pesantren"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>Buka Extensions → Apps Script, copy code dari google-apps-script.js</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>Deploy sebagai Web App, copy URL-nya</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Tambah environment variable: GOOGLE_SCRIPT_URL</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">5.</span>
              <span>Restart development server dan test sync</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}