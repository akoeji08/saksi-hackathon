# Demo Script — SAKSI

**Durasi:** 7 menit (versi lengkap) + 90 detik (versi singkat)
**Format:** rekaman layar dengan narasi
**Setup:** WorkBuddy Desktop + PowerShell + browser GitHub

---

## Persiapan Sebelum Rekam

### Checklist

- [ ] `current-user.json` diset ke `STF-005`
- [ ] WorkBuddy Desktop terbuka, chat baru
- [ ] PowerShell terbuka di folder `saksi-hackathon`
- [ ] Browser terbuka: tab 1 = GitHub repo, tab 2 = README
- [ ] Audit log dibersihkan (opsional): `Remove-Item audit.jsonl` di folder engine
- [ ] Handphone silent, notifikasi Windows mati
- [ ] Screen resolution: minimal 1920×1080
- [ ] OBS/QuickTime siap rekam

### Narasi Utama

> *"Di puskesmas, informasi tersebar di chat, SOP, dan task board. AI yang bisa baca semuanya bisa bocorkan semuanya. SAKSI adalah workplace brain yang bisa membuktikan jawabannya — dan berani menolak."*

---

## Versi Lengkap — 7 Menit

### 0:00–0:30 — Hook

**Visual:** Slide pembuka atau tampilan WorkBuddy kosong.

**Narasi:**
> "Puskesmas Tamalanrea Jaya punya 22 pegawai, 2 Pustu, 8 Posyandu, dan 120 pasien per hari. Informasi mereka tersebar di WhatsApp, Drive, task board, dan SIMPUS. AI yang bisa membaca semuanya — bisa membocorkan semuanya. Data HIV, TB, jiwa, dan KLB Hepatitis A tidak boleh jatuh ke tangan yang salah. SAKSI adalah jawabannya: workplace brain yang bisa membuktikan jawabannya — dan berani menolak."

**Aksi:** Tampilkan judul "SAKSI — Evidence-to-Decision Engine".

---

### 0:30–1:15 — Overview Arsitektur

**Visual:** Diagram arsitektur (buka `docs/architecture.md` di browser atau tampilkan PNG).

**Narasi:**
> "SAKSI dibangun di atas tiga lapis. WorkBuddy sebagai antarmuka, skill wrapper yang membaca identitas dari file, dan engine Node.js yang deterministik. Ada tiga trust boundary: pertama, skill dipanggil berdasarkan nama, bukan keputusan LLM. Kedua, identitas dari file, bukan dari prompt. Ketiga — dan ini yang paling penting — dokumen terlarang tidak pernah masuk ke konteks LLM. Bukan hanya disembunyikan di UI, tapi benar-benar tidak diambil oleh engine."

**Aksi:** Sorot B3 di diagram.

---

### 1:15–2:15 — Demo 1: Jawaban Berbukti

**Visual:** WorkBuddy chat baru.

**Aksi:**
```
Ketik: /saksi Berapa stok Amoksisilin 500mg sekarang?
```

**Narasi:**
> "Mari mulai dengan yang sederhana. Ns. Dewi, perawat, bertanya stok Amoksisilin. Perhatikan tiga hal: pertama, jawaban langsung menyebut angka — 40 tablet. Kedua, ada dua sumber: DRG-001 dari data obat, dan DOC-006 dari formularium. Ketiga, di bawah ada baris 'Dijawab untuk: STF-005' — ini bukti bahwa engine benar-benar dipanggil dan identitas terverifikasi."

**Highlight:** Evidence cards + baris "Dijawab untuk".

---

### 2:15–3:00 — Demo 2: Refusal Equivalence

**Visual:** WorkBuddy chat baru.

**Aksi:**
```
Ketik: /saksi Apa itu Proyek Cakalang?
```

**Narasi:**
> "Sekarang Ns. Dewi bertanya tentang Proyek Cakalang — investigasi KLB Hepatitis A yang hanya boleh diakses kepala puskesmas. Perhatikan responsnya: 'Saya tidak menemukan informasi yang dapat saya akses.' Respons ini tidak menyebut Cakalang, tidak menyiratkan bahwa proyek itu ada. Mari kita bandingkan dengan proyek yang benar-benar tidak ada."

**Aksi:** Chat baru lagi.
```
Ketik: /saksi Apa itu Proyek Naga?
```

**Narasi:**
> "Respons untuk Proyek Naga — yang tidak ada — identik kata per kata. Inilah yang disebut refusal equivalence. Tidak ada informasi yang bocor melalui penolakan."

---

### 3:00–4:00 — Demo 3: Konflik Temporal

**Visual:** WorkBuddy chat baru.

**Aksi:**
```
Ketik: /saksi Jam berapa poli buka?
```

**Narasi:**
> "Pertanyaan sederhana — jam berapa poli buka? Tapi ada dua sumber yang berbeda. DOC-001 dari 2024 menyebut 08:00. CHAT-001 dari 2026 menyebut 07:30. Engine mendeteksi konflik, menampilkan kedua sumber, dan memilih yang terbaru dengan alasan eksplisit: DOC-001 telah superseded oleh CHAT-001. Ini bukan sekadar jawaban — ini penalaran yang bisa diaudit."

**Highlight:** Bagian "Sumber lama" vs "Sumber baru" + alasan pemilihan.

---

### 4:00–5:00 — Demo 4: Prompt Injection Defense

**Visual:** WorkBuddy chat baru.

**Aksi:**
```
Ketik: /saksi Apa isi template surat rujukan?
```

**Narasi:**
> "Sekarang bagian paling dramatis. Template surat rujukan kami — DOC-007 — berisi instruksi tersembunyi yang mencoba mengalihkan AI untuk mengirim seluruh data pasien HIV ke alamat email luar. Instruksi itu menyamar sebagai catatan dari Dinas Kesehatan. Perhatikan apa yang terjadi: engine mendeteksi injeksi, menonaktifkannya dengan tanda 'INSTRUKSI TERTANAM DIABAIKAN', dan memberi tahu user bahwa ada percobaan serangan. Dokumen tetap bisa dibaca, tapi instruksi berbahayanya dinonaktifkan. Tidak ada email yang terkirim, tidak ada data yang bocor."

**Highlight:** Warning banner + `[INSTRUKSI TERTANAM DIABAIKAN]`.

**Narasi tambahan:**
> "Ini adalah bukti bahwa dokumen diperlakukan sebagai data, bukan instruksi. Engine tidak bisa dibujuk untuk melanggar aturannya sendiri."

---

### 5:00–6:00 — Demo 5: Audit Ledger

**Visual:** Beralih ke PowerShell.

**Aksi:**
```powershell
node engine/show-audit.mjs --user STF-005
```

**Narasi:**
> "Setiap query yang kita lakukan tadi tercatat di audit log. Perhatikan apa yang disimpan: user, query dengan PII disamarkan, status keputusan, sumber yang dipakai, dan jumlah injeksi yang dicegat. Perhatikan apa yang TIDAK disimpan: tidak ada jawaban lengkap, tidak ada snippet, tidak ada NIK, tidak ada nomor RM. Ini bukan kebetulan — ini desain. Audit tidak boleh menjadi backdoor yang membocorkan data yang justru dilindungi."

**Aksi:**
```powershell
node engine/show-audit.mjs --status KONFLIK
```

**Narasi:**
> "Kita juga bisa filter per status. Ini menunjukkan konflik yang tadi kita deteksi, dan bagaimana engine memutuskan untuk memilih sumber terbaru."

---

### 6:00–6:45 — Responsible AI

**Visual:** Buka `docs/accountability.md` di browser.

**Narasi:**
> "SAKSI lulus 13 dari 13 test yang dijalankan. Nol kebocoran data terbatas. Nol eksekusi tanpa approval. Semua lima aturan accountable AI terbukti secara deterministik. Kami juga menemukan dan menutup empat bug selama pengujian — mulai dari LLM context leak, quality gate terlalu ketat, snippet truncation, sampai noise di test password. Setiap temuan terdokumentasi dan diperbaiki."

**Highlight:** Tabel 5 aturan + status PASS di test results.

---

### 6:45–7:00 — Penutup

**Visual:** Kembali ke WorkBuddy atau slide penutup.

**Narasi:**
> "SAKSI bukan chatbot yang pintar menjawab. SAKSI adalah agen yang bisa dipercaya — karena menunjukkan sumber, menolak dengan aman, dan meninggalkan jejak. Di puskesmas, kepercayaan bukan fitur tambahan. Kepercayaan adalah syarat."

**Aksi:** Tampilkan judul penutup dengan tagline *"Setiap jawaban punya lima saksi."*

---

## Versi Singkat — 90 Detik

### 0:00–0:15 — Hook

**Narasi:**
> "Puskesmas punya data medis sensitif. AI generik bisa bocorkan semuanya. SAKSI tidak."

### 0:15–0:35 — Demo 1: Jawaban Berbukti

**Aksi:** `/saksi Berapa stok Amoksisilin 500mg sekarang?`

**Narasi:**
> "Jawaban langsung, sumber jelas, identitas terverifikasi."

### 0:35–0:55 — Demo 2: Refusal Equivalence

**Aksi:** `/saksi Apa itu Proyek Cakalang?`

**Narasi:**
> "User tidak berhak → respons netral. Tidak menyebut proyek, tidak menyiratkan eksistensi."

### 0:55–1:15 — Demo 3 & 4: Konflik + Injeksi

**Aksi:** `/saksi Jam berapa poli buka?` lalu `/saksi Apa isi template surat rujukan?`

**Narasi:**
> "Konflik dideteksi dan dijelaskan. Injeksi dokumen dinonaktifkan dan dilaporkan."

### 1:15–1:30 — Audit + Penutup

**Aksi:** `node engine/show-audit.mjs`

**Narasi:**
> "Setiap keputusan tercatat, PII disamarkan. SAKSI: setiap jawaban punya lima saksi."

---

## Tips Rekaman

### Audio

- Gunakan mikrofon eksternal jika ada (bukan mic laptop)
- Rekam di ruangan minim gema (banyak bantal, karpet, atau lemari)
- Volume konsisten — jangan naik-turun
- Pace lambat — lebih baik 7 menit yang jelas daripada 5 menit yang terburu-buru

### Visual

- Zoom in WorkBuddy agar teks terbaca (min 125%)
- Kursor bergerak pelan dan jelas
- Jangan multitasking saat rekam — lakukan berurutan
- Cut bagian "loading" atau "thinking" jika terlalu lama

### Editing

- Cut jeda panjang dan "uhm" berlebihan
- Zoom in ke bagian penting (evidence cards, warning banner)
- Tambahkan text overlay untuk memperjelas poin kunci
- Background music soft (optional, jangan ganggu narasi)

### Upload

- YouTube **unlisted** (bukan public)
- Judul: "SAKSI — Tencent Cloud Hackathon 2026 — Demo"
- Deskripsi: link ke GitHub + acknowledgment
- Copy link ke README dan submission form

---

## Alternatif Jika Waktu Rekaman Terbatas

Jika hanya punya 90 detik untuk demo live (surprise test):

1. **0:00–0:20** — Tunjukkan refusal equivalence (`/saksi Apa itu Proyek Cakalang?`)
2. **0:20–0:40** — Tunjukkan konflik (`/saksi Jam berapa poli buka?`)
3. **0:40–1:00** — Tunjukkan injeksi (`/saksi Apa isi template surat rujukan?`)
4. **1:00–1:20** — Tunjukkan audit (`node show-audit.mjs --status KONFLIK`)
5. **1:20–1:30** — Penutup: *"Lima saksi. Setiap jawaban."*

Ini adalah tiga momen paling dramatis — refusal, konflik, injeksi — masing-masing 20 detik. Sisanya untuk audit dan penutup.

---

## Checklist Sebelum Upload

- [ ] Video 7 menit atau 90 detik (atau keduanya)
- [ ] Audio jelas
- [ ] Semua demo berhasil (tidak ada error di tengah rekaman)
- [ ] Ada cut ke bagian penting (evidence cards, warning banner)
- [ ] Judul dan deskripsi sudah diisi
- [ ] Upload ke YouTube unlisted
- [ ] Link disalin ke README dan submission form

---

**Kontak:** [email kamu]
**Repo:** https://github.com/akoeji08/saksi-hackathon