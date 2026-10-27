# Tests — SAKSI

Folder ini berisi test case manual dan panduan pengujian.

## Isi Folder

| File | Isi |
|:---|:---|
| `manual-tests.md` | 20 test case dengan expected result |
| `README.md` | File ini |

## Cara Menjalankan Test

### Via WorkBuddy (end-to-end)

1. Set user di `~/.workbuddy-ai/skills/saksi/current-user.json`
2. Restart WorkBuddy
3. Chat baru
4. Ketik: `/saksi <query>`
5. Verifikasi output terhadap expected result di `manual-tests.md`

**Protokol ketat:** setiap ganti user → tutup WorkBuddy → buka lagi → chat baru.

### Via Engine Standalone (bypass LLM)

Untuk isolasi bug di engine vs di LLM:

```powershell
$env:BRAIN_USER = "STF-005"
node ../engine/ask.mjs --query "Berapa stok Amoksisilin 500mg sekarang?"
$env:BRAIN_USER = $null
```

Output harus JSON dengan `status: TERVERIFIKASI`.

### Via Wrapper (bypass LLM, via skill path)

Untuk test wrapper tanpa WorkBuddy:

```powershell
cd "$env:USERPROFILE\.workbuddy-ai\skills\saksi"
node scripts\ask.mjs --query "Berapa stok Amoksisilin 500mg sekarang?"
```

Output harus sama dengan engine standalone.

## Three-Layer Debugging

Jika test gagal, isolasi layer masalahnya:

| Layer | Gejala | Cara Cek |
|:---|:---|:---|
| **LLM tidak panggil skill** | Output bebas LLM (tidak ada `Dijawab untuk:`) | Jalankan `/saksi` eksplisit; jika masih gagal, cek `SKILL.md` |
| **Engine logic salah** | Output format SAKSI tapi status/isi salah | Jalankan engine standalone dengan `BRAIN_USER` env |
| **Data tidak lengkap** | Engine bilang "tidak ada" padahal seharusnya ada | Cek `data/*.json` — apakah dokumen yang dicari ada |

## Struktur Test Case

Setiap test case di `manual-tests.md` punya format:

```
### Test N — Judul

- User: STF-XXX (nama, role)
- Query: `query text`
- Expected: expected result
- Status: PASS / FAIL / BACKLOG
```

## Verifikasi Audit Log

Setelah menjalankan beberapa test, periksa audit:

```powershell
node ../engine/show-audit.mjs
```

Setiap query harus punya entri. Query dengan RM code harus punya `query_masked` dengan `[MASKED-RM]`, bukan RM asli.

## Batch Test (PowerShell)

Untuk uji cepat beberapa user secara berurutan:

```powershell
# Test 1: STF-005 (perawat)
Set-Content "$env:USERPROFILE\.workbuddy-ai\skills\saksi\current-user.json" '{"user_id":"STF-005"}'
# Restart WorkBuddy, chat baru, ketik: /saksi Apa itu Proyek Cakalang?
# Expected: BUKTI_BELUM_CUKUP

# Test 2: STF-001 (kepala)
Set-Content "$env:USERPROFILE\.workbuddy-ai\skills\saksi\current-user.json" '{"user_id":"STF-001"}'
# Restart WorkBuddy, chat baru, ketik: /saksi Apa itu Proyek Cakalang?
# Expected: TERVERIFIKASI dengan DOC-010
```

## Referensi

- Test results lengkap: [../docs/test-results.md](../docs/test-results.md)
- Test cases: [manual-tests.md](./manual-tests.md)
- Transkrip: [../evidence/test-transcripts.md](../evidence/test-transcripts.md)