# Google Sheets Dashboard Template untuk Pondok Pesantren

## Setup Dashboard di Google Sheets

### 1. Buat Dashboard Sheet
Buat sheet baru dengan nama "Dashboard" di Google Spreadsheet Anda.

### 2. Layout Dashboard

#### **Area A: Summary Cards (A1:D10)**
```
A1: DASHBOARD ABSENSI PONDOK PESANTREN
A2: =TEXT(TODAY(),"dd mmmm yyyy")

A4: Total Santri
B4: =COUNTA(Santri!A:A)-1
C4: =IF(B4>0,B4&" Santri","Tidak Ada Data")

A5: Total Kelas
B5: =COUNTUNIQUE(Santri!D:D)
C5: =IF(B5>0,B5&" Kelas","Tidak Ada Data")

A6: Hari Ini Hadir
B6: =COUNTIFS(Absensi!A:A,TODAY(),Absensi!E:E,"Hadir")
C6: =IF(B6>0,B6&" Orang","Tidak Ada Data")

A7: Hari Ini Sakit
B7: =COUNTIFS(Absensi!A:A,TODAY(),Absensi!E:E,"Sakit")
C7: =IF(B7>0,B7&" Orang","Tidak Ada Data")

A8: Hari Ini Izin
B8: =COUNTIFS(Absensi!A:A,TODAY(),Absensi!E:E,"Izin")
C8: =IF(B8>0,B8&" Orang","Tidak Ada Data")

A9: Hari Ini Alpha
B9: =COUNTIFS(Absensi!A:A,TODAY(),Absensi!E:E,"Alpha")
C9: =IF(B9>0,B9&" Orang","Tidak Ada Data")
```

#### **Area B: Monthly Chart (F1:K20)**
```
F1: GRAFIK KEHADIRAN BULANAN
F2: =TEXT(TODAY(),"mmmm yyyy")

F4: Kelas
G4: Hadir
H4: Sakit
I4: Izin
J4: Alpha
K4: % Kehadiran

F5: =UNIQUE(Laporan!B:B)
G5: =SUMIFS(Laporan!D:D,Laporan!B:B,F5)
H5: =SUMIFS(Laporan!E:E,Laporan!B:B,F5)
I5: =SUMIFS(Laporan!F:F,Laporan!B:B,F5)
J5: =SUMIFS(Laporan!G:G,Laporan!B:B,F5)
K5: =IF(G5+H5+I5+J5>0,G5/(G5+H5+I5+J5),0)
```

#### **Area C: Top Performers (A12:C25)**
```
A12: TOP PERFORMERS BULAN INI
A13: Peringkat
B13: Nama Santri
C13: % Kehadiran

A14: 1
B14: =INDEX(Santri!B:B,MATCH(MAX(COUNTIFS(Absensi!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),Absensi!A:A,"<="&DATE(YEAR(TODAY()),MONTH(TODAY())+1,0),Absensi!C:C,Santri!B:B,Absensi!E:E,"Hadir")),Santri!B:B,0))
C14: =MAX(COUNTIFS(Absensi!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),Absensi!A:A,"<="&DATE(YEAR(TODAY()),MONTH(TODAY())+1,0),Absensi!C:C,Santri!B:B,Absensi!E:E,"Hadir"))/COUNTIFS(Absensi!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),Absensi!A:A,"<="&DATE(YEAR(TODAY()),MONTH(TODAY())+1,0),Absensi!C:C,Santri!B:B)
```

#### **Area D: Alert Table (E12:H25)**
```
E12: ALERTS & NOTIFICATIONS
E13: Tanggal
F13: Nama
G13: Status
H13: Keterangan

E14: =FILTER(Absensi!A:A,Absensi!E:E="Alpha")
F14: =FILTER(Absensi!C:C,Absensi!E:E="Alpha")
G14: =FILTER(Absensi!E:E,Absensi!E:E="Alpha")
H14: =FILTER(Absensi!F:F,Absensi!E:E="Alpha")
```

### 3. Conditional Formatting

#### **Summary Cards:**
- B4:B9 → Green fill untuk nilai > 0
- B9 → Red fill jika > 5

#### **Performance Table:**
- C14:C25 → Green fill untuk >= 90%
- C14:C25 → Yellow fill untuk 75-89%
- C14:C25 → Red fill untuk < 75%

#### **Alert Table:**
- G14:G25 → Red fill untuk "Alpha"
- H14:H25 → Yellow fill untuk ada keterangan

### 4. Charts

#### **Monthly Attendance Chart:**
1. Select F4:K10
2. Insert → Chart → Bar chart
3. Chart title: "Grafik Kehadiran Bulanan"
4. X-axis: Kelas
5. Y-axis: Jumlah

#### **Daily Trend Chart:**
1. Select data dari Absensi sheet
2. Insert → Chart → Line chart
3. Chart title: "Trend Kehadiran Harian"

### 5. Advanced Formulas

#### **Auto-refresh Timestamp:**
```
A2: =TEXT(TODAY(),"dd mmmm yyyy") & " - " & TEXT(NOW(),"hh:mm:ss")
```

#### **Attendance Rate Calculation:**
```
K5: =IF(G5+H5+I5+J5>0,ROUND(G5/(G5+H5+I5+J5)*100,1)&"%","0%")
```

#### **Class Performance Ranking:**
```
L5: =RANK(K5,$K$5:$K$10,0)
M5: =IF(L5=1,"🏆",IF(L5=2,"🥈",IF(L5=3,"🥉","")))
```

### 6. Dashboard Automation

#### **Auto-refresh Script (Apps Script):**
```javascript
function refreshDashboard() {
  SpreadsheetApp.flush();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dashboard").getRange("A2").setValue(
    new Date().toLocaleString('id-ID')
  );
}

// Set trigger untuk refresh setiap jam
function createHourlyTrigger() {
  ScriptApp.newTrigger('refreshDashboard')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### 7. Mobile View Optimization

#### **Responsive Layout:**
- Wrap text untuk semua cells
- Adjust column widths untuk mobile
- Use larger fonts (12pt+)

#### **Quick Access Buttons:**
```
A20: [SYNC NOW]
B20: [VIEW REPORTS]
C20: [EXPORT DATA]
```

### 8. Export Features

#### **Daily Report Export:**
```javascript
function exportDailyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absensi");
  const data = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  
  // Create PDF or Excel file
  // Send email attachment
}
```

#### **Monthly Summary Export:**
```javascript
function exportMonthlySummary() {
  const dashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dashboard");
  const range = dashboard.getRange("A1:K25");
  
  // Export as PDF
  // Auto-email to admin
}
```

### 9. Security & Access Control

#### **Protected Sheets:**
- Protect Dashboard sheet (view only)
- Protect formula cells
- Allow data entry only in specific ranges

#### **User Permissions:**
- Admin: Full access
- Teacher: View + edit absensi
- Student: View only

### 10. Integration Features

#### **Email Notifications:**
```javascript
function sendDailyReport() {
  const email = "admin@pondok.com";
  const subject = "Daily Attendance Report - " + new Date().toLocaleDateString();
  const body = createEmailBody();
  
  MailApp.sendEmail(email, subject, body);
}
```

#### **WhatsApp Integration:**
- Use Google Forms + Zapier
- Auto-send attendance notifications to parents

## Usage Instructions

1. **Daily Check**: Buka Dashboard sheet setiap pagi
2. **Sync Data**: Klik "SYNC NOW" untuk update data terbaru
3. **Monitor Alerts**: Periksa Alert table untuk santri alpha
4. **Generate Reports**: Export data untuk rapat bulanan
5. **Backup**: Download CSV setiap akhir bulan

## Troubleshooting

- **Data tidak update**: Check API connection
- **Formula error**: Verify range references
- **Chart tidak muncul**: Refresh data range
- **Permission denied**: Check sheet protection settings

Dashboard ini akan memberikan overview lengkap sistem absensi pondok pesantren Anda secara real-time!