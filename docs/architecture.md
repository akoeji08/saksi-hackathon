# Architecture — SAKSI

Dokumen ini menjelaskan arsitektur teknis SAKSI: komponen, alur data, trust boundaries, dan trade-off desain.

---

## 1. Gambaran Umum

SAKSI adalah sistem tiga lapis dengan empat trust boundary eksplisit. Fokus utama desain adalah **memastikan dokumen terlarang tidak pernah masuk ke konteks LLM**, bukan hanya disembunyikan di UI.

```
WorkBuddy Desktop (Chat UI)
    |  /saksi <query>
    v
Skill Layer (SKILL.md + wrapper + current-user.json)
    |  BRAIN_USER env var
    v
Engine Layer (permission gate -> retrieval -> scoring -> conflict -> injection -> PII -> answer)
    |
    +---> Data Layer (5 JSON files)
    +---> Audit Layer (audit.jsonl)
```

---

## 2. Diagram Komponen

```
+-------------------------------------------------------------+
|                    USER INTERFACE LAYER                     |
|                    WorkBuddy Desktop                        |
|                                                             |
|  Input:  /saksi <query>                                     |
|  Output: answer + evidence cards + "Dijawab untuk: STF-XXX" |
+-----------------------------+-------------------------------+
                              |
              TRUST BOUNDARY 1: LLM -> Skill
              Skill invoked by NAME, not by LLM decision
                              |
                              v
+-------------------------------------------------------------+
|                       SKILL LAYER                           |
|         ~/.workbuddy-ai/skills/saksi/                       |
|                                                             |
|  - SKILL.md              : triggers + instructions          |
|  - scripts/ask.mjs       : wrapper -> engine                |
|  - current-user.json     : operator-managed identity        |
+-----------------------------+-------------------------------+
                              |
              TRUST BOUNDARY 2: Identity File -> Engine
              BRAIN_USER env var, never from prompt
                              |
                              v
+-------------------------------------------------------------+
|                      ENGINE LAYER                           |
|                engine/ask.mjs (Node.js)                     |
|                                                             |
|  [1] User Resolver           -> staff.json lookup           |
|  [2] Permission Gate         -> deny-by-default ACL         |
|  [3] Retrieval               -> ACL-filtered only           |
|  [4] Scoring v2              -> critical + prefix           |
|  [5] Quality Gate            -> min score threshold         |
|  [6] Conflict Detector       -> supersession + outdated     |
|  [7] Injection Sanitizer     -> 10 regex patterns           |
|  [8] PII Masking             -> NIK/phone/BPJS/RM           |
|  [9] Answer Composer         -> relevance-based excerpt     |
|  [10] Audit Writer           -> audit.jsonl                 |
+-----------------------------+-------------------------------+
                              |
              TRUST BOUNDARY 3: Data -> LLM Context
              Filter BEFORE retrieval, not after
                              |
                              v
+-------------------------------------------------------------+
|                      DATA + AUDIT LAYER                     |
|                                                             |
|  data/                        audit.jsonl                   |
|  - staff.json (22)            - metadata only               |
|  - permissions.json (5)       - query_masked                |
|  - documents.json (20)        - sources_ids                 |
|  - chats.json (22)            - status + decision           |
|  - drugs.json (15)            - injections_blocked          |
+-------------------------------------------------------------+
```

---

## 3. Komponen dan Tanggung Jawab

| # | Layer | Komponen | Tanggung Jawab | File |
|:---:|:---|:---|:---|:---|
| 1 | UI | WorkBuddy Desktop | Antarmuka chat, eksekusi skill | — |
| 2 | Skill | SKILL.md | Trigger, instruksi, larangan | `skill/SKILL.md` |
| 3 | Skill | Wrapper | Baca identitas, panggil engine | `skill/scripts/ask.mjs` |
| 4 | Skill | Identity | Operator-managed user | `skill/current-user.json` |
| 5 | Engine | User Resolver | Lookup user ID ke profile | `engine/ask.mjs` §5 |
| 6 | Engine | Permission Gate | Deny-by-default ACL check | `engine/ask.mjs` §6 |
| 7 | Engine | Retrieval | Ambil dokumen yang lolos filter | `engine/ask.mjs` §8 |
| 8 | Engine | Scoring v2 | Critical terms + prefix matching | `engine/ask.mjs` §7 |
| 9 | Engine | Quality Gate | Threshold adaptif (2 atau 3) | `engine/ask.mjs` §9 |
| 10 | Engine | Conflict Detector | Supersession + outdated detection | `engine/ask.mjs` §10 |
| 11 | Engine | Injection Sanitizer | 10 regex patterns | `engine/ask.mjs` §7 |
| 12 | Engine | PII Masking | NIK/phone/BPJS/RM redaction | `engine/ask.mjs` §11 |
| 13 | Engine | Answer Composer | Relevance-based excerpt | `engine/ask.mjs` §11 |
| 14 | Engine | Audit Writer | Append metadata ke audit.jsonl | `engine/ask.mjs` §3 |
| 15 | Audit | Viewer | CLI untuk inspeksi log | `engine/show-audit.mjs` |

---

## 4. Alur Data

### 4.1 Alur Normal (Jawaban Berbukti)

```
1. User: /saksi Berapa stok Amoksisilin 500mg sekarang?
2. WorkBuddy -> wrapper ask.mjs
3. Wrapper baca current-user.json -> BRAIN_USER=STF-005
4. Engine:
   a. Load data (staff, permissions, docs, chats, drugs)
   b. Resolve user STF-005 -> perawat, deny: HIV/TB/Jiwa/Cakalang/Bahari
   c. Extract terms: [amoksisilin] (critical), [stok, sekarang] (general)
   d. Retrieval: dokumen yang lolos canAccess() + score > 0
   e. Quality gate: top score 5 >= min 3
   f. No conflict detected
   g. No injection detected
   h. Build answer dengan relevance excerpt
   i. Write audit entry
5. Output JSON -> WorkBuddy chat
6. User lihat answer + evidence cards + "Dijawab untuk: STF-005"
```

### 4.2 Alur Refusal (Unauthorized)

```
1. User (STF-005): /saksi Apa itu Proyek Cakalang?
2. Engine:
   a. Resolve user STF-005
   b. Extract terms: [cakalang] (critical)
   c. Retrieval: semua kandidat Cakalang DIBUANG oleh canAccess()
   d. candidates = [] -> insufficient
   e. Refusal template (identik dengan proyek fiktif)
   f. Write audit: policy_decision=no_evidence_or_denied
3. Output: BUKTI_BELUM_CUKUP (netral, tanpa menyebut "Cakalang")
```

### 4.3 Alur Konflik

```
1. User: /saksi Jam berapa poli buka?
2. Engine:
   a. Extract terms: [poli] (critical), [jam, buka] (general)
   b. Retrieval: DOC-001 + CHAT-001
   c. Conflict detector: DOC-001 superseded_by=CHAT-001
   d. Return KONFLIK dengan kedua sumber
   e. Write audit: conflict_type=SUPERSESSION
3. Output: KONFLIK + penjelasan sumber lama vs baru
```

### 4.4 Alur Prompt Injection

```
1. User: /saksi Apa isi template surat rujukan?
2. Engine:
   a. Retrieval: DOC-007 (mengandung injeksi)
   b. Injection sanitizer detect pattern
   c. Sanitasi: ganti instruksi dengan [INSTRUKSI TERTANAM DIABAIKAN]
   d. Warning prepended ke answer (karena DOC-007 top result)
   e. Write audit: injections_blocked=1
3. Output: warning + sanitized content + evidence cards
```

---

## 5. Trust Boundaries

### B1 — LLM → Skill

| Aspek | Detail |
|:---|:---|
| **Mekanisme** | Skill dipanggil berdasarkan nama (`/saksi`), bukan keputusan bebas LLM |
| **Mengapa** | LLM bisa memilih menjawab sendiri jika merasa "sudah tahu", melewati engine |
| **Bukti** | Test di mana auto-invoke gagal → solusi `/saksi` eksplisit |
| **Risiko jika gagal** | Engine tidak dijalankan, tidak ada permission check |

### B2 — Identity File → Engine

| Aspek | Detail |
|:---|:---|
| **Mekanisme** | Wrapper baca `current-user.json` → set `BRAIN_USER` env var. Engine menolak argumen `--user` dari prompt |
| **Mengapa** | Mencegah "prompt privilege escalation" — user tidak bisa mengaku sebagai STF-001 |
| **Bukti** | Test 4 vs 5 — query sama, hasil berbeda berdasarkan identitas |
| **Risiko jika gagal** | User bisa akses data kapan saja dengan mengubah prompt |

### B3 — Data → LLM Context

| Aspek | Detail |
|:---|:---|
| **Mekanisme** | `canAccess()` dipanggil **sebelum** retrieval. Dokumen yang tidak lolos tidak masuk `candidates[]` |
| **Mengapa** | Jika dokumen terlarang masuk konteks LLM, "jangan bocorkan" di prompt adalah mitigasi kosmetik |
| **Bukti** | Test 4 (`BUKTI_BELUM_CUKUP` tanpa menyiratkan eksistensi Cakalang) |
| **Risiko jika gagal** | LLM bisa membocorkan isi dokumen terlarang meski diinstruksikan tidak |

### B4 — Engine → Audit

| Aspek | Detail |
|:---|:---|
| **Mekanisme** | Audit mencatat `query_masked` (PII disamarkan), `sources_ids` (ID saja), `status` |
| **Mengapa** | Audit tidak boleh menjadi "backdoor" yang membocorkan data yang dilindungi |
| **Bukti** | Test 20D — `query_masked` berisi `[MASKED-RM]`, bukan RM asli |
| **Risiko jika gagal** | Audit log menjadi shadow copy data sensitif, pelanggaran UU PDP |

---

## 6. Design Trade-offs

| # | Trade-off | Pilihan | Alternatif | Alasan |
|:---:|:---|:---|:---|:---|
| 1 | Filter before vs after retrieval | **Sebelum** | Setelah generation | Setelah = dokumen terlarang sudah masuk konteks LLM → mitigasi kosmetik |
| 2 | Explicit /saksi vs auto-invoke | **Hybrid** | Full auto-invoke | Auto-invoke tidak deterministik; explicit lebih andal untuk demo |
| 3 | JSON vs vector DB | **JSON + keyword** | Embedding-based retrieval | 5 file cukup untuk 20 dokumen; vector DB over-engineering untuk scope hackathon |
| 4 | Deny-by-default vs allow-by-default | **Deny** | Allow | Sistem medis butuh deny-by-default; allow-by-default hanya untuk sistem publik |
| 5 | Substring vs stemming | **Prefix matching** | Full stemming (Snowball) | Prefix matching menyelesaikan 80% kasus dengan 20% effort |
| 6 | Audit metadata vs full content | **Metadata only** | Full query/response | Full content = shadow copy data sensitif, pelanggaran UU PDP |
| 7 | Refusal equivalence vs informational | **Equivalence** | Informational ("Anda tidak berhak") | Informational membocorkan eksistensi data |
| 8 | Single-tier vs multi-tier clearance | **Multi-tier** | Single boolean | Perawat ≠ dokter ≠ kepala untuk HIV |
| 9 | Naive snippet vs relevance excerpt | **Relevance** | 150 chars pertama | Naive truncation kehilangan informasi penting |
| 10 | Hardcoded vs operator-managed identity | **Operator-managed** | Hardcoded in code | Memungkinkan demo multi-user tanpa re-deploy |

---

## 7. Status Engine

| Status | Arti | Kapan Muncul |
|:---|:---|:---|
| `TERVERIFIKASI` | Bukti yang diizinkan mendukung jawaban | Retrieval > 0, quality gate lolos |
| `KONFLIK` | Dua sumber bertentangan | Supersession atau outdated vs active |
| `BUKTI_BELUM_CUKUP` | Tidak ada bukti relevan atau akses ditolak | candidates = [] atau quality gate gagal |
| `ERROR` | Bug internal atau data corrupt | Data load fail, user tidak ditemukan |

---

## 8. Diagram Trust Boundary Ringkas

```
+----------------------------------------------------+
|  WorkBuddy LLM (bisa hallucinate, bisa bocor)      |
+----------------------------------------------------+
     |  B1: dipanggil by name, bukan LLM decision
     v
+----------------------------------------------------+
|  Skill Wrapper (code, deterministic)               |
+----------------------------------------------------+
     |  B2: identity dari file, bukan prompt
     v
+----------------------------------------------------+
|  Engine (deterministic logic)                      |
+----------------------------------------------------+
     |  B3: filter sebelum retrieval
     v
+----------------------------------------------------+
|  Data (source of truth)                            |
+----------------------------------------------------+
     |  B4: metadata only ke audit
     v
+----------------------------------------------------+
|  Audit Log (append-only, PII masked)               |
+----------------------------------------------------+
```

---

## 9. Referensi

- Accountability sheet: [`accountability.md`](./accountability.md)
- Test results: [`test-results.md`](./test-results.md)
- Demo script: [`demo-script.md`](./demo-script.md)
- Engine source: [`../engine/ask.mjs`](../engine/ask.mjs)