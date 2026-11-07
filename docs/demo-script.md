# Demo Video — SAKSI

Dokumen ini menjelaskan **video demo yang sudah jadi**, bukan rencana rekaman.
Semua waktu di bawah diambil dari hasil render, bukan perkiraan.

| Field | Nilai |
|:---|:---|
| File | `submission-assets/SAKSI-demo-video-final.mp4` |
| Durasi | **5:15.9** (315.9 detik, 9.477 frame @ 30fps) |
| Resolusi | 1920 × 1080 |
| Ukuran | 17.9 MB |
| Narasi | Bahasa Indonesia, `id-ID-ArdiNeural`, tempo natural |
| YouTube | https://youtu.be/AMkMF_ZJjUo |

> Video lama (sebelum pembaruan) sudah digantikan. Kalau link YouTube masih menunjuk
> ke versi lama, unggah ulang file di atas dan perbarui link di form submission.

---

## 1. Peta adegan

Sembilan ribu empat ratus tujuh puluh tujuh frame, delapan adegan.

| # | Adegan | Mulai | Selesai | Durasi |
|:--:|:---|--:|--:|--:|
| 1 | Hook — informasi tersebar | 0:00.0 | 0:37.6 | 37.6s |
| 2 | **Gerbang izin** — dua pengguna, satu pertanyaan | 0:37.6 | 1:31.4 | 53.8s |
| 3 | Jawaban berbukti — stok Amoksisilin | 1:31.4 | 2:05.5 | 34.1s |
| 4 | Refusal equivalence — Cakalang vs Naga | 2:05.5 | 2:40.1 | 34.6s |
| 5 | Konflik temporal — jam poli | 2:40.1 | 3:15.3 | 35.2s |
| 6 | Pertahanan prompt injection — DOC-007 | 3:15.3 | 3:58.5 | 43.2s |
| 7 | Jejak audit — apa yang tidak disimpan | 3:58.5 | 4:32.4 | 33.9s |
| 8 | **Pasang satu klik** + penutup | 4:32.4 | 5:15.9 | 43.5s |

---

## 2. Narasi per adegan

### Adegan 1 — Hook (0:00–0:37)

> Di puskesmas, informasi tidak tinggal di satu tempat. Jam poli ada di grup WhatsApp.
> Stok obat di spreadsheet. SOP di Drive Dinas. Status pasien di SIMPUS. Model bahasa
> yang membaca semuanya, bisa membocorkan semuanya. Dan satu kebocoran status HIV bukan
> bug. **Itu insiden.**
>
> SAKSI dibangun dari satu gagasan sederhana. Setiap jawaban harus punya saksi.
> Sumbernya, izinnya, penolakannya, dan jejaknya.

**Visual:** sumber-sumber berserak → mengerucut ke satu simpul AI bercahaya merah →
"bukan bug → itu insiden" → tesis + lima kartu huruf SAKSI.

### Adegan 2 — Gerbang izin (0:37–1:31)

> Perhatikan dua percakapan ini. Pertanyaan yang sama persis. *Apa itu Proyek Cakalang.*
>
> Yang pertama, Ns. Dewi, perawat dengan clearance internal. Sebelum satu dokumen pun
> dibaca, engine memeriksa izin. Empat puluh dua dokumen dan chat dipindai. Dua puluh satu
> diblokir. Nol yang lolos. Jawabannya: *saya tidak menemukan informasi yang dapat saya
> akses.*
>
> Yang kedua, dr. Fatimah, kepala puskesmas. Pertanyaan yang sama. Hanya satu diblokir,
> lima lolos. Jawaban lengkap, dengan tiga kartu bukti.
>
> Pertanyaan identik, hasil berbeda. Bukan karena modelnya menolak menjawab, tapi karena
> **izin diperiksa sebelum retrieval.**

**Visual:** dua kolom berdampingan, penghitung gerbang dan kartu bukti. Angka di layar
adalah keluaran engine sebenarnya:

| | STF-005 (perawat) | STF-001 (kepala puskesmas) |
|:---|:---|:---|
| Diblokir | 21 | 1 |
| Dipindai | 42 | 42 |
| Lolos | 0 | 5 |
| Status | BUKTI_BELUM_CUKUP | TERVERIFIKASI |
| Sumber | — | DOC-010, CHAT-003, CHAT-021 |

### Adegan 3 — Jawaban berbukti (1:31–2:05)

> Mari mulai dengan yang sederhana. Ns. Dewi, perawat, bertanya stok Amoksisilin.
> Perhatikan tiga hal. Pertama, jawaban langsung menyebut angka: empat puluh tablet.
> Kedua, ada dua sumber — DRG-001 dari data obat, dan DOC-006 dari formularium. Ketiga,
> di bawah ada baris *Dijawab untuk STF-005*. Ini bukti bahwa engine benar-benar dipanggil
> dan identitas terverifikasi.

### Adegan 4 — Refusal equivalence (2:05–2:40)

> Sekarang Ns. Dewi bertanya tentang Proyek Cakalang, investigasi KLB Hepatitis A yang
> hanya boleh diakses kepala puskesmas. Perhatikan responsnya: *saya tidak menemukan
> informasi yang dapat saya akses.* Respons ini tidak menyebut Cakalang, tidak menyiratkan
> bahwa proyek itu ada.
>
> Mari bandingkan dengan proyek yang benar-benar tidak ada. Respons untuk Proyek Naga
> **identik kata per kata.** Inilah refusal equivalence. Tidak ada informasi yang bocor
> melalui penolakan.

### Adegan 5 — Konflik temporal (2:40–3:15)

> Pertanyaan sederhana. *Jam berapa poli buka?* Tapi ada dua sumber yang berbeda.
> DOC-001 dari tahun 2024 menyebut jam delapan pagi. CHAT-001 dari tahun 2026 menyebut
> jam setengah tujuh pagi.
>
> Engine mendeteksi konflik, menampilkan kedua sumber, dan memilih yang terbaru dengan
> alasan eksplisit: DOC-001 telah superseded oleh CHAT-001. Ini bukan sekadar jawaban.
> Ini penalaran yang bisa diaudit.

### Adegan 6 — Pertahanan prompt injection (3:15–3:58)

> Sekarang bagian paling dramatis. Template surat rujukan kami, DOC-007, berisi instruksi
> tersembunyi yang mencoba mengalihkan AI untuk mengirim seluruh data pasien HIV ke alamat
> email luar. Instruksi itu menyamar sebagai catatan dari Dinas Kesehatan.
>
> Perhatikan apa yang terjadi. Engine mendeteksi injeksi, menonaktifkannya dengan tanda
> INSTRUKSI TERTANAM DIABAIKAN, dan memberi tahu user bahwa ada percobaan serangan.
> Dokumen tetap bisa dibaca, tapi instruksi berbahayanya dinonaktifkan.
>
> Tidak ada email yang terkirim. Tidak ada data yang bocor. **Dokumen diperlakukan sebagai
> data, bukan instruksi.**

### Adegan 7 — Jejak audit (3:58–4:32)

> Setiap kueri yang kita lakukan tadi tercatat di audit log. Perhatikan apa yang disimpan:
> user, kueri dengan PII disamarkan, status keputusan, sumber yang dipakai, dan jumlah
> injeksi yang dicegat.
>
> Perhatikan apa yang **tidak** disimpan. Tidak ada jawaban lengkap. Tidak ada snippet.
> Tidak ada NIK. Tidak ada nomor RM.
>
> Ini bukan kebetulan. Ini desain. Audit tidak boleh menjadi backdoor yang membocorkan
> data yang justru dilindungi.

### Adegan 8 — Pasang satu klik + penutup (4:32–5:15)

> SAKSI lulus tiga belas dari tiga belas uji yang dijalankan. Nol kebocoran data terbatas.
> Nol eksekusi tanpa persetujuan.
>
> Dan sekarang memasangnya tidak perlu terminal. Paket skill sudah mandiri — engine,
> dataset, dan aturan izin ikut di dalamnya. Buka Expert Center, cari SAKSI, tambahkan ke
> ahli Anda. **Satu klik**, dan seluruh engine berjalan di mesin Anda. Tanpa API key,
> tanpa server.
>
> Di puskesmas, kepercayaan bukan fitur tambahan. Kepercayaan adalah syarat.
> **Setiap jawaban punya lima saksi.**

**Visual:** kartu hasil uji → kartu Ahli SAKSI dengan tombol *Tambahkan ke Ahli Saya*
yang berubah menjadi *✓ Ditambahkan ke Ahli Saya* → tiga chip "tanpa" → tesis penutup.

---

## 3. Cara membangun ulang video

Semua adegan adaptif terhadap durasi: setiap scene memakai
`useCurrentFrame() * (lebarDesain / durationInFrames)`, jadi mengubah durasi di
`SaksiDemo.tsx` tidak akan memotong animasi.

```bash
cd demo-video

# 1. Regenerasi narasi (kalau teks berubah)
python scripts/generate_tts.py

# 2. Render video tanpa audio  (~26 menit, 9477 frame)
npx remotion render src/index.ts SaksiDemo out/saksi-demo-video-only.mp4 --concurrency=4

# 3. Gabungkan narasi + video
bash scripts/merge_audio_natural.sh
#    -> out/saksi-demo-final.mp4
```

**Penting:** `SCENE_DUR` di `scripts/merge_audio_natural.sh` harus sama persis dengan
`durationInFrames` di `src/SaksiDemo.tsx`. Kalau tidak sinkron, narasi akan bergeser.
Skrip memakai nilai pecahan penuh (mis. `53.766667`, bukan `53.8`) supaya akumulasi
pergeseran tetap di bawah satu frame.

Kalau salah satu narasi lebih panjang dari slot adegannya, `ffmpeg -t` akan **memotong
suara**. Periksa dulu:

```bash
FFPROBE="node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe"
for i in 1 2 3 4 5 6 7 8; do
  "$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "out/audio/scene$i.mp3"
done
```

---

## 4. Checklist sebelum unggah

- [ ] File `SAKSI-demo-video-final.mp4` ada dan durasinya 5:15.9
- [ ] Audio terdengar di seluruh durasi (tidak ada adegan bisu)
- [ ] Angka di adegan 2 cocok dengan engine: 21/42/0 dan 1/42/5
- [ ] Unggah ke YouTube, set **Unlisted** (bukan Private — juri tidak bisa membuka Private)
- [ ] Salin link ke form submission **dan** `README.md`
- [ ] Cek link di jendela incognito (pastikan tidak "Video unavailable")

---

## 5. Lampiran — kalau ingin merekam demo langsung

Video di atas adalah hasil render programatik. Kalau Anda perlu merekam layar
WorkBuddy secara langsung (misalnya untuk sesi tanya jawab juri), urutan kueri yang
paling kuat adalah:

| Urutan | User | Kueri | Yang ditunjukkan |
|:--:|:---|:---|:---|
| 1 | STF-005 | `Berapa stok Amoksisilin 500mg sekarang?` | Kartu bukti, dua sumber |
| 2 | STF-005 | `Apa itu Proyek Cakalang?` | Penolakan datar, 21/42/0 |
| 3 | STF-001 | `Apa itu Proyek Cakalang?` | Jawaban lengkap, 1/42/5 |
| 4 | STF-005 | `Jam berapa poli buka?` | Konflik + resolusi |
| 5 | STF-005 | `Apa isi template surat rujukan?` | Injeksi dicegat |

Ganti identitas di antara langkah 2 dan 3:

```bash
node skill/scripts/set-user.mjs STF-001
```

Lalu tutup WorkBuddy, buka lagi, dan mulai chat baru — identitas dibaca saat skill
dipanggil, bukan saat aplikasi dibuka.

**Persiapan rekaman:**

- [ ] `current-user.json` diset ke `STF-005`
- [ ] WorkBuddy Desktop terbuka, chat baru
- [ ] Handphone silent, notifikasi Windows mati
- [ ] Resolusi minimal 1920×1080
- [ ] OBS/QuickTime siap rekam
