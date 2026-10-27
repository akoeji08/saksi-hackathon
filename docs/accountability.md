# Accountability Sheet — SAKSI

**Challenge:** Tencent Cloud Hackathon Indonesia 2026 — Challenge A: The Workplace Brain
**Project:** SAKSI — Evidence-to-Decision Engine
**Skenario:** Puskesmas Tamalanrea Jaya, Makassar
**Tanggal:** 24 Oktober 2026

---

## Ringkasan

SAKSI adalah workplace brain yang menjawab pertanyaan operasional dengan bukti tertelusur, sambil menegakkan batas izin akses pada data medis sensitif. Dokumen ini menjelaskan apa yang dapat diakses, apa yang dijalankan otonom, apa yang butuh approval, apa yang tidak akan pernah dilakukan, dan bagaimana jejak dapat diaudit.

---

## 1. Apa yang Dapat Diakses oleh Agen

SAKSI hanya dapat mengakses sumber yang diizinkan untuk pengguna yang sedang aktif. Izin diperiksa **sebelum** pencarian, bukan sesudahnya.

| Kategori | File | Siapa yang berhak |
|:---|:---|:---|
| Chat internal | `CHAT-001` s.d. `CHAT-022` | Tergantung channel (`ops-makassar`, `all-staff`, `vct-hiv-team`, dll) |
| Dokumen SOP & panduan | `DOC-001` s.d. `DOC-020` | `all_staff` kecuali `restricted_medical`/`confidential` |
| Data obat | `DRG-001` s.d. `DRG-015` | Semua staf |
| Data pasien | `PAT-001` s.d. `PAT-015` | Hanya dokter, perawat penanggung jawab, atau bidan terkait |

### Aturan Akses

1. **Deny-by-default.** Pengguna tanpa grup yang cocok tidak dapat melihat dokumen.
2. **Program deny-list.** Perawat umum (STF-005) secara eksplisit diblokir dari program HIV, TB, Jiwa, Cakalang, dan Bahari.
3. **Dokumen terlarang tidak pernah masuk ke konteks LLM.** Bukan hanya disembunyikan di UI — benar-benar tidak diambil oleh engine.

### Level Clearance

| Level | Role Contoh | Akses |
|:---|:---|:---|
| `public` | Cleaning service, security, magang | Dokumen publik saja |
| `internal` | Perawat, apoteker, admin | Dokumen umum + tugas terkait |
| `restricted_medical` | Dokter, bidan, analis | Data medis (kecuali HIV/jiwa jika tidak dalam grup) |
| `restricted_finance` | Bendahara | Data keuangan, tender |
| `top_secret_medical` | Kepala Puskesmas | Semua data, termasuk KLB Cakalang |

---

## 2. Apa yang Dijalankan Secara Otonom

Tanpa intervensi manusia, SAKSI dapat:

| Tindakan | Mengapa aman |
|:---|:---|
| Mencari dokumen yang diizinkan | Hasil terfilter oleh `canAccess()` |
| Menyusun jawaban dari sumber | Setiap jawaban wajib menyertakan `sources` |
| Menyitasi ID, timestamp, dan judul sumber | Evidence card selalu ditampilkan |
| Mendeteksi konflik antar sumber | Status `KONFLIK` jika dua sumber bertentangan |
| Memilih sumber terbaru saat konflik | Aturan prioritas: sumber dengan timestamp lebih baru |
| Mendeteksi dan menyanitasi prompt injection | `[INSTRUKSI TERTANAM DIABAIKAN]` |
| Menyamarkan PII (NIK, telepon, BPJS, RM) | Otomatis pada setiap output dan audit log |
| Mencatat audit metadata | File `audit.jsonl`, tidak menyimpan konten sensitif |
| Menolak query yang tidak dapat dijawab | `BUKTI_BELUM_CUKUP` tanpa mengarang |

**SAKSI tidak mengeksekusi aksi eksternal apa pun.** Tidak ada pengiriman email, tidak ada perubahan dokumen, tidak ada pemanggilan API pihak ketiga. Semua operasi bersifat read-only.

---

## 3. Apa yang Memerlukan Approval Manusia

Tidak ada aksi yang memerlukan approval karena **SAKSI tidak mengeksekusi aksi apa pun.**

Namun, jika fitur aksi ditambahkan di masa mendatang (misalnya: mengirim notifikasi, menjadwalkan rujukan, mengubah status pasien), kontrol berikut **wajib** diberlakukan:

| Aksi | Approval yang dibutuhkan |
|:---|:---|
| Mengirim email atau pesan ke pihak eksternal | Persetujuan eksplisit user, dengan pratinjau penerima dan isi |
| Mengubah status rekam medis | Konfirmasi tenaga medis penanggung jawab |
| Menjadwalkan rujukan atau tindakan | Konfirmasi dokter + persetujuan pasien |
| Mengekspor data ke luar sistem | Approval `kepala` (sesuai `bulk_export_rules` di `permissions.json`) |
| Mengubah kebijakan akses | Tidak pernah dilakukan agen; hanya operator manusia |

**Prinsip:** agen tidak akan pernah bertindak atas nama pengguna tanpa konfirmasi eksplisit yang menampilkan detail aksi (siapa, apa, kapan, ke mana).

---

## 4. Apa yang Tidak Akan Pernah Dilakukan oleh Agen

| Larangan | Alasan | Test yang Membuktikan |
|:---|:---|:---|
| Membocorkan atau menyiratkan keberadaan data terbatas | Refusal equivalence — respons untuk proyek terbatas identik dengan proyek fiktif | Test 4, 5 |
| Menjawab pertanyaan tanpa sumber tertelusur | Setiap jawaban wajib punya evidence card | Test 1, 2, 3 |
| Menuruti instruksi yang tertanam di dalam dokumen | Dokumen diperlakukan sebagai data, bukan instruksi | Test 12, 18 |
| Menebak atau mengarang saat tidak ada bukti | Status `BUKTI_BELUM_CUKUP` + arahkan ke pemilik topik | Test 14 |
| Membuka NIK, nomor telepon, BPJS, atau nomor RM lengkap | Masking otomatis di output dan audit log | Test 20 |
| Mengeksekusi aksi eksternal (kirim/ubah/hapus) | SAKSI bersifat read-only; tidak ada kapabilitas tulis | Semua test |
| Menyimpan konten sensitif di audit log | Hanya metadata: user, query tersamarkan, sumber, keputusan | Test 20 |
| Menggunakan jawaban dari pertanyaan sebelumnya | Setiap query = validasi izin ulang | Aturan skill |

---

## 5. Bagaimana Rekam Jejak Dapat Diperiksa

Setiap query menghasilkan satu entri di `audit.jsonl`:

```json
{
  "ts": "2026-10-24T06:24:53.094Z",
  "audit_id": "AUD-20261024-t2n4vd",
  "engine_version": "v5",
  "user": "STF-005",
  "query_masked": "Apa isi template surat rujukan?",
  "status": "TERVERIFIKASI",
  "policy_decision": "allow",
  "sources_ids": ["DOC-007", "DOC-002", "DOC-006"],
  "sources_count": 3,
  "injections_blocked": 1,
  "conflict_type": null
}
```

### Yang Dicatat

- Siapa yang bertanya (`user`)
- Kapan (`ts`)
- Query (dengan PII disamarkan: `query_masked`)
- Status keputusan (`status`)
- Sumber yang dipakai (`sources_ids`)
- Jumlah sumber (`sources_count`)
- Jumlah injeksi dicegat (`injections_blocked`)
- Jenis konflik jika ada (`conflict_type`)

### Yang TIDAK Dicatat

- Jawaban lengkap
- Snippet sumber
- NIK asli
- Nomor telepon asli
- Nomor BPJS asli
- Nomor RM asli

### Cara Memeriksa

```powershell
# 20 entri terakhir
node engine/show-audit.mjs

# Filter per user
node engine/show-audit.mjs --user STF-005

# Filter per status
node engine/show-audit.mjs --status KONFLIK

# Semua entri
node engine/show-audit.mjs --all
```

Audit log dapat diperiksa oleh auditor internal, kepala puskesmas, atau juri hackathon.

---

## 6. Ringkasan Lima Aturan

| Huruf | Aturan | Implementasi | Bukti Test |
|:---:|:---|:---|:---|
| **S** | Sumber | Evidence card untuk setiap jawaban | 1, 2, 3, 19 |
| **A** | Akses | Deny-by-default ACL sebelum retrieval | 4, 5, 7, 8 |
| **K** | Konfirmasi | Read-only; tidak ada eksekusi tanpa approval | Semua |
| **S** | Kesadaran Batas | Refusal equivalence + "saya tidak tahu" | 4, 5, 14 |
| **I** | Saksi Integritas Jejak | Audit metadata-only, PII masked | 20 |

---

## 7. Kepatuhan Regulasi

### UU PDP (Perlindungan Data Pribadi)

| Prinsip | Implementasi SAKSI |
|:---|:---|
| Minimalisasi data | Audit hanya metadata, bukan konten |
| Tujuan terbatas | Data hanya diakses untuk menjawab query user yang berhak |
| Keamanan | Permission gate deny-by-default |
| Transparansi | Setiap jawaban menyertakan sumber |

### UU Kesehatan Pasal 57

| Prinsip | Implementasi SAKSI |
|:---|:---|
| Kerahasiaan rekam medis | Hanya tenaga medis penanggung jawab |
| Persetujuan pasien | Read-only; tidak ada perubahan tanpa approval |

### PP 33/2026 (Data Protection Impact Assessment)

| Prinsip | Implementasi SAKSI |
|:---|:---|
| Assessment sebelum AI memproses data pribadi | Audit log siap diperiksa |
| Traceability | Setiap keputusan tercatat |
| Accountability | Accountability sheet ini |

---

## 8. Kesimpulan

> SAKSI menjawab hanya dengan bukti yang diizinkan, menyebutkan sumbernya, mendeteksi konflik dan serangan, menolak saat tidak tahu, dan meninggalkan jejak yang dapat diaudit — tanpa pernah mengeksekusi aksi eksternal atau membocorkan data terbatas.

---

**Tim:** [Nama Kamu]
**Repo:** https://github.com/akoeji08/saksi-hackathon
**Engine version:** v5 + patch filter