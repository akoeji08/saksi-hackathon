## 🎓 Untuk Juri / Reviewer

Setup 3 langkah, 2 menit.

### Langkah 1 — Clone dan setup

Buka PowerShell, jalankan:

```powershell
git clone https://github.com/USERNAME/saksi-hackathon.git
cd saksi-hackathon
.\setup.ps1
```

Script `setup.ps1` akan otomatis:

- Cek Node.js terpasang
- Copy skill ke `~/.workbuddy-ai/skills/saksi/`
- Buat `current-user.json` dengan default `STF-005`
- Test engine standalone

Jika PowerShell menolak script, jalankan dulu:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

### Langkah 2 — Buka WorkBuddy

Buka WorkBuddy Desktop, klik **New Chat**, ketik:

```
/saksi Berapa stok Amoksisilin 500mg sekarang?
```

Output yang diharapkan:

```
Amoksisilin 500mg: stok 40 tablet (status: kritis)

Sumber:
- DRG-001 - Amoksisilin 500mg
- DOC-006 - Formularium Obat Puskesmas 2026

Dijawab untuk: STF-005
```

### Langkah 3 — Ganti user (opsional, untuk demo multi-role)

Untuk melihat perbedaan akses, edit file:

```
~/.workbuddy-ai/skills/saksi/current-user.json
```

Ubah `user_id` menjadi salah satu:

| User ID | Nama | Role | Akses |
|:---|:---|:---|:---|
| `STF-005` | Ns. Dewi | Perawat | Umum (deny HIV/TB/Jiwa/Cakalang/Bahari) |
| `STF-001` | dr. Fatimah | Kepala Puskesmas | Full access |
| `STF-003` | dr. Sari | Dokter VCT | HIV + umum |
| `STF-015` | Joko | Admin | Umum only |

Setelah ubah, **tutup WorkBuddy, buka lagi, chat baru** agar perubahan terbaca.

### Skenario Demo yang Direkomendasikan

| Skenario | User | Query | Yang Ditunjukkan |
|:---|:---|:---|:---|
| Jawaban berbukti | STF-005 | `Berapa stok Amoksisilin 500mg sekarang?` | Evidence cards, sumber |
| Refusal equivalence | STF-005 | `Apa itu Proyek Cakalang?` | Netral, tidak menyiratkan eksistensi |
| Authorized access | STF-001 | `Apa itu Proyek Cakalang?` | Data muncul untuk user berhak |
| Konflik temporal | STF-005 | `Jam berapa poli buka?` | KONFLIK, resolusi sumber |
| Prompt injection | STF-005 | `Apa isi template surat rujukan?` | Warning + sanitasi |
| Audit trail | — | `node engine/show-audit.mjs` | Log metadata-only |

### Troubleshooting

| Masalah | Solusi |
|:---|:---|
| `node` tidak dikenali | Install Node.js dari nodejs.org |
| Skill tidak terpanggil | Gunakan `/saksi` eksplisit, bukan query bebas |
| `current-user.json` tidak ada | Jalankan `.\setup.ps1` atau copy dari `current-user.example.json` |
| `audit.jsonl` kosong | Normal, akan terisi setelah query pertama |
| Output bukan JSON | Cek path engine di `skill/scripts/ask.mjs` |

### Test Engine Standalone (tanpa WorkBuddy)

Untuk verifikasi cepat tanpa buka WorkBuddy:

```powershell
$env:BRAIN_USER = "STF-005"
node engine/ask.mjs --query "Berapa stok Amoksisilin 500mg sekarang?"
$env:BRAIN_USER = $null
```

Output harus JSON dengan `status: TERVERIFIKASI` dan `sources: [DRG-001, ...]`.

### Test Refusal (perbedaan akses)

```powershell
$env:BRAIN_USER = "STF-005"
node engine/ask.mjs --query "Apa itu Proyek Cakalang?"
$env:BRAIN_USER = $null
```

Output harus `BUKTI_BELUM_CUKUP`.

Sekarang ganti user:

```powershell
$env:BRAIN_USER = "STF-001"
node engine/ask.mjs --query "Apa itu Proyek Cakalang?"
$env:BRAIN_USER = $null
```

Output harus `TERVERIFIKASI` dengan `sources: [DOC-010, ...]`.

### Detail Lengkap

- Test results: `docs/test-results.md`
- Demo script: `docs/demo-script.md`
- Accountability sheet: `docs/accountability.md`
- Architecture: `docs/architecture.md`

---