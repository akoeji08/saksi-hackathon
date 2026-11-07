# SUBMIT — Paket Submission Hackathon SAKSI

Dokumen kerja untuk mengisi form submission. Semua yang bisa di-copy-paste ada di sini,
lengkap dengan lokasi file yang perlu diunggah.

**Status terakhir diperbarui:** 7 November 2026

---

## 0. Ringkasan — apa yang siap, apa yang belum

| # | Komponen | Status | Keterangan |
|:--:|:---|:---:|:---|
| 1 | Project Description | ✅ Siap | Teks siap copy, 2 versi (markdown & teks-polos) |
| 2 | Cover Image 16:9 | ✅ Siap | 1636×920, 261 KB (di bawah batas 1 MB) |
| 3 | Architecture Diagram PPT | ✅ Siap | 5 slide, 43 KB |
| 4 | Chat log screenshots | ✅ Siap | 4 tangkapan asli WorkBuddy (syarat minimal 3) |
| 5 | Conversation history | ✅ Siap | Transkrip 320 KB, 25 permintaan, 826 pemanggilan alat |
| 6 | Project Link | ✅ Live | Sudah tayang dan terverifikasi |
| 7 | Demo video | ⚠️ **Perlu unggah ulang** | File 5:16 sudah jadi; link YouTube masih versi lama |
| 8 | Expert package (opsional) | ✅ Siap | Untuk dipasang juri lewat Expert Center |

**Dua hal yang hanya bisa Anda lakukan:**

1. **Unggah video baru ke YouTube** (§7) — link lama menunjuk ke video versi lama.
2. **Publish Expert di Expert Center** (§8, opsional) — untuk mendapat tautan launcher.

---

## 1. Peta field → isi

| Field di form | Yang diisi | Lokasi |
|:---|:---|:---|
| Project Name | `SAKSI` | §2 |
| Tagline / One-liner | Teks pendek | §3 |
| Project Description | Teks panjang | §4 → copy dari `project-description.md` |
| Cover Image (16:9) | **Upload file** | `submission-assets\SAKSI-Cover-16x9.jpg` |
| Architecture Diagram | **Upload file** | `submission-assets\saksi-architecture\SAKSI-Architecture-Diagram.pptx` |
| WorkBuddy Conversation History | **Upload file** | `submission-assets\WorkBuddy-Conversation-History.md` |
| Chat log screenshots (min. 3) | **Upload 4 file** | `submission-assets\real\real-1..4*.png` |
| Project Link | URL | §6 |
| Demo Video | URL | §7 |
| GitHub / Source | URL | §6 |

---

## 2. Project Name

```
SAKSI
```

Kalau field-nya butuh nama panjang:

```
SAKSI — Evidence-to-Decision Engine
```

---

## 3. Tagline / One-liner

Pilih satu sesuai batas karakter field.

**Versi pendek (58 karakter):**

```
Workplace brain yang membuktikan jawabannya — dan berani menolak.
```

**Versi sedang (104 karakter):**

```
Mesin keputusan berbasis bukti untuk puskesmas: periksa izin sebelum menjawab, tempelkan sumber, catat audit.
```

**Versi bahasa Inggris (76 karakter):**

```
An evidence-first workplace brain that proves its answers — and dares to refuse.
```

---

## 4. Project Description

Buka file ini:

```
C:\saksi-hackathon\submission-assets\project-description.md
```

Isinya dua versi:

- **§1 Versi markdown** — kalau field menerima format (bold, heading, bullet)
- **§2 Versi teks-polos** — kalau field menolak markdown (paragraf polos, tanpa simbol)

**Copy bagian dalamnya saja**, jangan sertakan header instruksi di atasnya.

Kalau field punya batas karakter dan versi lengkap terlalu panjang, pakai versi ringkas ini:

```
SAKSI adalah Evidence-to-Decision Engine untuk Puskesmas Tamalanrea Jaya, Makassar —
puskesmas yang melayani ~120 pasien/hari dengan 22 pegawai. SAKSI dikemas sebagai Ahli
(Expert) WorkBuddy dan dipasang dengan satu klik: tanpa terminal, tanpa clone, tanpa API
key. Skill, dataset, dan engine ikut di dalam paketnya.

MASALAH. Informasi operasional puskesmas tersebar di WhatsApp, Drive, task board, SIMPUS,
dan laporan bulanan. LLM generik yang bisa membaca semuanya bisa membocorkan semuanya:
diagnosis HIV, TB, kesehatan jiwa, proyek internal, anggaran, dan data KLB. Masalahnya
bukan AI yang kurang pintar, melainkan tidak ada bukti bahwa AI membaca yang boleh dibaca
dan menolak yang tidak boleh.

SOLUSI. Tiga jaminan. Pertama, izin diperiksa sebelum retrieval: identitas dibaca dari
berkas lokal, bukan dari prompt, dan ACL deny-by-default berjalan sebelum satu dokumen pun
masuk konteks LLM. Kedua, setiap jawaban membawa kartu bukti berisi ID sumber, tanggal, dan
kutipan, sehingga setiap klaim bisa dilacak. Ketiga, audit hanya menyimpan metadata (kueri
ter-mask, ID sumber, keputusan), tidak pernah isi jawaban.

YANG MEMBEDAKAN. Setiap keluaran menyertakan penghitung gerbang _meta.gate. Untuk pertanyaan
"Apa itu Proyek Cakalang?" sebagai STF-005 (perawat), hasilnya 21 diblokir / 42 dipindai /
0 lolos, status BUKTI_BELUM_CUKUP. Dengan pertanyaan identik sebagai STF-001 (kepala
puskesmas), hasilnya 1 diblokir / 42 dipindai / 5 lolos, status TERVERIFIKASI dengan tiga
sumber. Pertanyaan sama, pengguna berbeda, hasil berbeda — dan angkanya bisa diaudit, bukan
hanya diklaim.

ARSITEKTUR. Tiga lapis, empat batas kepercayaan. Lapis 1 antarmuka chat WorkBuddy Desktop.
Lapis 2 skill: instruksi SKILL.md plus wrapper yang membaca identitas dari current-user.json.
Lapis 3 engine: pipeline Node.js deterministik 10 tahap, dari User Resolver, Permission Gate,
Retrieval, Scoring, Quality Gate, Conflict Detector, Injection Sanitizer, PII Masking,
Answer Composer, sampai Audit Ledger. Batas B1 memastikan LLM tidak menjawab di luar engine.
B2 memastikan identitas tidak bisa diubah lewat prompt. B3 memastikan dokumen tak berhak
tidak pernah masuk konteks. B4 memastikan audit tidak menyimpan isi.

FITUR. Refusal equivalence (penolakan identik baik data ada maupun tidak), resolusi konflik
temporal dengan alasan tertulis, pertahanan prompt injection lewat 10 pola regex, dan
read-only by design.

HASIL. 13 dari 20 kasus uji lulus, 0 gagal, 7 backlog karena butuh patients.json yang tidak
boleh disintesis. Nol kebocoran data, nol eksekusi tak berwenang, nol klaim terlarang.

Demo: https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO
Kode: https://github.com/akoeji08/saksi-hackathon
```

---

## 5. File yang perlu diunggah

Semua path absolut — buka File Explorer dan tempel ke address bar.

### 5.1 Cover Image 16:9

```
C:\saksi-hackathon\submission-assets\SAKSI-Cover-16x9.jpg
```

- Dimensi **1636 × 920** (rasio 1.778 = 16:9)
- Ukuran **261 KB** — di bawah batas 1 MB
- Ada versi PNG (`SAKSI-Cover-16x9-master.png`, 1.5 MB) — **jangan dipakai**, melebihi 1 MB

### 5.2 Architecture Diagram PPT

```
C:\saksi-hackathon\submission-assets\saksi-architecture\SAKSI-Architecture-Diagram.pptx
```

5 slide, 43 KB:

1. Judul + akronim SAKSI
2. Arsitektur sistem — 3 lapis, 4 trust boundaries
3. Engine pipeline — 10 tahap deterministik
4. Trust boundaries — apa yang bocor kalau masing-masing gagal
5. Empat alur data — bukti perilaku engine

### 5.3 Chat log screenshots — unggah keempatnya

```
C:\saksi-hackathon\submission-assets\real\real-1-evidence-based-answer.png
C:\saksi-hackathon\submission-assets\real\real-2-refusal-equivalence.png
C:\saksi-hackathon\submission-assets\real\real-3-prompt-injection-defense.png
C:\saksi-hackathon\submission-assets\real\real-4-conflict-resolution.png
```

Semuanya 2748 × 1754, 300–420 KB. Ini **tangkapan asli** jendela WorkBuddy Desktop
(v5.9.4), bukan mockup — terlihat dari chrome aplikasi, daftar tugas di kiri, dan nama
akun di kiri bawah.

Isi masing-masing:

| File | Yang ditunjukkan |
|:---|:---|
| real-1 | `/saksi Berapa stok Amoksisilin 500mg sekarang?` → jawaban + 2 sumber |
| real-2 | Penolakan atas Proyek Cakalang, tanpa menyiratkan eksistensi |
| real-3 | Injeksi prompt di DOC-007 terdeteksi dan disanitasi |
| real-4 | Konflik DOC-001 vs CHAT-001, resolusi memilih yang terbaru |

> Kalau form hanya menerima 3 file, unggah **real-1, real-2, real-4** — ketiganya
> menunjukkan tiga perilaku inti (bukti, penolakan, konflik).

### 5.4 WorkBuddy Conversation History

```
C:\saksi-hackathon\submission-assets\WorkBuddy-Conversation-History.md
```

Transkrip Markdown 320 KB dari sesi pengembangan, 3–7 November 2026:

- 25 permintaan pengguna
- 343 balasan asisten
- 826 pemanggilan alat (dengan nama alat dan argumen ringkas)

Isi internal seperti reasoning model dan snapshot berkas sudah dibuang, jadi yang tersisa
adalah alur kerja yang bisa dibaca.

Kalau form butuh format lain (PDF), konversi dulu:

```bash
pandoc WorkBuddy-Conversation-History.md -o WorkBuddy-Conversation-History.pdf
```

### 5.5 Demo video (file, untuk diunggah ke YouTube)

```
C:\saksi-hackathon\submission-assets\SAKSI-demo-video-final.mp4
```

- Durasi **5:15.9**, 1920×1080, 30 fps
- Ukuran 17.9 MB
- Narasi bahasa Indonesia, tempo natural

---

## 6. Project Link & sumber

**Project Link (live demo):**

```
https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO
```

Sudah tayang dan terverifikasi. Sertakan **seluruh URL termasuk `?sharecode=`** — tanpa
bagian itu halaman mengembalikan 403.

**GitHub:**

```
https://github.com/akoeji08/saksi-hackathon
```

---

## 7. Demo video — ⚠️ perlu unggah ulang

Video sudah dibangun ulang dan **berbeda** dari yang ada di YouTube sekarang. Yang lama
tidak punya adegan gerbang izin dan tidak punya adegan pemasangan satu klik.

**Langkah:**

1. Buka https://youtube.com/upload
2. Unggah `C:\saksi-hackathon\submission-assets\SAKSI-demo-video-final.mp4`
3. Isi judul:

   ```
   SAKSI — Evidence-to-Decision Engine untuk Puskesmas | WorkBuddy
   ```

4. Isi deskripsi:

   ```
   SAKSI adalah workplace brain untuk Puskesmas Tamalanrea Jaya yang memeriksa izin
   sebelum menjawab, menempelkan sumber pada setiap klaim, menolak tanpa membocorkan
   keberadaan data, dan mencatat audit tanpa menyimpan isi.

   Demo langsung: https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO
   Kode sumber: https://github.com/akoeji08/saksi-hackathon

   Dibuat untuk Tencent Cloud AI CAN DO IT Hackathon Indonesia 2026.
   ```

5. **Visibility: Unlisted** — bukan Private. Juri tidak bisa membuka video Private.
6. Setelah selesai, salin link baru dan perbarui di form + `README.md`.

Link lama (untuk referensi): `https://youtu.be/AMkMF_ZJjUo`

---

## 8. Opsional — Expert package

```
C:\saksi-hackathon\submission-assets\expert\saksi.zip
```

84 KB, 16 file. Berisi paket Ahli WorkBuddy yang mandiri: engine, dataset, skrip, dan
avatar. Sudah diuji dengan cara diekstrak ke direktori kosong tanpa repo — berjalan benar.
Berguna kalau juri ingin mencoba SAKSI langsung di WorkBuddy mereka tanpa clone repo.
Kalau form tidak menyediakan tempat untuk file tambahan, lampirkan di deskripsi sebagai
tautan GitHub saja.

---

## 9. Checklist sebelum menekan Submit

- [ ] Project Description sudah ditempel dan **tidak terpotong** di akhir
- [ ] Cover image terunggah, preview menampilkan gambar (bukan ikon rusak)
- [ ] Ukuran cover di bawah 1 MB — pakai `SAKSI-Cover-16x9.jpg`, bukan PNG
- [ ] PPT terunggah dan bisa dibuka
- [ ] Minimal 3 screenshot chat terunggah
- [ ] Conversation history terunggah
- [ ] Project Link dibuka di jendela incognito → halaman tampil, bukan 403
- [ ] Link YouTube dibuka di jendela incognito → video bisa diputar
- [ ] Semua field wajib terisi (tidak ada yang kosong)
- [ ] **Screenshot / simpan halaman konfirmasi** setelah submit

---

## 10. Kalau ada field yang tidak tercantum di atas

Siapkan jawaban ini untuk field tak terduga.

**Kategori / track**

```
Challenge A — The Workplace Brain
```

**Industri / domain**

```
Kesehatan masyarakat (primary healthcare)
```

**Tech stack**

```
WorkBuddy Desktop (Tencent Cloud), Node.js 20+, JSON datasets, Remotion (React + TypeScript), edge-tts
```

**Bahasa pemrograman**

```
JavaScript (ES modules), TypeScript, Python (tooling)
```

**Anggota tim**

```
Anshar Priwarsani — AI Engineer, AkoejiDev
```

**Negara / kota**

```
Indonesia — Makassar, Sulawesi Selatan
```

**Apakah menggunakan data nyata?**

```
Tidak. Seluruh dataset fiktif: 22 staf, 5 tingkat clearance, 20 dokumen, 22 chat, 15 obat.
Data pasien nyata sengaja tidak disintesis — 7 dari 20 kasus uji ditandai backlog karena
alasan ini, bukan diklaim lulus.
```

**Apa pencapaian terbesar?**

```
Gerbang izin bisa diaudit dari luar. Untuk pertanyaan identik, STF-005 mendapat
21 diblokir / 42 dipindai / 0 lolos dan STF-001 mendapat 1 / 42 / 5. Angka ini keluar dari
engine yang sama dan bisa direproduksi di terminal, di browser, dan di video demo.
```

**Apa tantangan terbesar?**

```
Menjaga agar penolakan tidak membocorkan apa pun. Versi awal membedakan "data tidak ada"
dari "akses ditolak", dan perbedaan itu sendiri sudah menjadi saluran kebocoran — pengguna
bisa menyimpulkan eksistensi data dari pesan yang berbeda. Solusinya refusal equivalence:
satu kalimat identik untuk kedua kasus.
```

**Rencana pengembangan selanjutnya**

```
Menambah patients.json dengan data sintetis yang aman untuk menutup 7 kasus backlog,
memindahkan retrieval ke embedding tanpa mengubah kontrak gerbang izin, dan mengekspor
audit ke format yang bisa diperiksa auditor eksternal.
```

---

## 11. Setelah submit

1. Simpan bukti submit (screenshot halaman konfirmasi)
2. Simpan link video dan link demo di satu tempat
3. Kalau ada sesi tanya jawab juri, siapkan demo langsung — panduan urutan kueri ada di
   `docs/demo-script.md` §5

---

## Lampiran — perintah verifikasi cepat

Kalau ingin memastikan angka di dokumen masih cocok dengan engine sebelum submit:

```bash
cd C:\saksi-hackathon\skill

# STF-005: harus 21 / 42 / 0 dan BUKTI_BELUM_CUKUP
node scripts/set-user.mjs STF-005
node scripts/ask.mjs --query "Apa itu Proyek Cakalang?"

# STF-001: harus 1 / 42 / 5 dan TERVERIFIKASI
node scripts/set-user.mjs STF-001
node scripts/ask.mjs --query "Apa itu Proyek Cakalang?"
```

Cek sinkronisasi paket skill dengan sumber:

```bash
cd C:\saksi-hackathon
python tools/build_skill.py --check
```
