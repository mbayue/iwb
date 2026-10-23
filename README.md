# 🇮🇩 World War Bot Indonesia (Facebook Pages)

Bot simulasi perang teritorial antar seluruh **507 Kota & Kabupaten se-Indonesia** (38 Provinsi), dirancang khusus untuk memposting gambar peta pertempuran dan laporan perang secara otomatis ke **Facebook Page** (seperti *World War Bot 2020*).

---

## 🌟 Fitur Utama

- **Cakupan 507 Kota & Kabupaten**: Data GeoJSON resmi mencakup seluruh kota otonom dan kabupaten dari Sabang sampai Merauke.
- **Peta Taktis Resolusi Tinggi (1920x1080)**: Dirender otomatis dengan skema warna unik untuk tiap faksi, garis lintasan serangan, penanda target (crosshair), dan leaderboard Top 10 secara real-time.
- **Graf Batas Darat & Selat Strategis**: Dilengkapi koneksi maritim antar-pulau realistis (Selat Sunda, Selat Bali, Selat Lombok, Selat Madura, Selat Makassar, Selat Maluku, dll.) sehingga seluruh pulau dapat saling menyerang.
- **Format Caption Khas World War Bot**: Narasi berita pertempuran dalam Bahasa Indonesia lengkap dengan tanggal simulasi, status eliminasi, klasemen 5 besar, dan hashtag kota untuk meningkatkan interaksi di Facebook.
- **Integrasi Facebook Graph API Langsung**: Mengunggah foto dan caption langsung ke feed Facebook Page.
- **Mode Dry-Run Otomatis**: Jika token Facebook belum diatur, bot tetap berjalan normal dan menyimpan hasil render ke folder `output/`.
- **Fleksibel & Otomatis**: Bisa dijalankan manual per ronde, terjadwal via Cron / Windows Task Scheduler, atau loop otomatis via `npm run auto`.

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- **Node.js**: Versi 18 ke atas (Node.js 20 / 22 / 24 direkomendasikan).

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Facebook Page (Opsional untuk Uji Coba)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi kredensial Facebook Page Anda:
```ini
FB_PAGE_ID=123456789012345
FB_PAGE_ACCESS_TOKEN=EAAG...votre_token_disini...
FB_GRAPH_VERSION=v21.0
POST_INTERVAL_SECONDS=3600
```

> **Catatan**: Jika `.env` dibiarkan kosong, bot akan otomatis masuk ke **Mode Dry-Run** (menyimpan file gambar `.png` dan caption `.txt` ke folder `output/`).

---

## 🕹️ Perintah CLI

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run turn` | Menjalankan 1 ronde pertempuran dan langsung memposting ke Facebook Page (atau simpan ke `output/` jika token kosong). |
| `npm run dry` | Menjalankan 1 ronde dalam mode dry-run (hanya menyimpan gambar dan teks secara lokal). |
| `npm run status` | Menampilkan statistik perang, jumlah faksi tersisa, dan Top 10 klasemen sementara. |
| `npm run preview` | Merender peta kondisi saat ini ke file `preview.png`. |
| `npm run auto` | Menjalankan bot secara otomatis setiap 1 jam (interval dapat diatur di `.env`). |
| `npm run sim 20` | Mensimulasikan 20 ronde pertempuran cepat di memori tanpa memposting. |
| `npm run reset` | Mengulang perang kembali ke Ronde 0 (seluruh 507 kota & kabupaten kembali merdeka). |

---

## 🔑 Cara Mendapatkan Facebook Page Token

1. Buka [Meta for Developers](https://developers.facebook.com/).
2. Buat App baru dengan tipe **Business** atau **None**.
3. Di menu **Tools**, buka **Graph API Explorer**.
4. Pilih App Anda dan pada menu dropdown **User or Page**, pilih Halaman Facebook yang Anda kelola.
5. Tambahkan izin (*permissions*):
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
6. Klik **Generate Access Token** dan setujui izin pada akun Facebook Anda.
7. Buka [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) untuk memperpanjang token menjadi *Never Expire / Long-Lived Page Access Token*.
8. Masukkan ID Halaman dan Token tersebut ke file `.env`.

---

## ⏰ Menjalankan Otomatis (Penjadwalan)

### Opsi A: Menggunakan GitHub Actions (100% Gratis - Sangat Direkomendasikan)
Workflow `.github/workflows/warbot.yml` sudah terpasang otomatis:
1. Buka repo Anda di GitHub: **Settings** → **Secrets and variables** → **Actions**.
2. Tambahkan dua **Repository Secrets**:
   - `FB_PAGE_ID`: ID Halaman Facebook Anda.
   - `FB_PAGE_ACCESS_TOKEN`: Token Akses Halaman Facebook Anda.
3. Buka **Settings** → **Actions** → **General** → pada bagian **Workflow permissions**, pilih **Read and write permissions** lalu klik **Save**.
4. Selesai! Bot akan otomatis bangun setiap 1 jam sekali, merender peta, memposting ke Facebook, dan meng-commit perkembangan perang (`data/state.json`) kembali ke repositori Anda.

### Opsi B: Menggunakan Perintah Bawaan Loop
```bash
npm run auto
```
Bot akan otomatis berjalan setiap `POST_INTERVAL_SECONDS` (default: 3600 detik / 1 jam sekali).

### Opsi C: Menggunakan Crontab (Linux / VPS)
```cron
# Jalankan setiap jam tepat (menit 0)
0 * * * * cd /path/to/iwb && node index.js turn >> /var/log/warbot.log 2>&1
```

### Opsi D: Menggunakan Windows Task Scheduler
1. Buka **Task Scheduler** di Windows.
2. Buat Task baru: `Create Basic Task...` -> Beri nama `World War Bot Indonesia`.
3. Atur Trigger: `Daily` -> Ulangi setiap 1 jam.
4. Atur Action: `Start a Program`:
   - Program/script: `node`
   - Add arguments: `index.js turn`
   - Start in: `C:\Users\bayue\Documents\tets\minekampf`

---

## 📁 Struktur Proyek

```text
minekampf/
├── data/
│   ├── indonesia_kabupaten.geojson   # Data batas wilayah 507 kota & kabupaten
│   ├── graph.json                    # Graf ketetanggaan darat & selat laut
│   └── state.json                    # Status perang berjalan (ronde, pemilik, eliminasi)
├── src/
│   ├── config.js                     # Konfigurasi & variabel lingkungan
│   ├── graph.js                      # Adjacency graph builder & BFS connectivity
│   ├── simulation.js                 # Mesin kalkulasi pertempuran & penaklukan
│   ├── renderer.js                   # Visualizer SVG ke PNG 1920x1080 via @resvg/resvg-js
│   ├── postFormatter.js              # Pembuat caption Facebook bergaya World War Bot
│   └── facebook.js                   # Client upload foto Graph API
├── output/                           # Arsip gambar & teks tiap ronde
├── index.js                          # CLI utama
├── .env.example                      # Template konfigurasi
└── package.json
```
