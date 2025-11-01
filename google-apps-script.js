// Google Apps Script untuk Pondok Pesantren Absensi System
// Author: AI Assistant
// Version: 1.0

// Global variables
const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_ABSENSI = SPREADSHEET.getSheetByName("Absensi") || SPREADSHEET.insertSheet("Absensi");
const SHEET_SANTRI = SPREADSHEET.getSheetByName("Santri") || SPREADSHEET.insertSheet("Santri");
const SHEET_LAPORAN = SPREADSHEET.getSheetByName("Laporan") || SPREADSHEET.insertSheet("Laporan");

// Initialize sheets on first run
function initializeSheets() {
  // Setup Absensi sheet
  if (SHEET_ABSENSI.getLastRow() === 0) {
    SHEET_ABSENSI.getRange("A1:H1").setValues([[
      "Tanggal", "NIS", "Nama", "Kelas", "Status", "Keterangan", "Waktu Input", "ID Absensi"
    ]]);
    SHEET_ABSENSI.getRange("A1:H1").setFontWeight("bold");
    SHEET_ABSENSI.autoResizeColumn(1, 8);
  }

  // Setup Santri sheet
  if (SHEET_SANTRI.getLastRow() === 0) {
    SHEET_SANTRI.getRange("A1:J1").setValues([[
      "NIS", "Nama", "Jenis Kelamin", "Kelas", "Tempat Lahir", "Tanggal Lahir", "Alamat", "No Telepon", "Nama Ortu", "ID Santri"
    ]]);
    SHEET_SANTRI.getRange("A1:J1").setFontWeight("bold");
    SHEET_SANTRI.autoResizeColumn(1, 10);
  }

  // Setup Laporan sheet
  if (SHEET_LAPORAN.getLastRow() === 0) {
    SHEET_LAPORAN.getRange("A1:I1").setValues([[
      "Bulan", "Kelas", "Total Santri", "Hadir", "Sakit", "Izin", "Alpha", "% Kehadiran", "Tanggal Update"
    ]]);
    SHEET_LAPORAN.getRange("A1:I1").setFontWeight("bold");
    SHEET_LAPORAN.autoResizeColumn(1, 9);
  }
}

// Main function untuk handle POST requests
function doPost(e) {
  try {
    initializeSheets();
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'absensi';
    
    let result;
    switch (action) {
      case 'absensi':
        result = handleAbsensiData(data);
        break;
      case 'santri':
        result = handleSantriData(data);
        break;
      case 'laporan':
        result = handleLaporanData(data);
        break;
      case 'status':
        result = getStatus();
        break;
      default:
        result = { status: 'error', message: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle absensi data
function handleAbsensiData(data) {
  const absensiData = data.data || [];
  let addedCount = 0;
  let updatedCount = 0;
  let errors = [];

  absensiData.forEach((item, index) => {
    try {
      // Check if data already exists
      const existingRow = findExistingAbsensi(item.id);
      
      const rowData = [
        formatDate(item.tanggal),
        item.nis || '',
        item.nama || '',
        item.kelas || '',
        item.status || '',
        item.keterangan || '',
        formatDateTime(item.createdAt),
        item.id || ''
      ];

      if (existingRow) {
        // Update existing row
        SHEET_ABSENSI.getRange(existingRow, 1, 1, 8).setValues([rowData]);
        updatedCount++;
      } else {
        // Add new row
        SHEET_ABSENSI.appendRow(rowData);
        addedCount++;
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error.toString()}`);
    }
  });

  // Apply conditional formatting
  applyAbsensiFormatting();

  return {
    status: 'success',
    message: `Sync completed: ${addedCount} added, ${updatedCount} updated`,
    added: addedCount,
    updated: updatedCount,
    errors: errors
  };
}

// Handle santri data
function handleSantriData(data) {
  const santriData = data.data || [];
  let addedCount = 0;
  let updatedCount = 0;

  // Clear existing data (except header)
  if (SHEET_SANTRI.getLastRow() > 1) {
    SHEET_SANTRI.getRange(2, 1, SHEET_SANTRI.getLastRow() - 1, 10).clearContent();
  }

  santriData.forEach((item) => {
    const rowData = [
      item.nis || '',
      item.nama || '',
      item.jenisKelamin || '',
      item.kelas?.nama || '',
      item.tempatLahir || '',
      formatDate(item.tanggalLahir),
      item.alamat || '',
      item.noTelp || '',
      item.namaOrtu || '',
      item.id || ''
    ];
    SHEET_SANTRI.appendRow(rowData);
    addedCount++;
  });

  SHEET_SANTRI.autoResizeColumn(1, 10);

  return {
    status: 'success',
    message: `Santri data synced: ${addedCount} records`,
    added: addedCount
  };
}

// Handle laporan data
function handleLaporanData(data) {
  const laporanData = data.data || [];
  let addedCount = 0;

  // Clear existing data for the month
  const month = data.month || new Date().toISOString().slice(0, 7);
  clearLaporanDataForMonth(month);

  laporanData.forEach((item) => {
    const rowData = [
      item.bulan || month,
      item.kelas || '',
      item.totalSantri || 0,
      item.totalHadir || 0,
      item.totalSakit || 0,
      item.totalIzin || 0,
      item.totalAlpha || 0,
      item.persentaseKehadiran || 0,
      formatDateTime(new Date())
    ];
    SHEET_LAPORAN.appendRow(rowData);
    addedCount++;
  });

  // Apply conditional formatting for percentages
  applyLaporanFormatting();

  return {
    status: 'success',
    message: `Laporan data synced: ${addedCount} records`,
    added: addedCount
  };
}

// Get sync status
function getStatus() {
  const lastAbsensiSync = getLastSyncTime(SHEET_ABSENSI);
  const lastSantriSync = getLastSyncTime(SHEET_SANTRI);
  const lastLaporanSync = getLastSyncTime(SHEET_LAPORAN);

  return {
    status: 'success',
    data: {
      lastAbsensiSync,
      lastSantriSync,
      lastLaporanSync,
      totalAbsensi: SHEET_ABSENSI.getLastRow() - 1,
      totalSantri: SHEET_SANTRI.getLastRow() - 1,
      totalLaporan: SHEET_LAPORAN.getLastRow() - 1
    }
  };
}

// Helper functions
function findExistingAbsensi(id) {
  if (!id) return null;
  const data = SHEET_ABSENSI.getRange(2, 8, SHEET_ABSENSI.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      return i + 2; // +2 because array starts at 0 and we skip header
    }
  }
  return null;
}

function clearLaporanDataForMonth(month) {
  if (SHEET_LAPORAN.getLastRow() <= 1) return;
  
  const data = SHEET_LAPORAN.getRange(2, 1, SHEET_LAPORAN.getLastRow() - 1, 1).getValues();
  const rowsToDelete = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().startsWith(month)) {
      rowsToDelete.push(i + 2); // +2 because array starts at 0 and we skip header
    }
  }
  
  // Delete rows in reverse order to maintain row numbers
  rowsToDelete.reverse().forEach(row => {
    SHEET_LAPORAN.deleteRow(row);
  });
}

function getLastSyncTime(sheet) {
  if (sheet.getLastRow() <= 1) return 'Never';
  const lastRow = sheet.getLastRow();
  const timeColumn = sheet.getName() === 'Absensi' ? 7 : 9;
  const lastTime = sheet.getRange(lastRow, timeColumn).getValue();
  return lastTime ? formatDateTime(lastTime) : 'Unknown';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID');
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID');
}

// Conditional formatting
function applyAbsensiFormatting() {
  const range = SHEET_ABSENSI.getRange(2, 5, SHEET_ABSENSI.getLastRow() - 1, 1);
  
  // Green for Hadir
  const greenRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Hadir')
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .setRanges([range])
    .build();
  
  // Yellow for Sakit
  const yellowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Sakit')
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .setRanges([range])
    .build();
  
  // Blue for Izin
  const blueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Izin')
    .setBackground('#d1ecf1')
    .setFontColor('#0c5460')
    .setRanges([range])
    .build();
  
  // Red for Alpha
  const redRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Alpha')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .setRanges([range])
    .build();
  
  SHEET_ABSENSI.setConditionalFormatRules([greenRule, yellowRule, blueRule, redRule]);
}

function applyLaporanFormatting() {
  const range = SHEET_LAPORAN.getRange(2, 8, SHEET_LAPORAN.getLastRow() - 1, 1);
  
  // Green for >= 90%
  const greenRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(90)
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .setRanges([range])
    .build();
  
  // Yellow for 75-89%
  const yellowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(75, 89)
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .setRanges([range])
    .build();
  
  // Red for < 75%
  const redRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(75)
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .setRanges([range])
    .build();
  
  SHEET_LAPORAN.setConditionalFormatRules([greenRule, yellowRule, redRule]);
}

// Function untuk manual testing
function testFunction() {
  initializeSheets();
  return "Sheets initialized successfully!";
}

// Function untuk clear all data (testing only)
function clearAllData() {
  SHEET_ABSENSI.getRange(2, 1, SHEET_ABSENSI.getLastRow() - 1, 8).clearContent();
  SHEET_SANTRI.getRange(2, 1, SHEET_SANTRI.getLastRow() - 1, 10).clearContent();
  SHEET_LAPORAN.getRange(2, 1, SHEET_LAPORAN.getLastRow() - 1, 9).clearContent();
  return "All data cleared!";
}