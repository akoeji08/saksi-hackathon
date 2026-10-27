// ask.mjs — SAKSI Engine v5
// Path: C:\Users\ansha\Documents\saksi-engine\brain\scripts\ask.mjs
// Tanggung jawab: identitas, permission gate, retrieval terfilter,
//                 quality gate, conflict detection, injection defense,
//                 audit ledger, PII masking.

import fs from 'fs';
import path from 'path';

const DATA_DIR = 'C:\\Users\\ansha\\Documents\\saksi-engine\\data';
const AUDIT_PATH = 'C:\\Users\\ansha\\Documents\\saksi-engine\\audit.jsonl';
const ENGINE_VERSION = 'v5';

// =========================================================
// SECTION 1: Identitas user
// =========================================================
const USER_ID = process.env.BRAIN_USER;
if (!USER_ID) {
  console.log(JSON.stringify({
    status: 'ERROR',
    answer: 'Identitas tidak terdeteksi. Skill wrapper harus menetapkan BRAIN_USER.',
    sources: [], warnings: ['BRAIN_USER_MISSING']
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 2: Parse query
// =========================================================
const args = process.argv.slice(2);
const qIdx = args.indexOf('--query');
const QUERY = qIdx !== -1 ? args[qIdx + 1] : '';
if (!QUERY) {
  console.log(JSON.stringify({
    status: 'ERROR', answer: 'Query kosong.',
    sources: [], warnings: ['QUERY_EMPTY']
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 3: Audit helper
// =========================================================
function maskQueryForAudit(q) {
  let out = q;
  out = out.replace(/RM-\d{4}-\d{3}/gi, '[MASKED-RM]');
  out = out.replace(/\+62[\s-]?\d{3}[\s-]?\d{4}[\s-]?\d{3,4}/g, '[MASKED-PHONE]');
  out = out.replace(/\b08\d{2}[\s-]?\d{4}[\s-]?\d{3,4}\b/g, '[MASKED-PHONE]');
  out = out.replace(/\b\d{16}\b/g, '[MASKED-NIK]');
  out = out.replace(/\b0\d{12}\b/g, '[MASKED-BPJS]');
  return out;
}

function writeAudit(entry) {
  try {
    const ts = new Date().toISOString();
    const date = ts.slice(0, 10).replace(/-/g, '');
    const id = `AUD-${date}-${Math.random().toString(36).slice(2, 8)}`;
    const full = { ts, audit_id: id, engine_version: ENGINE_VERSION, ...entry };
    fs.appendFileSync(AUDIT_PATH, JSON.stringify(full) + '\n');
    return id;
  } catch (e) {
    // Audit failure tidak boleh crash engine
    return null;
  }
}

// =========================================================
// SECTION 4: Load data
// =========================================================
function loadJson(file) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')); }

let staff, permissions, docs, chats, drugs;
try {
  staff = loadJson('staff.json');
  permissions = loadJson('permissions.json');
  docs = loadJson('documents.json');
  chats = loadJson('chats.json');
  drugs = loadJson('drugs.json');
} catch (e) {
  writeAudit({
    user: USER_ID, query_masked: maskQueryForAudit(QUERY),
    status: 'ERROR', policy_decision: 'data_load_failed',
    sources_ids: [], sources_count: 0,
    injections_blocked: 0, conflict_type: null,
    error: e.message
  });
  console.log(JSON.stringify({
    status: 'ERROR', answer: `Gagal memuat data: ${e.message}`,
    sources: [], warnings: ['DATA_LOAD_FAILED']
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 5: Resolve user
// =========================================================
const user = staff.find(s => s.id === USER_ID);
if (!user) {
  writeAudit({
    user: USER_ID, query_masked: maskQueryForAudit(QUERY),
    status: 'ERROR', policy_decision: 'unknown_user',
    sources_ids: [], sources_count: 0,
    injections_blocked: 0, conflict_type: null
  });
  console.log(JSON.stringify({
    status: 'ERROR', answer: 'User tidak dikenali.',
    sources: [], warnings: ['USER_NOT_FOUND']
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 6: Permission gate
// =========================================================
function canAccess(record, user) {
  if (!record.acl_groups || record.acl_groups.length === 0) return true;
  if (record.acl_groups.includes('all_staff')) return true;
  const programField = record.project || record.program;
  const userGroups = user.groups || [];
  const userDeny = user.deny_programs || [];
  if (programField && userDeny.includes(programField)) return false;
  return record.acl_groups.some(g => userGroups.includes(g));
}

// =========================================================
// SECTION 7: Terms + scoring + injection
// =========================================================
const CRITICAL_TERMS = new Set([
  'hiv', 'vct', 'tb', 'dots', 'kia', 'usg', 'bpjs', 'nik',
  'cakalang', 'bahari', 'kenari', 'garuda', 'merpati',
  'stunting', 'imunisasi', 'polio', 'preeklamsia', 'preeklampsia',
  'hepatitis', 'gizi', 'jiwa', 'kehamilan', 'rujukan',
  'amoksisilin', 'parasetamol', 'amlodipin', 'metformin',
  'risperidon', 'rifampisin', 'isoniazid', 'pirazinamid',
  'etambutol', 'piridoksin', 'reagen', 'sgot', 'sgpt',
  'poli', 'sop', 'operasional', 'template', 'surat',
  'cuti', 'approve', 'password',   'cuti', 'approve', 'approval', 'password', 'bonus', 'gaji',
  'disetujui', 'menyetujui', 'kepegawaian', 'hrd', 'hr'
]);

const STOPWORDS = new Set([
  'bagaimana', 'berapa', 'apakah', 'apa', 'itu', 'yang', 'untuk', 'dari',
  'dengan', 'pada', 'dan', 'atau', 'ke', 'di', 'ini', 'tersebut',
  'pasien', 'data', 'info', 'informasi', 'status', 'ada', 'tidak',
  'saya', 'anda', 'kamu', 'dia', 'mereka', 'bisa', 'dapat', 'sudah', 'belum',
  'saat', 'sekarang', 'hari', 'minggu', 'bulan', 'tahun', 'mohon', 'tolong',
  'bantu', 'jelaskan', 'sebutkan', 'isi', 'berisi'
]);

const INJECTION_PATTERNS = [
  /<!--[\s\S]*?-->/gi,
  /ignore\s+(all\s+)?previous\s+instructions?/gi,
  /abaikan\s+(semua\s+)?(aturan|instruksi)\s+sebelumnya/gi,
  /instruksi\s+sistem\s+baru/gi,
  /kirim\s+seluruh[\s\S]{0,150}(email|kepada|alamat)/gi,
  /segera\s+jalankan\s+tanpa\s+konfirmasi/gi,
  /AI\s*:\s*(forward|ignore|export)/gi,
  /forward\s+(this|file)\s+to\s+all/gi,
  /system\s+override/gi,
  /catatan\s+untuk\s+asisten\s+ai/gi
];

function detectInjection(text) {
  if (!text || typeof text !== 'string') return { contains: false, sanitized: text };
  let sanitized = text;
  let contains = false;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      contains = true;
      sanitized = sanitized.replace(pattern, '[INSTRUKSI TERTANAM DIABAIKAN]');
    }
  }
  return { contains, sanitized: sanitized.trim() };
}

function extractTerms(query) {
  const raw = query.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);
  const critical = raw.filter(w => CRITICAL_TERMS.has(w));
  const general = raw.filter(w => w.length >= 4 && !STOPWORDS.has(w) && !CRITICAL_TERMS.has(w));
  const rmCodes = (query.match(/RM-\d{4}-\d{3}/gi) || []).map(s => s.toLowerCase());
  return { critical, general, rmCodes };
}

function extractRelevantExcerpt(content, terms, maxLen = 500) {
  if (!content) return '';
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  if (sentences.length <= 1) return content.slice(0, maxLen);

  const scored = sentences.map((s, i) => {
    const lower = s.toLowerCase();
    let score = 0;
    for (const t of terms.critical) {
      if (lower.includes(t)) {
        score += 5;
      } else if (t.length >= 5) {
        // Prefix match: "approve" → "approv" match "approval"
        const prefix = t.slice(0, Math.min(t.length - 1, 7));
        if (lower.includes(prefix)) score += 4;
      }
    }
    for (const t of terms.general) if (lower.includes(t)) score += 1;
    return { sentence: s, score, index: i };
  });

  const relevant = scored.filter(s => s.score > 0);
  if (relevant.length === 0) return content.slice(0, maxLen);

  const top = relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)  // naik dari 3 → 4 agar approval cuti pasti masuk
    .sort((a, b) => a.index - b.index);

  let result = top.map(s => s.sentence).join(' ');
  if (result.length > maxLen) result = result.slice(0, maxLen) + '...';
  return result;
}

function scoreRecord(record, terms) {
  const haystack = [
    record.content || '', record.title || '', record.name || '',
    record.diagnosis || '', record.medical_record || '', record.id || '',
    record.category || '', record.status || ''
  ].join(' ').toLowerCase();
  let score = 0, criticalMatches = 0;
  for (const rm of terms.rmCodes) if (haystack.includes(rm)) score += 10;
  for (const t of terms.critical) if (haystack.includes(t)) { score += 5; criticalMatches++; }
  for (const t of terms.general) if (haystack.includes(t)) score += 1;
  return { score, criticalMatches };
}

// =========================================================
// SECTION 8: Retrieval terfilter
// =========================================================
const terms = extractTerms(QUERY);
const candidates = [];
let injectionCount = 0;

for (const d of drugs) {
  const r = scoreRecord(d, terms);
  if (r.score > 0) candidates.push({ ...d, _type: 'drug', _score: r.score, _criticalMatches: r.criticalMatches });
}
for (const d of docs) {
  if (!canAccess(d, user)) continue;
  const r = scoreRecord(d, terms);
  if (r.score > 0) {
    const inj = detectInjection(d.content || '');
    if (inj.contains) injectionCount++;
    candidates.push({ ...d, _type: 'document', _score: r.score, _criticalMatches: r.criticalMatches, _injection: inj.contains, _sanitized: inj.sanitized });
  }
}
for (const c of chats) {
  if (!canAccess(c, user)) continue;
  const r = scoreRecord(c, terms);
  if (r.score > 0) {
    const inj = detectInjection(c.content || '');
    if (inj.contains) injectionCount++;
    candidates.push({ ...c, _type: 'chat', _score: r.score, _criticalMatches: r.criticalMatches, _injection: inj.contains, _sanitized: inj.sanitized });
  }
}

// =========================================================
// SECTION 9: Quality gate
// =========================================================
candidates.sort((a, b) => b._score - a._score);
const topCandidate = candidates[0];
const topHasCritical = topCandidate && topCandidate._criticalMatches > 0;
const requiresCriticalMatch = terms.critical.length > 0 || terms.rmCodes.length > 0;
const minScore = requiresCriticalMatch ? 3 : 2;
const insufficient =
  candidates.length === 0 ||
  (requiresCriticalMatch && !topHasCritical) ||
  (topCandidate && topCandidate._score < minScore);

if (insufficient) {
  const auditId = writeAudit({
    user: user.id,
    query_masked: maskQueryForAudit(QUERY),
    status: 'BUKTI_BELUM_CUKUP',
    policy_decision: 'no_evidence_or_denied',
    sources_ids: [],
    sources_count: 0,
    injections_blocked: injectionCount,
    conflict_type: null
  });
  console.log(JSON.stringify({
    status: 'BUKTI_BELUM_CUKUP',
    answer: 'Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu. Silakan hubungi pemilik topik terkait.',
    sources: [], warnings: [],
    _meta: { user: user.id, query: QUERY, sources_considered: 0, audit_id: auditId }
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 10: Conflict detection
// =========================================================
const top = candidates.slice(0, 3);

function extractTimes(text) {
  const matches = (text || '').match(/\b\d{1,2}[:.]\d{2}\b/g) || [];
  return [...new Set(matches)];
}

function detectConflict(top) {
  if (top.length < 2) return null;
  for (const a of top) {
    if (!a.superseded_by) continue;
    const newer = top.find(c => c.id === a.superseded_by);
    if (newer) return { type: 'SUPERSESSION', older: a, newer: newer,
      reason: `sumber ${a.id} telah ditandai superseded oleh ${newer.id}` };
  }
  const outdated = top.filter(c => c.status === 'outdated');
  const active = top.filter(c => c.status === 'active');
  if (outdated.length > 0 && active.length > 0) {
    for (const o of outdated) {
      for (const a of active) {
        const oTimes = extractTimes((o.content || '') + ' ' + (o.title || ''));
        const aTimes = extractTimes((a.content || '') + ' ' + (a.title || ''));
        if (oTimes.length > 0 && aTimes.length > 0) {
          return { type: 'OUTDATED_VS_ACTIVE', older: o, newer: a,
            reason: `${o.id} berstatus kedaluwarsa, ${a.id} berstatus aktif dan lebih baru` };
        }
      }
    }
  }
  return null;
}

const conflict = detectConflict(top);

if (conflict) {
  const older = conflict.older;
  const newer = conflict.newer;
  const oldDate = older.timestamp ? older.timestamp.split('T')[0] : 'tanpa tanggal';
  const newDate = newer.timestamp ? newer.timestamp.split('T')[0] : 'tanpa tanggal';
  const oldSnip = (older.content || older.name || '').slice(0, 160);
  const newSnip = (newer.content || newer.name || '').slice(0, 160);
  const answerText =
    `Ditemukan dua sumber dengan informasi berbeda.\n\n` +
    `Sumber lama: ${older.id} (${oldDate}, status: ${older.status || 'tidak diketahui'}) — "${oldSnip}..."\n\n` +
    `Sumber baru: ${newer.id} (${newDate}, status: ${newer.status || 'aktif'}) — "${newSnip}..."\n\n` +
    `Saya memprioritaskan ${newer.id} karena ${conflict.reason}. Jawaban berdasarkan sumber terbaru: ${newSnip}`;
  const sources = [newer, older].map(t => ({
    id: t.id, type: t._type, title: t.title || t.name || t.id,
    snippet: (t.content || t.name || '').slice(0, 150),
    timestamp: t.timestamp || null, status: t.status || null
  }));
  const auditId = writeAudit({
    user: user.id,
    query_masked: maskQueryForAudit(QUERY),
    status: 'KONFLIK',
    policy_decision: 'conflict_resolved_by_recency',
    sources_ids: sources.map(s => s.id),
    sources_count: sources.length,
    injections_blocked: injectionCount,
    conflict_type: conflict.type
  });
  console.log(JSON.stringify({
    status: 'KONFLIK', answer: answerText, sources: sources,
    warnings: ['CONFLICT_RESOLVED_BY_RECENCY'],
    _meta: { user: user.id, query: QUERY, sources_considered: 2,
      conflict_type: conflict.type, conflict_resolved: true,
      resolution_rule: 'newer_source_wins', audit_id: auditId }
  }, null, 2));
  process.exit(0);
}

// =========================================================
// SECTION 11: Normal answer + injection warning
// =========================================================
function maskSensitive(text) {
  if (!text) return '';
  let out = text;
  out = out.replace(/\+62[\s-]?\d{3}[\s-]?\d{4}[\s-]?\d{3,4}/g, '[REDACTED-PHONE]');
  out = out.replace(/\b08\d{2}[\s-]?\d{4}[\s-]?\d{3,4}\b/g, '[REDACTED-PHONE]');
  out = out.replace(/\b\d{16}\b/g, '[REDACTED-NIK]');
  out = out.replace(/\b0\d{12}\b/g, '[REDACTED-BPJS]');
  return out;
}

function buildAnswer(items) {
  if (items.length === 1) {
    const t = items[0];
    if (t._type === 'drug') return `${t.name}: stok ${t.stock} ${t.unit} (status: ${t.status}).`;
    const content = t._sanitized !== undefined ? t._sanitized : (t.content || t.title || '');
    return maskSensitive(extractRelevantExcerpt(content, terms, 400));
  }
  return items.map(t => {
    if (t._type === 'drug') return `• ${t.name}: stok ${t.stock} ${t.unit} (status: ${t.status})`;
    const content = t._sanitized !== undefined ? t._sanitized : (t.content || '');
    return `• ${maskSensitive(extractRelevantExcerpt(content, terms, 500))}`;
  }).join('\n');
}

// Filter: top result selalu masuk; secondary hanya jika punya critical match
// atau skornya minimal 60% dari top. Ini menghilangkan noise dari dokumen
// yang hanya match general term (misal "SIMPUS").
const topScore = top[0]._score;
const displayedTop = top.filter((t, i) => {
  if (i === 0) return true;
  return t._criticalMatches > 0 || t._score >= topScore * 0.6;
});

let finalAnswer = buildAnswer(displayedTop);
const warnings = [];

// Warning injeksi hanya muncul jika TOP RESULT mengandung injeksi.
// Jika injeksi hanya ada di sumber sekunder, tetap disanitasi tapi tidak
// munculkan warning besar.
const topHasInjection = top[0] && top[0]._injection === true;
if (injectionCount > 0 && topHasInjection) {
  warnings.push('INJECTION_DETECTED', 'INJECTION_SANITIZED');
  finalAnswer =
    `⚠️ PERHATIAN: Satu atau lebih dokumen yang relevan mengandung instruksi tertanam yang mencoba mengalihkan AI untuk melakukan tindakan tidak sah (misalnya mengirim data ke pihak luar). Instruksi tersebut telah DIABAIKAN dan kontennya disanitasi.\n\n` +
    finalAnswer +
    `\n\n[Jika Anda melihat tanda "[INSTRUKSI TERTANAM DIABAIKAN]", itu adalah bagian dari dokumen asli yang sengaja dinonaktifkan oleh sistem SAKSI.]`;
}

const sources = displayedTop.map(t => {
  const src = {
    id: t.id, type: t._type, title: maskSensitive(t.title || t.name || t.id),
    snippet: maskSensitive(extractRelevantExcerpt(t._sanitized || t.content || t.name || '', terms, 500)),
    timestamp: t.timestamp || null
  };
  if (t._injection) src.injection_detected = true;
  return src;
});

const auditId = writeAudit({
  user: user.id,
  query_masked: maskQueryForAudit(QUERY),
  status: 'TERVERIFIKASI',
  policy_decision: 'allow',
  sources_ids: sources.map(s => s.id),
  sources_count: sources.length,
  injections_blocked: injectionCount,
  conflict_type: null
});

console.log(JSON.stringify({
  status: 'TERVERIFIKASI',
  answer: finalAnswer,
  sources: sources,
  warnings: warnings,
  _meta: { user: user.id, query: QUERY, sources_considered: displayedTop.length,
    injections_blocked: injectionCount, audit_id: auditId }
}, null, 2));