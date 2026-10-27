# Evidence — Bukti Pengujian SAKSI

Folder ini berisi bukti pengujian yang bisa diverifikasi oleh juri.

## Isi Folder

| File | Isi |
|:---|:---|
| `test-transcripts.md` | Output verbatim dari test utama |
| `audit-sample.jsonl` | Sample audit log (sanitized) |
| `screenshots/` | Screenshot demo (diisi manual) |
| `README.md` | File ini |

## test-transcripts.md

Berisi output verbatim dari WorkBuddy untuk test-test utama:

- Test 1: Jawaban berbukti (Amoksisilin)
- Test 4: Refusal equivalence (Cakalang unauthorized)
- Test 12: Prompt injection defense (DOC-007)
- Test 19: Conflict resolution (jam poli)
- Test 20: Audit log viewer

Format: query user + output SAKSI apa adanya, tanpa editing.

## audit-sample.jsonl

Sample 5 entry dari `audit.jsonl` asli dengan PII sudah disanitasi.

Struktur setiap entry:

```json
{
  "ts": "2026-10-24T06:22:23.031Z",
  "audit_id": "AUD-20261024-3su7ul",
  "engine_version": "v5",
  "user": "STF-005",
  "query_masked": "Berapa stok Amoksisilin 500mg sekarang?",
  "status": "TERVERIFIKASI",
  "policy_decision": "allow",
  "sources_ids": ["DRG-001", "DRG-002", "DOC-006"],
  "sources_count": 3,
  "injections_blocked": 0,
  "conflict_type": null
}
```

**Yang tidak dicatat:** jawaban lengkap, snippet sumber, NIK, nomor telepon, BPJS, RM asli.

## screenshots/

Berisi screenshot demo. Rekomendasi minimal 4:

1. `test-04-refusal.png` — Refusal Cakalang (BUKTI_BELUM_CUKUP)
2. `test-12-injection.png` — Prompt injection warning
3. `test-19-conflict.png` — Konflik jam poli
4. `test-20-audit.png` — Output `show-audit.mjs`

**Cara ambil screenshot:**

1. Buka WorkBuddy dengan hasil test
2. Tekan `Win + Shift + S` (Snipping Tool)
3. Pilih area yang mau di-screenshot
4. Paste ke Paint atau langsung save
5. Simpan sebagai PNG di folder ini

## Verifikasi Audit

Untuk memverifikasi bahwa `audit-sample.jsonl` sesuai format asli, jalankan viewer:

```powershell
node ../engine/show-audit.mjs
```

Output akan menampilkan entry dari `audit.jsonl` asli (yang dibuat saat panitia jalankan test).

## Referensi

- Test results lengkap: [../docs/test-results.md](../docs/test-results.md)
- Test cases: [../tests/manual-tests.md](../tests/manual-tests.md)