# Engine — SAKSI

Node.js engine untuk permission-aware retrieval dengan audit trail.

## Menjalankan Standalone

Engine bisa dijalankan tanpa WorkBuddy, langsung dari PowerShell:

```powershell
$env:BRAIN_USER = "STF-005"
node ask.mjs --query "Berapa stok Amoksisilin 500mg sekarang?"
$env:BRAIN_USER = $null
```

## Environment Variables

| Variable | Wajib | Deskripsi |
|:---|:---:|:---|
| `BRAIN_USER` | Ya | User ID (STF-001 s.d. STF-022) |

Jika `BRAIN_USER` tidak diset, engine akan mengembalikan:

```json
{
  "status": "ERROR",
  "answer": "Identitas tidak terdeteksi. Skill wrapper harus menetapkan BRAIN_USER.",
  "warnings": ["BRAIN_USER_MISSING"]
}
```

## Output Format

Engine mengembalikan JSON ke stdout dengan struktur:

```json
{
  "status": "TERVERIFIKASI" | "KONFLIK" | "BUKTI_BELUM_CUKUP" | "ERROR",
  "answer": "Teks jawaban final",
  "sources": [
    {
      "id": "DRG-001",
      "type": "drug",
      "title": "Amoksisilin 500mg",
      "snippet": "Amoksisilin 500mg: stok 40 tablet",
      "timestamp": null
    }
  ],
  "warnings": [],
  "_meta": {
    "user": "STF-005",
    "query": "Berapa stok Amoksisilin 500mg sekarang?",
    "sources_considered": 2,
    "injections_blocked": 0,
    "audit_id": "AUD-20261024-abc123"
  }
}
```

## Status Codes

| Status | Arti | Kapan Muncul |
|:---|:---|:---|
| `TERVERIFIKASI` | Bukti yang diizinkan mendukung jawaban | Retrieval > 0, quality gate lolos |
| `KONFLIK` | Dua sumber bertentangan | Supersession atau outdated vs active |
| `BUKTI_BELUM_CUKUP` | Tidak ada bukti relevan atau akses ditolak | candidates = [] atau quality gate gagal |
| `ERROR` | Bug internal atau data corrupt | Data load fail, user tidak ditemukan |

## User yang Tersedia

Engine punya 22 user di `data/staff.json`. Yang paling sering dipakai untuk demo:

| ID | Nama | Role | Grup | Deny Program |
|:---|:---|:---|:---|:---|
| `STF-001` | dr. Fatimah | Kepala Puskesmas | manajemen, dokter, kepala | (tidak ada) |
| `STF-003` | dr. Sari | Dokter VCT | dokter, poli_umum, kia, vct_hiv | Cakalang, Bahari |
| `STF-005` | Ns. Dewi | Perawat | perawat, rawat_jalan, tb_dots | Cakalang, Bahari, HIV |
| `STF-008` | Bd. Siti | Bidan | bidan, kia, rujukan | Cakalang, Bahari, HIV |
| `STF-013` | Yusuf | Petugas TB | tb_dots, perawat_tb | Cakalang, Bahari |
| `STF-015` | Joko | Admin | pendaftaran, admin | Cakalang, Bahari, HIV, TB, Jiwa |
| `STF-020` | Ningsih | Analis Lab | lab, analis | Cakalang, Bahari |

Lihat `data/staff.json` untuk daftar lengkap.

## Audit Viewer

`show-audit.mjs` adalah CLI untuk memeriksa `audit.jsonl`.

```powershell
# 20 entri terakhir
node show-audit.mjs

# Filter per user
node show-audit.mjs --user STF-005

# Filter per status
node show-audit.mjs --status KONFLIK

# Semua entri
node show-audit.mjs --all
```

Contoh output:

```
2026-10-24T06:22:23.031Z | AUD-20261024-3su7ul
  User     : STF-005
  Query    : Berapa stok Amoksisilin 500mg sekarang?
  Status   : TERVERIFIKASI
  Decision : allow
  Sources  : [DRG-001, DRG-002, DOC-006] (3)
```

## Konfigurasi Path

Di bagian atas `ask.mjs`, ada dua konstanta yang perlu disesuaikan jika kamu pindahkan file:

```javascript
const DATA_DIR = 'C:\\Users\\ansha\\Documents\\saksi-engine\\data';
const AUDIT_PATH = 'C:\\Users\\ansha\\Documents\\saksi-engine\\audit.jsonl';
```

Ganti path sesuai lokasi dataset dan audit log di sistem kamu.

## Troubleshooting

| Masalah | Solusi |
|:---|:---|
| `Gagal memuat data` | Cek `DATA_DIR` — pastikan 5 file JSON ada |
| `User tidak dikenali` | Cek `BRAIN_USER` — harus salah satu ID di `staff.json` |
| Output kosong | Cek `query` tidak kosong; cek `DATA_DIR` benar |
| `audit.jsonl` tidak terbuat | Cek permission tulis di folder target |

## Struktur File

```
engine/
├── ask.mjs           ← engine utama
├── show-audit.mjs    ← audit viewer
└── README.md         ← file ini
```

## Lisensi

MIT — lihat [../LICENSE](../LICENSE).