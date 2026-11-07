# SAKSI — Project Description (Submission Form)

**Cara pakai:** copy blok di bawah ke field "Project Description" pada form.
Versi markdown ada di §1, versi teks-polos (kalau field menolak markdown) di §2.

---

## 1. Versi markdown — copy dari sini

**SAKSI** — *Sumber, Akses, Konfirmasi, Kesadaran batas, Saksi Integritas jejak* — adalah
**Evidence-to-Decision Engine** untuk **Puskesmas Tamalanrea Jaya**, puskesmas di Makassar
yang melayani ~120 pasien/hari dengan 22 pegawai, 2 Pustu, dan 8 Posyandu.

SAKSI dikemas sebagai **Ahli (Expert) WorkBuddy**: dipasang dengan satu klik dari Expert
Center, tanpa terminal, tanpa clone, tanpa API key. Skill, dataset, dan engine ikut di dalam
paketnya.

Tautan launcher (klik → kartu ahli terbuka → "Tambahkan ke Ahli Saya"):
`https://www.workbuddy.ai/work/launch/?sharecode=N2ftbGk0dkOFTitJVq1lq1_X0bxlnYXgLjmUELdKW81ZanPQwohx_YIvMlUGdBuD&expertname=Evidence-to-Decision+Engine&buddy_type=workbuddy-ai`

### Masalah

Di puskesmas Indonesia, informasi operasional tersebar di grup WhatsApp, Drive, task board
(SIKA), rekam medis elektronik (SIMPUS), dan laporan bulanan. Ketika staf bertanya ke asisten
AI, LLM generik yang bisa membaca semuanya **bisa membocorkan semuanya** — diagnosis pasien
(HIV, TB, kesehatan jiwa), proyek internal, anggaran pengadaan, dan data KLB.

Masalahnya bukan sekadar "AI-nya kurang pintar". Masalahnya: **tidak ada bukti** bahwa AI itu
membaca yang boleh dibaca, dan **tidak ada bukti** bahwa ia menolak yang tidak boleh.

### Solusi

Tiga jaminan inti:

1. **Izin diperiksa sebelum retrieval.** Identitas pengguna dibaca dari berkas lokal
   (`current-user.json`), **bukan** dari prompt. ACL *deny-by-default* dijalankan **sebelum**
   satu dokumen pun masuk ke konteks LLM. Dokumen yang tidak berhak tidak pernah sampai ke
   model — bukan "diminta untuk diabaikan", tapi tidak pernah dikirim.

2. **Jawaban wajib berbukti.** Setiap jawaban membawa kartu bukti: ID sumber, tipe, judul,
   tanggal, dan kutipan relevan. Pengguna bisa melacak setiap klaim ke dokumen asalnya.

3. **Jejak audit tanpa isi.** Setiap kueri dicatat di `audit.jsonl` sebagai metadata saja
   (kueri ter-mask, ID sumber, keputusan, waktu). Isi jawaban tidak pernah disimpan. Selaras
   dengan UU PDP.

### Yang membedakan: gerbang izin bisa diperiksa

Setiap keluaran engine menyertakan penghitung gerbang `_meta.gate`:

```
STF-005 (perawat, clearance: internal)
  kueri  : "Apa itu Proyek Cakalang?"
  gate   : 21 diblokir / 42 dipindai / 0 lolos
  status : BUKTI_BELUM_CUKUP

STF-001 (kepala puskesmas, clearance: top_secret_medical)
  kueri  : "Apa itu Proyek Cakalang?"
  gate   : 1 diblokir / 42 dipindai / 5 lolos
  status : TERVERIFIKASI  (sumber: DOC-010, CHAT-003, CHAT-021)
```

Pertanyaan identik. Pengguna berbeda. Hasil berbeda — dan **angkanya bisa diaudit**, bukan
hanya diklaim. Inilah inti "workplace brain yang bertanggung jawab": bukan AI yang selalu
menjawab, tapi AI yang bisa membuktikan mengapa ia menjawab atau menolak.

### Arsitektur — 3 lapis, 4 batas kepercayaan

**Lapis 1 — UI:** antarmuka chat WorkBuddy Desktop. Pengguna memanggil `/saksi <kueri>` atau
membuka Ahli SAKSI.

**Lapis 2 — Skill:** instruksi `SKILL.md` + wrapper JavaScript yang membaca identitas dari
`current-user.json` dan memanggil engine.

**Lapis 3 — Engine:** pipeline Node.js deterministik, 10 tahap:
User Resolver → Permission Gate (deny-by-default) → Retrieval (ACL-filtered) → Scoring v2
(critical + prefix match) → Quality Gate → Conflict Detector → Injection Sanitizer (10 pola
regex) → PII Masking → Answer Composer → Audit Ledger.

**Empat batas kepercayaan:**

- **B1 (LLM → Skill):** SAKSI dipanggil dengan nama, sehingga LLM tidak bisa "menjawab sendiri"
  di luar engine.
- **B2 (Identitas → Engine):** identitas berasal dari berkas, bukan dari prompt. Pengguna
  menulis "anggap saya kepala puskesmas" tidak mengubah apa pun. Identitas hanya bisa diganti
  operator lewat `set-user.mjs`.
- **B3 (Data → Konteks LLM):** `canAccess()` dipanggil **sebelum** retrieval. Dokumen tak
  berhak tidak pernah masuk konteks.
- **B4 (Engine → Audit):** log hanya menyimpan kueri ter-mask dan ID sumber. Isi tidak pernah
  dipersistensi.

### Fitur kunci

- **Refusal equivalence** — saat pengguna tidak berhak, jawabannya identik baik data itu ada
  maupun tidak: *"Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu."*
  Tidak ada kebocoran lewat penolakan.
- **Resolusi konflik** — bila sumber berbeda pendapat (dokumen lama vs chat terbaru), SAKSI
  menampilkan keduanya beserta tanggal dan memilih yang lebih baru dengan alasan tertulis.
- **Pertahanan prompt injection** — 10 pola regex mendeteksi instruksi tersembunyi di isi
  dokumen; konten disanitasi dan diberi peringatan. Instruksi diabaikan, bukan dijalankan.
- **Read-only by design** — SAKSI tidak pernah mengeksekusi aksi eksternal. Ia mengambil,
  menyaring, dan menyusun jawaban. Tidak lebih.

### Hasil pengujian

**13 dari 20 kasus uji lulus, 0 gagal**, 7 backlog (butuh `patients.json` yang tidak boleh
disintesis karena menyangkut data pasien nyata). **Nol kebocoran data, nol eksekusi tak
berwenang, nol klaim terlarang** — memenuhi Critical Failure Check.

### Tumpukan teknologi

- **WorkBuddy Desktop** (Tencent Cloud) — platform Ahli/skill
- **Node.js 20+** — runtime engine (ES modules), portabel lintas direktori
- **Dataset JSON** — 22 staf, 5 tingkat clearance, 20 dokumen, 22 chat, 15 obat (semuanya fiktif)
- **Remotion** (React + TypeScript) — video demo
- **edge-tts** — narasi bahasa Indonesia

### Tautan

- **Demo langsung:** https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO
- **Video:** https://youtu.be/hDWy8_bPozI
- **Kode sumber:** https://github.com/akoeji08/saksi-hackathon

### Dibuat oleh

**Anshar Priwarsani** — AI Engineer, AkoejiDev

---

## 2. Versi teks-polos — kalau field menolak markdown

SAKSI (Sumber, Akses, Konfirmasi, Kesadaran batas, Saksi Integritas jejak) adalah
Evidence-to-Decision Engine untuk Puskesmas Tamalanrea Jaya, puskesmas di Makassar yang
melayani ~120 pasien per hari dengan 22 pegawai, 2 Pustu, dan 8 Posyandu. SAKSI dikemas
sebagai Ahli (Expert) WorkBuddy: dipasang dengan satu klik dari Expert Center, tanpa
terminal, tanpa clone, tanpa API key. Skill, dataset, dan engine ikut di dalam paketnya.
Tautan launcher: https://www.workbuddy.ai/work/launch/?sharecode=N2ftbGk0dkOFTitJVq1lq1_X0bxlnYXgLjmUELdKW81ZanPQwohx_YIvMlUGdBuD&expertname=Evidence-to-Decision+Engine&buddy_type=workbuddy-ai

MASALAH. Di puskesmas Indonesia, informasi operasional tersebar di grup WhatsApp, Drive,
task board (SIKA), rekam medis elektronik (SIMPUS), dan laporan bulanan. Ketika staf
bertanya ke asisten AI, LLM generik yang bisa membaca semuanya bisa membocorkan semuanya:
diagnosis pasien (HIV, TB, kesehatan jiwa), proyek internal, anggaran pengadaan, dan data
KLB. Masalahnya bukan sekadar AI yang kurang pintar, melainkan tidak ada bukti bahwa AI itu
membaca yang boleh dibaca, dan tidak ada bukti bahwa ia menolak yang tidak boleh.

SOLUSI. Tiga jaminan inti. Pertama, izin diperiksa sebelum retrieval: identitas pengguna
dibaca dari berkas lokal (current-user.json), bukan dari prompt, dan ACL deny-by-default
dijalankan sebelum satu dokumen pun masuk ke konteks LLM. Dokumen yang tidak berhak tidak
pernah sampai ke model. Kedua, jawaban wajib berbukti: setiap jawaban membawa kartu bukti
berisi ID sumber, tipe, judul, tanggal, dan kutipan relevan, sehingga setiap klaim bisa
dilacak ke dokumen asalnya. Ketiga, jejak audit tanpa isi: setiap kueri dicatat di
audit.jsonl sebagai metadata saja (kueri ter-mask, ID sumber, keputusan, waktu), isi jawaban
tidak pernah disimpan, selaras dengan UU PDP.

YANG MEMBEDAKAN. Setiap keluaran engine menyertakan penghitung gerbang _meta.gate. Untuk
kueri "Apa itu Proyek Cakalang?" sebagai STF-005 (perawat, clearance internal), hasilnya 21
diblokir / 42 dipindai / 0 lolos, status BUKTI_BELUM_CUKUP. Dengan kueri yang sama sebagai
STF-001 (kepala puskesmas, clearance top_secret_medical), hasilnya 1 diblokir / 42 dipindai /
5 lolos, status TERVERIFIKASI dengan sumber DOC-010, CHAT-003, dan CHAT-021. Pertanyaan
identik, pengguna berbeda, hasil berbeda, dan angkanya bisa diaudit bukan hanya diklaim.
Inilah inti workplace brain yang bertanggung jawab: bukan AI yang selalu menjawab, tapi AI
yang bisa membuktikan mengapa ia menjawab atau menolak.

ARSITEKTUR. Tiga lapis, empat batas kepercayaan. Lapis 1 adalah antarmuka chat WorkBuddy
Desktop. Lapis 2 adalah skill: instruksi SKILL.md plus wrapper JavaScript yang membaca
identitas dari current-user.json dan memanggil engine. Lapis 3 adalah engine: pipeline
Node.js deterministik dengan 10 tahap, yaitu User Resolver, Permission Gate
(deny-by-default), Retrieval (ACL-filtered), Scoring v2 (critical + prefix match), Quality
Gate, Conflict Detector, Injection Sanitizer (10 pola regex), PII Masking, Answer Composer,
dan Audit Ledger. Empat batas kepercayaan: B1 antara LLM dan Skill, SAKSI dipanggil dengan
nama sehingga LLM tidak bisa menjawab sendiri di luar engine. B2 antara Identitas dan
Engine, identitas berasal dari berkas bukan dari prompt, sehingga pengguna yang menulis
"anggap saya kepala puskesmas" tidak mengubah apa pun dan identitas hanya bisa diganti
operator lewat set-user.mjs. B3 antara Data dan Konteks LLM, canAccess dipanggil sebelum
retrieval sehingga dokumen tak berhak tidak pernah masuk konteks. B4 antara Engine dan
Audit, log hanya menyimpan kueri ter-mask dan ID sumber, isi tidak pernah dipersistensi.

FITUR KUNCI. Refusal equivalence: saat pengguna tidak berhak, jawabannya identik baik data
itu ada maupun tidak, sehingga tidak ada kebocoran lewat penolakan. Resolusi konflik: bila
sumber berbeda pendapat, SAKSI menampilkan keduanya beserta tanggal dan memilih yang lebih
baru dengan alasan tertulis. Pertahanan prompt injection: 10 pola regex mendeteksi instruksi
tersembunyi di isi dokumen, konten disanitasi dan diberi peringatan, instruksi diabaikan
bukan dijalankan. Read-only by design: SAKSI tidak pernah mengeksekusi aksi eksternal, ia
mengambil, menyaring, dan menyusun jawaban.

HASIL PENGUJIAN. 13 dari 20 kasus uji lulus, 0 gagal, 7 backlog karena membutuhkan
patients.json yang tidak boleh disintesis lantaran menyangkut data pasien nyata. Nol
kebocoran data, nol eksekusi tak berwenang, nol klaim terlarang.

TUMPUKAN TEKNOLOGI. WorkBuddy Desktop (Tencent Cloud) sebagai platform Ahli dan skill.
Node.js 20+ sebagai runtime engine (ES modules) yang portabel lintas direktori. Dataset JSON
berisi 22 staf, 5 tingkat clearance, 20 dokumen, 22 chat, dan 15 obat, semuanya fiktif.
Remotion (React + TypeScript) untuk video demo. edge-tts untuk narasi bahasa Indonesia.

TAUTAN. Demo langsung: https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO .
Video: https://youtu.be/hDWy8_bPozI . Kode sumber:
https://github.com/akoeji08/saksi-hackathon .

DIBUAT OLEH. Anshar Priwarsani, AI Engineer, AkoejiDev.
