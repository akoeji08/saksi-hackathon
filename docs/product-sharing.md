# Product Sharing — WorkBuddy

Dokumen ini merangkum bagaimana WorkBuddy Desktop 5.8.4 digunakan untuk membangun SAKSI, nilai yang diberikannya, insight yang diperoleh, dan rekomendasi untuk pengembangan platform ke depan.

---

## 1. Konteks: WorkBuddy sebagai Platform

SAKSI dibangun sepenuhnya sebagai **skill WorkBuddy Desktop**. Tidak ada UI custom, tidak ada server terpisah, tidak ada deployment cloud. Semua interaksi terjadi melalui chat WorkBuddy.

Struktur skill yang digunakan:

```
~/.workbuddy-ai/skills/saksi/
├── SKILL.md                    # Instruksi + triggers + larangan
├── current-user.json           # Identitas operator-managed
├── current-user.example.json   # Template (committed)
└── scripts/
    └── ask.mjs                 # Wrapper memanggil engine
```

Engine SAKSI sendiri berjalan sebagai **Node.js eksternal** yang dipanggil via `execSync`. Ini adalah keputusan arsitektur sadar: memisahkan "otak" (engine deterministik) dari "wajah" (skill WorkBuddy yang non-deterministik).

---

## 2. Di Mana WorkBuddy Memberi Nilai

### 2.1 Skill System — Pemisahan yang Bersih

WorkBuddy memungkinkan `SKILL.md` mendefinisikan instruksi agentic dalam markdown, terpisah dari kode Node.js. Ini memberi tiga keuntungan:

| Keuntungan | Contoh |
|:---|:---|
| **Engine bisa diuji independen** | `node ask.mjs --query "..."` tanpa WorkBuddy |
| **Instruksi bisa diubah tanpa deploy** | Update `SKILL.md` → restart WorkBuddy → selesai |
| **Trigger dan logic terpisah** | `description` untuk kapan dipanggil; `ask.mjs` untuk apa yang dilakukan |

### 2.2 ExecSync Bridge — Fleksibilitas Integrasi

Wrapper `ask.mjs` menggunakan `child_process.execSync` untuk memanggil engine Node.js eksternal. Ini memungkinkan:

- Engine berjalan di lokal tanpa server
- Engine bisa ditulis dalam bahasa apa pun (Node.js, Python, Go) selama output JSON valid
- Engine bisa diuji tanpa WorkBuddy

### 2.3 skill-creator — Scaffolding Cepat

Tool `skill-creator` WorkBuddy mempercepat pembuatan struktur skill dari nol:

- Generate `SKILL.md` dengan frontmatter
- Generate folder `scripts/`, `references/`, `templates/`
- Generate `README.md` placeholder
- Validasi format frontmatter

**Catatan:** `skill-creator` kadang menghasilkan `description` yang terlalu generik. Perlu diperkuat manual agar auto-invoke lebih akurat.

### 2.4 Explicit Invocation `/saksi` — Determinisme untuk Demo

WorkBuddy mendukung pemanggilan skill eksplisit via `/saksi <query>`. Ini **kritis** untuk demo hackathon karena:

- Tidak bergantung pada keputusan LLM
- Selalu memanggil engine yang sama
- Hasil konsisten di setiap percobaan

---

## 3. Insight yang Diperoleh

### 3.1 Auto-Invoke Tidak Deterministik

**Observasi:** LLM di WorkBuddy bisa memilih menjawab sendiri untuk query yang tidak match `trigger` dengan kuat, meskipun `description` sudah memuat kata kunci.

**Contoh nyata:**

| Query | Auto-invoke? |
|:---|:---:|
| "Berapa stok Amoksisilin 500mg sekarang?" | ✅ Terpanggil |
| "Apa itu Proyek Cakalang?" | ❌ Tidak (LLM jawab sendiri) |
| "Berapa cuti tahunan saya?" | ❌ Tidak (LLM jawab sendiri) |

**Akar masalah:** LLM melihat "Cakalang" atau "cuti" sebagai konsep umum yang "sudah diketahui", lalu memilih menjawab dari pengetahuan sendiri.

**Solusi yang diterapkan:**
1. Perkuat `description` dengan kata imperatif ("WAJIB DIPANGGIL")
2. Tambah `triggers` eksplisit dengan 30+ kata kunci
3. Gunakan `/saksi` eksplisit untuk demo dan test

**Rekomendasi untuk WorkBuddy:** Sediakan opsi **"strict invocation mode"** di mana skill tertentu **tidak boleh** di-fallback ke LLM jika gagal.

### 3.2 LLM Context Leak — Risiko Tersembunyi

**Observasi:** WorkBuddy menyimpan konteks percakapan dalam satu chat. Jika user berganti identitas (misal dari STF-003 ke STF-015) dan mengulang query yang sama, LLM bisa **menggunakan jawaban lama** tanpa memanggil engine.

**Contoh nyata:**

```
User (STF-003): "Bagaimana status HIV pasien RM-2026-027?"
SAKSI: TERVERIFIKASI dengan data PAT-003

[User ganti current-user.json ke STF-015, tanpa chat baru]

User (STF-015): "Bagaimana status HIV pasien RM-2026-027?"
SAKSI: "Same question came in again..." (LLM reuse jawaban lama) ← BAHAYA
```

**Dampak:** Ini adalah **pelanggaran UU PDP** jika terjadi di production. Data HIV bocor ke perawat umum.

**Solusi yang diterapkan:**
1. Instruksi skill: "JANGAN PERNAH menggunakan jawaban dari pertanyaan sebelumnya"
2. Wrapper memverifikasi setiap respons punya `_meta.user` yang valid
3. Protokol demo: selalu chat baru saat ganti user

**Rekomendasi untuk WorkBuddy:**
- **Isolasi konteks per session** — setiap chat baru punya memori bersih
- **Skill execution trace** di UI agar user bisa lihat apakah engine benar-benar dipanggil
- **Warning otomatis** jika LLM memberikan jawaban tanpa memanggil skill yang dideklarasikan

### 3.3 Snippet Extraction Matters

**Observasi:** Engine mengirim potongan dokumen (snippet) ke LLM. Jika snippet terlalu pendek, informasi penting bisa hilang. Jika terlalu panjang, LLM kewalahan.

**Contoh nyata:**

Query: *"Siapa yang approve cuti saya?"*
- Awal: snippet = 150 karakter pertama DOC-019 → **"Approval cuti"** tidak terlihat → LLM bilang "tidak ada informasi"
- Perbaikan: relevance-based excerpt dengan prefix matching → **"Approval cuti"** masuk → jawaban benar

**Solusi yang diterapkan:**
1. `extractRelevantExcerpt()` — ambil kalimat yang match terma query, bukan 150 karakter pertama
2. Prefix matching — `"approve"` match `"approval"` (variasi morfologi)
3. `maxLen = 500` untuk 4 kalimat relevan

**Rekomendasi untuk WorkBuddy:** Jika ada fitur RAG built-in, prioritaskan relevance-based excerpt di atas naive truncation.

### 3.4 Three-Layer Debugging

**Observasi:** Ketika SAKSI gagal, masalah bisa muncul di salah satu dari tiga lapisan:

| Layer | Gejala | Solusi |
|:---|:---|:---|
| **LLM tidak panggil skill** | Output bebas LLM (bukan format SAKSI) | Perkuat `description` + `/saksi` eksplisit |
| **Engine logic salah** | Output format SAKSI tapi status/isi salah | Debug `ask.mjs` dengan `BRAIN_USER` env |
| **Data tidak lengkap** | Engine bilang "tidak ada" padahal seharusnya ada | Tambah dokumen ke `data/` |

**Diagnostik sistematis yang terbukti:**

```powershell
# 1. Cek apakah skill terdaftar
Get-ChildItem "$env:USERPROFILE\.workbuddy-ai\skills\"

# 2. Uji engine standalone (bypass LLM)
$env:BRAIN_USER = "STF-005"
node engine/ask.mjs --query "<query>"
$env:BRAIN_USER = $null

# 3. Uji wrapper (bypass LLM, via WorkBuddy skill path)
cd "$env:USERPROFILE\.workbuddy-ai\skills\saksi"
node scripts\ask.mjs --query "<query>"

# 4. Uji via WorkBuddy chat dengan /saksi eksplisit
```

Jika langkah 2 berhasil tapi langkah 4 gagal → masalah di LLM layer.
Jika langkah 2 gagal → masalah di engine.
Jika langkah 2 berhasil tapi hasil tidak relevan → masalah di data.

---

## 4. Rekomendasi untuk WorkBuddy

Berdasarkan pengalaman membangun SAKSI, berikut rekomendasi konkret untuk platform WorkBuddy:

### 4.1 Fitur Prioritas Tinggi

| Fitur | Mengapa | Dampak |
|:---|:---|:---|
| **Strict invocation mode** | Auto-invoke tidak deterministik | Skill dengan mode ini tidak pernah fallback ke LLM |
| **Session isolation** | LLM context leak antar role | Setiap chat baru = memori bersih |
| **Skill execution trace** | Sulit debug apakah skill dipanggil | UI menampilkan: "Skill saksi dipanggil pada 15:42:33, output 240ms" |
| **Skill version pinning** | Demo butuh determinisme | User bisa kunci ke `saksi@2.0.0` |

### 4.2 Fitur Prioritas Menengah

| Fitur | Mengapa |
|:---|:---|
| **Skill output validation** | Wrapper bisa declare schema, WorkBuddy validasi |
| **Built-in PII masking** | Setiap skill yang handle PII bisa flag field sensitif |
| **Audit log UI** | Melihat audit.jsonl tanpa buka terminal |
| **Custom UI actions** | Render evidence cards sebagai tombol, bukan text |

### 4.3 Fitur Prioritas Rendah

| Fitur | Mengapa |
|:---|:---|
| **Skill marketplace** | Sharing skill antar tim |
| **Skill dependencies** | Satu skill bisa require skill lain |
| **Skill testing framework** | Built-in test runner untuk skill |

---

## 5. Yang WorkBuddy Lakukan Sangat Baik

Untuk keseimbangan, ini yang WorkBuddy sudah lakukan dengan sangat baik:

| Aspek | Catatan |
|:---|:---|
| **Skill system** | Frontmatter + markdown body mudah dipahami, cepat di-iterasi |
| **Trigger mechanism** | `description` + `triggers` YAML cukup ekspresif |
| **Tool use** | `Bash`, `Read`, `execSync` bekerja tanpa konfigurasi rumit |
| **Skill packaging** | `skill-creator` + `saksi.zip` memudahkan distribusi |
| **Local-first** | Tidak butuh server, cocok untuk hackathon |
| **Windows support** | PowerShell + WSL kompatibel |

---

## 6. Pelajaran untuk Tim Hackathon Lain

Jika kamu membangun skill WorkBuddy untuk hackathon:

1. **Mulai dari `/saksi` eksplisit**, jangan andalkan auto-invoke
2. **Identitas dari file, bukan prompt** — mencegah privilege escalation
3. **Filter sebelum retrieval, bukan sesudahnya** — bukan hanya soal UI
4. **Audit metadata-only** — jangan simpan konten sensitif
5. **Refusal equivalence** — respons untuk proyek rahasia = respons untuk proyek fiktif
6. **Relevance-based excerpt** — jangan naive truncation
7. **Uji tiga lapisan** — LLM, engine, data — secara terpisah
8. **Selalu chat baru saat ganti user** — hindari LLM context leak

---

## 7. Kesimpulan

WorkBuddy adalah platform yang solid untuk membangun agentic AI dengan skill system yang fleksibel. Untuk proyek dengan tingkat keamanan tinggi seperti SAKSI (data medis), tiga hal perlu diperhatikan:

1. **Determinisme** — auto-invoke tidak cukup, perlu explicit invocation
2. **Isolasi** — antar session, antar user, antar role
3. **Audit** — tidak hanya di level skill, tapi di level engine

Dengan mengombinasikan skill WorkBuddy dan engine eksternal yang deterministik, SAKSI bisa mencapai tingkat accountable AI yang dibutuhkan untuk sistem medis — tanpa mengorbankan kecepatan development yang ditawarkan WorkBuddy.

---

**Kontak:** [email kamu]
**Repo:** https://github.com/akoeji08/saksi-hackathon