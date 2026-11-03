# SAKSI — Project Description (for Submission Form)

Copy the text below into the "Project Description" field of the hackathon submission form.

---

## Project Description

**SAKSI** (Sumber, Akses, Konfirmasi, Kesadaran batas, Saksi Integritas jejak) is an Evidence-to-Decision Engine built as a WorkBuddy Desktop skill for **Puskesmas Tamalanrea Jaya**, a primary healthcare center in Makassar, Indonesia, serving ~120 patients daily with 22 staff across 2 sub-clinics and 8 Posyandu posts.

### The Problem

In Indonesian puskesmas, operational information is scattered across WhatsApp groups, shared drives, task boards (SIKA), electronic medical records (SIMPUS), and monthly reports. When staff ask an AI assistant for help, a generic LLM that reads everything **can leak everything** — patient diagnoses (HIV, TB, mental health), internal projects, procurement budgets, and outbreak data.

### The Solution

SAKSI transforms this with three core guarantees:

1. **Permission-first access control** — User identity is resolved from a local file (`current-user.json`), never from the chat prompt. A deny-by-default ACL check runs *before* retrieval, ensuring unauthorized documents never enter the LLM context window.

2. **Evidence-mandatory answers** — Every answer includes evidence cards showing source ID, timestamp, relevance reason, and content snippet. Users can trace any claim back to its origin document.

3. **Audit-trail with PII masking** — Every query is logged in `audit.jsonl` with metadata only (query text masked, source IDs, decision, timestamp). Compliant with Indonesia's UU PDP (Personal Data Protection Law).

### Architecture (3 Layers, 4 Trust Boundaries)

**Layer 1 — UI:** WorkBuddy Desktop chat interface. Users invoke SAKSI with `/saksi <query>`.

**Layer 2 — Skill:** SKILL.md instructions + JavaScript wrapper that sets the `BRAIN_USER` environment variable from `current-user.json` and calls the engine.

**Layer 3 — Engine:** Node.js pipeline with 10 deterministic stages:
User Resolver → Permission Gate (deny-by-default) → Retrieval (ACL-filtered) → Scoring v2 (critical + prefix match) → Quality Gate → Conflict Detector → Injection Sanitizer (10 regex patterns) → PII Masking → Answer Composer → Audit Ledger.

**Four Trust Boundaries:**
- **B1 (LLM → Skill):** SAKSI is invoked by name (`/saksi`), preventing the LLM from "answering on its own" outside the engine.
- **B2 (Identity → Engine):** User identity comes from `current-user.json` file, not from the prompt — preventing privilege escalation via prompt manipulation.
- **B3 (Data → LLM Context):** `canAccess()` is called *before* retrieval. Unauthorized documents never enter the LLM context.
- **B4 (Engine → Audit):** Audit logs record `query_masked` and `sources_ids` only. Sensitive content is never persisted in logs.

### Key Features

- **Refusal Equivalence:** When a user lacks access, SAKSI responds identically whether the data exists or not — "I couldn't find accessible information for that question." No metadata leakage about restricted topics.
- **Conflict Resolution:** When sources disagree (e.g., outdated document vs. recent chat), SAKSI detects the conflict, explains both sides, and picks the newer/active source with a stated reason.
- **Prompt Injection Defense:** 10 regex patterns detect embedded instructions in document content. When found, the content is sanitized and a warning is shown — the injection is ignored, not executed.
- **Read-only by Design:** SAKSI never executes external actions. It retrieves, filters, and composes answers — nothing more.

### Test Results

13 of 20 test cases pass (0 failures, 7 backlog requiring `patients.json`). **Zero data leaks, zero unauthorized executions, zero prohibited claims** — meeting the hackathon's Critical Failure Check requirement.

### Technology Stack

- **WorkBuddy Desktop** (Tencent Cloud) — AI skill platform
- **Node.js 20+** — Engine runtime (ES modules)
- **JSON datasets** — 22 staff, 5 clearance levels, 20 documents, 22 chats, 15 drugs (all fictitious)
- **Remotion** (React + TypeScript) — Demo video generation
- **edge-tts** — Indonesian voice-over narration

### Built By

**Anshar Priwarsani** — AI Engineer, AkoejiDev
GitHub: https://github.com/akoeji08/saksi-hackathon
Demo Video: https://youtu.be/AMkMF_ZJjUo
