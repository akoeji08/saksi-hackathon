# Skill — SAKSI untuk WorkBuddy

Skill WorkBuddy yang menjadi antarmuka antara LLM dan engine SAKSI.

## Instalasi

### Otomatis (direkomendasikan)

Dari root repo, jalankan:

```powershell
.\setup.ps1
```

Script akan otomatis copy folder `skill/` ke `%USERPROFILE%\.workbuddy-ai\skills\saksi\` dan membuat `current-user.json`.

### Manual

1. Copy folder `skill/` ke `%USERPROFILE%\.workbuddy-ai\skills\saksi\`

```powershell
Copy-Item -Recurse skill "$env:USERPROFILE\.workbuddy-ai\skills\saksi"
```

2. Copy `current-user.example.json` menjadi `current-user.json`

```powershell
Copy-Item "$env:USERPROFILE\.workbuddy-ai\skills\saksi\current-user.example.json" `
          "$env:USERPROFILE\.workbuddy-ai\skills\saksi\current-user.json"
```

3. Sesuaikan path engine di `scripts/ask.mjs` (baris `execSync`)

4. Restart WorkBuddy Desktop

5. Buka chat baru, ketik `/saksi <query>`

## Struktur

```
saksi/
├── SKILL.md                    # Instructions + triggers + larangan
├── current-user.json           # Runtime (gitignored, dibuat setup.ps1)
├── current-user.example.json   # Template (committed)
├── README.md                   # file ini
└── scripts/
    └── ask.mjs                 # Wrapper memanggil engine
```

## Cara Kerja

```
User ketik: /saksi Berapa stok Amoksisilin 500mg?
    ↓
WorkBuddy memanggil skill `saksi`
    ↓
SKILL.md instruksi: "Panggil node scripts/ask.mjs --query ..."
    ↓
Wrapper ask.mjs:
  1. Baca current-user.json → BRAIN_USER=STF-005
  2. execSync: node engine/ask.mjs --query "..." (dengan BRAIN_USER env)
    ↓
Engine return JSON
    ↓
Wrapper verifikasi _meta.user ada
    ↓
LLM tampilkan answer + sources + "Dijawab untuk: STF-005"
```

## Ganti User (Multi-Role Demo)

Edit `current-user.json`:

```json
{
  "user_id": "STF-001"
}
```

Kemudian:

1. Tutup WorkBuddy (End Task di Task Manager)
2. Buka lagi
3. Chat baru
4. Query yang sama akan dijawab dengan akses user baru

**PENTING:** Selalu **chat baru** setelah ganti user. Jangan lanjut thread lama — LLM bisa reuse jawaban dari user sebelumnya (context leak).

## User ID yang Tersedia

| ID | Nama | Role |
|:---|:---|:---|
| `STF-001` | dr. Fatimah | Kepala Puskesmas |
| `STF-003` | dr. Sari | Dokter VCT |
| `STF-005` | Ns. Dewi | Perawat (default) |
| `STF-008` | Bd. Siti | Bidan |
| `STF-013` | Yusuf | Petugas TB |
| `STF-015` | Joko | Admin |
| `STF-020` | Ningsih | Analis Lab |

Daftar lengkap: lihat `../data/staff.json`.

## SKILL.md — Yang Perlu Diketahui

`SKILL.md` punya frontmatter YAML:

```yaml
---
name: saksi
description: "..."
triggers:
  - "stok obat"
  - "Amoksisilin"
  - ...
allowed-tools: Bash, Read
version: 2.0.0
---
```

- **`description`** — dibaca LLM untuk memutuskan kapan skill dipanggil
- **`triggers`** — kata kunci untuk auto-invoke
- **`allowed-tools`** — `Bash` wajib (untuk execSync)

**Catatan:** Auto-invoke tidak 100% deterministik. Untuk demo, gunakan `/saksi` eksplisit.

## Troubleshooting

| Masalah | Solusi |
|:---|:---|
| Skill tidak muncul di menu WorkBuddy | Restart WorkBuddy; cek folder ada di `~/.workbuddy-ai/skills/saksi/` |
| Skill tidak terpanggil otomatis | Gunakan `/saksi` eksplisit |
| `current-user.json` hilang | Copy dari `current-user.example.json` |
| Output bukan format SAKSI | Cek apakah LLM benar-benar memanggil skill (lihat apakah ada `_meta.user` di output) |
| Engine error | Jalankan engine standalone dulu: `node ../engine/ask.mjs --query "..."` |

## Referensi

- Dokumentasi utama: [../README.md](../README.md)
- Test results: [../docs/test-results.md](../docs/test-results.md)
- Demo script: [../docs/demo-script.md](../docs/demo-script.md)