# SAKSI — Live Demo

A static, dependency-free demo of the SAKSI engine that runs **entirely in the browser**.
No server, no LLM call, no network request after the page loads — the deterministic
pipeline from `engine/ask.mjs` is ported 1:1 to JavaScript and evaluated locally.

**Why it exists:** the real product is a WorkBuddy Desktop skill + Node CLI, which judges
cannot click. This page lets anyone try the permission gate, evidence cards, refusal
equivalence, conflict resolution and injection defence in seconds.

## Files

| File | Role |
|:---|:---|
| `index.html` | Layout: identity sidebar, chat, audit ledger |
| `styles.css` | Navy/cyan theme matching the cover and demo video |
| `engine.js` | Port of `engine/ask.mjs` (v5) — gate, retrieval, scoring, quality gate, conflict, injection, PII masking, composer |
| `data.js` | **Generated** — the JSON datasets inlined by `tools/build_data.py` |
| `app.js` | UI wiring, rendering, audit entries |
| `test_engine.mjs` | Headless validation of the port against expected behaviour |

## Regenerate the data

`data/` stays the single source of truth. After editing any dataset:

```bash
python tools/build_data.py        # rewrites live-demo/data.js
cd live-demo && node test_engine.mjs
```

## What the demo proves

Switch the identity on the left and ask the **same** question:

| Identity | Clearance | `Apa itu Proyek Cakalang?` |
|:---|:---|:---|
| STF-005 Ns. Dewi Lestari | internal | refused — 21 blocked, 0 allowed |
| STF-001 dr. Fatimah Rahmawati | top_secret_medical | answered — 1 blocked, 5 allowed, 3 evidence cards |

The gate counters are measured **before** scoring, which is the point of trust
boundary B3: denied records never reach the answer composer, let alone an LLM context.

Other scenarios worth clicking:

- **`Apa isi template surat rujukan?`** — an embedded instruction in DOC-007 is replaced
  with `[INSTRUKSI TERTANAM DIABAIKAN]` and the evidence card is flagged.
- **`Jam berapa poli buka?`** — DOC-001 (outdated) vs CHAT-001 (active); the newer source
  wins and the reasoning is stated.
- **`Apa SOP deteksi dini gangguan jiwa?`** — DOC-016 appears only for identities that
  hold the `jiwa` or `dokter` group; others fall back to accessible documents.

## Local preview

Any static server works, e.g.:

```bash
python -m http.server 8080 --directory live-demo
```

All patient data is fictitious and was created for the hackathon.
