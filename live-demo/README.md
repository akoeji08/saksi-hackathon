# SAKSI — situs publik

Satu halaman statis yang menjadi wajah proyek: narasi produk, demo engine yang
benar-benar berjalan, dan batasan yang disebut terbuka.

**Tidak ada build step, tidak ada dependensi, tidak ada request jaringan setelah
halaman dimuat.**

```
index.html    seluruh struktur & konten (12 bagian)
styles.css    sistem desain (gelap, serif editorial, aksen cyan)
site.js       navigasi, scroll-story 01—04, tab skenario, pipeline 10 tahap
demo.js       UI demo (identitas, chat, gate, audit ledger)
engine.js     port 1:1 dari engine/ask.mjs v5
data.js       dihasilkan dari data/*.json oleh tools/build_data.py
test_engine.mjs   validasi headless, 10/10 lulus
```

## Menjalankan lokal

```bash
cd live-demo
python -m http.server 8080
# buka http://localhost:8080
```

Membuka `index.html` langsung lewat `file://` juga bekerja.

## Urutan bagian

| # | Bagian | Isi |
|:--:|:---|:---|
| 1 | Hero | Tesis, metrik, kartu bukti contoh |
| 2 | Masalah | Mengapa AI generik gagal di puskesmas |
| 3 | Lima Saksi | S · A · K · S · I sebagai jaminan yang ditegakkan di kode |
| 4 | Story 01—04 | Identitas → gerbang → bukti → jejak (horizontal scroll) |
| 5 | Demo | Engine asli di browser, ganti identitas dan bandingkan |
| 6 | Cara kerja | 10 tahap pipeline, dapat diklik per tahap |
| 7 | Trust boundary | B1—B4: mekanisme, yang dicegah, risiko bila gagal |
| 8 | Skenario | 4 tab: bukti, penolakan, injeksi, konflik |
| 9 | Hasil uji | 13/20 lulus, 0 gagal, critical failure check |
| 10 | Pasang | 3 langkah, 5 menit |
| 11 | Status | Siap / butuh setup / di luar cakupan |
| 12 | FAQ | 7 pertanyaan, termasuk yang tidak nyaman |

## Demo yang paling menunjukkan

Tanyakan **“Apa itu Proyek Cakalang?”** sebagai **STF-005** (perawat):
ditolak, gate mencatat **21 diblokir / 0 lolos ACL**.

Lalu pilih **STF-001** (Kepala Puskesmas) dan tanyakan hal yang sama:
dijawab dengan **3 kartu bukti**, gate menjadi **1 diblokir / 5 lolos**.

Pertanyaan identik, hasil berbeda — itu inti *permission-first*.

## Regenerasi data

`data.js` tidak diedit manual. Ubah `data/*.json`, lalu:

```bash
python tools/build_data.py
```

## Catatan

- Seluruh data fiktif.
- Engine deterministik; tidak ada LLM di jalur jawaban.
- Tidak ada analytics, tidak ada cookie pihak ketiga. Font dimuat dari Google
  Fonts dengan fallback sistem (Georgia / system-ui) bila offline.
