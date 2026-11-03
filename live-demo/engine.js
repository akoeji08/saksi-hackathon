// SAKSI Engine — browser port of engine/ask.mjs (v5)
// Logic is a faithful 1:1 port. The only additions are:
//   - `blocked` counters so the UI can prove the permission gate runs
//     BEFORE retrieval (trust boundary B3)
//   - `trace` steps so the UI can show the pipeline
(function (global) {
  "use strict";

  // ---------- Section 7: terms ----------
  const CRITICAL_TERMS = new Set([
    "hiv", "vct", "tb", "dots", "kia", "usg", "bpjs", "nik",
    "cakalang", "bahari", "kenari", "garuda", "merpati",
    "stunting", "imunisasi", "polio", "preeklamsia", "preeklampsia",
    "hepatitis", "gizi", "jiwa", "kehamilan", "rujukan",
    "amoksisilin", "parasetamol", "amlodipin", "metformin",
    "risperidon", "rifampisin", "isoniazid", "pirazinamid",
    "etambutol", "piridoksin", "reagen", "sgot", "sgpt",
    "poli", "sop", "operasional", "template", "surat",
    "cuti", "approve", "password", "approval", "bonus", "gaji",
    "disetujui", "menyetujui", "kepegawaian", "hrd", "hr",
  ]);

  const STOPWORDS = new Set([
    "bagaimana", "berapa", "apakah", "apa", "itu", "yang", "untuk", "dari",
    "dengan", "pada", "dan", "atau", "ke", "di", "ini", "tersebut",
    "pasien", "data", "info", "informasi", "status", "ada", "tidak",
    "saya", "anda", "kamu", "dia", "mereka", "bisa", "dapat", "sudah", "belum",
    "saat", "sekarang", "hari", "minggu", "bulan", "tahun", "mohon", "tolong",
    "bantu", "jelaskan", "sebutkan", "isi", "berisi",
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
    /catatan\s+untuk\s+asisten\s+ai/gi,
  ];

  // ---------- Section 3: audit masking ----------
  function maskQueryForAudit(q) {
    let out = q;
    out = out.replace(/RM-\d{4}-\d{3}/gi, "[MASKED-RM]");
    out = out.replace(/\+62[\s-]?\d{3}[\s-]?\d{4}[\s-]?\d{3,4}/g, "[MASKED-PHONE]");
    out = out.replace(/\b08\d{2}[\s-]?\d{4}[\s-]?\d{3,4}\b/g, "[MASKED-PHONE]");
    out = out.replace(/\b\d{16}\b/g, "[MASKED-NIK]");
    out = out.replace(/\b0\d{12}\b/g, "[MASKED-BPJS]");
    return out;
  }

  // ---------- Section 6: permission gate ----------
  function canAccess(record, user) {
    if (!record.acl_groups || record.acl_groups.length === 0) return true;
    if (record.acl_groups.includes("all_staff")) return true;
    const programField = record.project || record.program;
    const userGroups = user.groups || [];
    const userDeny = user.deny_programs || [];
    if (programField && userDeny.includes(programField)) return false;
    return record.acl_groups.some((g) => userGroups.includes(g));
  }

  // ---------- Section 7: injection ----------
  function detectInjection(text) {
    if (!text || typeof text !== "string") return { contains: false, sanitized: text };
    let sanitized = text;
    let contains = false;
    for (const pattern of INJECTION_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        contains = true;
        sanitized = sanitized.replace(pattern, "[INSTRUKSI TERTANAM DIABAIKAN]");
      }
      pattern.lastIndex = 0;
    }
    return { contains, sanitized: sanitized.trim() };
  }

  function extractTerms(query) {
    const raw = query.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter(Boolean);
    const critical = raw.filter((w) => CRITICAL_TERMS.has(w));
    const general = raw.filter(
      (w) => w.length >= 4 && !STOPWORDS.has(w) && !CRITICAL_TERMS.has(w)
    );
    const rmCodes = (query.match(/RM-\d{4}-\d{3}/gi) || []).map((s) => s.toLowerCase());
    return { critical, general, rmCodes };
  }

  function extractRelevantExcerpt(content, terms, maxLen) {
    maxLen = maxLen || 500;
    if (!content) return "";
    const sentences = content.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    if (sentences.length <= 1) return content.slice(0, maxLen);

    const scored = sentences.map((s, i) => {
      const lower = s.toLowerCase();
      let score = 0;
      for (const t of terms.critical) {
        if (lower.includes(t)) score += 5;
        else if (t.length >= 5) {
          const prefix = t.slice(0, Math.min(t.length - 1, 7));
          if (lower.includes(prefix)) score += 4;
        }
      }
      for (const t of terms.general) if (lower.includes(t)) score += 1;
      return { sentence: s, score, index: i };
    });

    const relevant = scored.filter((s) => s.score > 0);
    if (relevant.length === 0) return content.slice(0, maxLen);

    const top = relevant
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .sort((a, b) => a.index - b.index);

    let result = top.map((s) => s.sentence).join(" ");
    if (result.length > maxLen) result = result.slice(0, maxLen) + "...";
    return result;
  }

  function scoreRecord(record, terms) {
    const haystack = [
      record.content || "", record.title || "", record.name || "",
      record.diagnosis || "", record.medical_record || "", record.id || "",
      record.category || "", record.status || "",
    ].join(" ").toLowerCase();
    let score = 0, criticalMatches = 0;
    for (const rm of terms.rmCodes) if (haystack.includes(rm)) score += 10;
    for (const t of terms.critical) if (haystack.includes(t)) { score += 5; criticalMatches++; }
    for (const t of terms.general) if (haystack.includes(t)) score += 1;
    return { score, criticalMatches };
  }

  // ---------- Section 11: PII masking ----------
  function maskSensitive(text) {
    if (!text) return "";
    let out = text;
    out = out.replace(/\+62[\s-]?\d{3}[\s-]?\d{4}[\s-]?\d{3,4}/g, "[REDACTED-PHONE]");
    out = out.replace(/\b08\d{2}[\s-]?\d{4}[\s-]?\d{3,4}\b/g, "[REDACTED-PHONE]");
    out = out.replace(/\b\d{16}\b/g, "[REDACTED-NIK]");
    out = out.replace(/\b0\d{12}\b/g, "[REDACTED-BPJS]");
    return out;
  }

  // ---------- Section 10: conflict ----------
  function extractTimes(text) {
    const matches = (text || "").match(/\b\d{1,2}[:.]\d{2}\b/g) || [];
    return [...new Set(matches)];
  }

  function detectConflict(top) {
    if (top.length < 2) return null;
    for (const a of top) {
      if (!a.superseded_by) continue;
      const newer = top.find((c) => c.id === a.superseded_by);
      if (newer) {
        return {
          type: "SUPERSESSION", older: a, newer: newer,
          reason: `sumber ${a.id} telah ditandai superseded oleh ${newer.id}`,
        };
      }
    }
    const outdated = top.filter((c) => c.status === "outdated");
    const active = top.filter((c) => c.status === "active");
    if (outdated.length > 0 && active.length > 0) {
      for (const o of outdated) {
        for (const a of active) {
          const oTimes = extractTimes((o.content || "") + " " + (o.title || ""));
          const aTimes = extractTimes((a.content || "") + " " + (a.title || ""));
          if (oTimes.length > 0 && aTimes.length > 0) {
            return {
              type: "OUTDATED_VS_ACTIVE", older: o, newer: a,
              reason: `${o.id} berstatus kedaluwarsa, ${a.id} berstatus aktif dan lebih baru`,
            };
          }
        }
      }
    }
    return null;
  }

  function buildAnswer(items, terms) {
    if (items.length === 1) {
      const t = items[0];
      if (t._type === "drug") return `${t.name}: stok ${t.stock} ${t.unit} (status: ${t.status}).`;
      const content = t._sanitized !== undefined ? t._sanitized : (t.content || t.title || "");
      return maskSensitive(extractRelevantExcerpt(content, terms, 400));
    }
    return items
      .map((t) => {
        if (t._type === "drug") return `• ${t.name}: stok ${t.stock} ${t.unit} (status: ${t.status})`;
        const content = t._sanitized !== undefined ? t._sanitized : (t.content || "");
        return `• ${maskSensitive(extractRelevantExcerpt(content, terms, 500))}`;
      })
      .join("\n");
  }

  // ---------- Main ----------
  function ask(query, userId, data) {
    const trace = [];
    const user = data.staff.find((s) => s.id === userId);
    if (!user) {
      return { status: "ERROR", answer: "User tidak dikenali.", sources: [], warnings: ["USER_NOT_FOUND"], trace };
    }
    trace.push({ step: "user_resolver", detail: `${user.id} · ${user.role} · clearance ${user.clearance}` });

    const terms = extractTerms(query);
    trace.push({
      step: "term_extraction",
      detail: `${terms.critical.length} critical · ${terms.general.length} general`,
    });

    // ---- Section 8: filtered retrieval (ACL checked BEFORE scoring) ----
    const candidates = [];
    let injectionCount = 0;
    let blockedDocs = 0;
    let blockedChats = 0;
    let scannedDocs = 0;
    let scannedChats = 0;

    for (const d of data.drugs) {
      const r = scoreRecord(d, terms);
      if (r.score > 0) {
        candidates.push({ ...d, _type: "drug", _score: r.score, _criticalMatches: r.criticalMatches });
      }
    }
    for (const d of data.documents) {
      scannedDocs++;
      if (!canAccess(d, user)) { blockedDocs++; continue; }
      const r = scoreRecord(d, terms);
      if (r.score > 0) {
        const inj = detectInjection(d.content || "");
        if (inj.contains) injectionCount++;
        candidates.push({
          ...d, _type: "document", _score: r.score, _criticalMatches: r.criticalMatches,
          _injection: inj.contains, _sanitized: inj.sanitized,
        });
      }
    }
    for (const c of data.chats) {
      scannedChats++;
      if (!canAccess(c, user)) { blockedChats++; continue; }
      const r = scoreRecord(c, terms);
      if (r.score > 0) {
        const inj = detectInjection(c.content || "");
        if (inj.contains) injectionCount++;
        candidates.push({
          ...c, _type: "chat", _score: r.score, _criticalMatches: r.criticalMatches,
          _injection: inj.contains, _sanitized: inj.sanitized,
        });
      }
    }

    trace.push({
      step: "permission_gate",
      detail: `${blockedDocs + blockedChats} diblokir sebelum retrieval (${blockedDocs} dokumen, ${blockedChats} chat)`,
      blocked: blockedDocs + blockedChats,
    });
    trace.push({ step: "retrieval", detail: `${candidates.length} kandidat lolos ACL` });

    const gate = {
      blockedDocs, blockedChats,
      blockedTotal: blockedDocs + blockedChats,
      scanned: scannedDocs + scannedChats,
      allowed: candidates.length,
    };

    // ---- Section 9: quality gate ----
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
      trace.push({ step: "quality_gate", detail: "BUKTI_BELUM_CUKUP — tidak ada bukti yang memenuhi ambang" });
      return {
        status: "BUKTI_BELUM_CUKUP",
        answer: "Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu. Silakan hubungi pemilik topik terkait.",
        sources: [],
        warnings: [],
        gate, trace,
        meta: { user: user.id, query, sources_considered: 0 },
      };
    }
    trace.push({ step: "quality_gate", detail: "lolos — bukti memadai" });

    // ---- Section 10: conflict ----
    const top = candidates.slice(0, 3);
    const conflict = detectConflict(top);

    if (conflict) {
      const older = conflict.older;
      const newer = conflict.newer;
      const oldDate = older.timestamp ? older.timestamp.split("T")[0] : "tanpa tanggal";
      const newDate = newer.timestamp ? newer.timestamp.split("T")[0] : "tanpa tanggal";
      const oldSnip = (older.content || older.name || "").slice(0, 160);
      const newSnip = (newer.content || newer.name || "").slice(0, 160);
      const answerText =
        `Ditemukan dua sumber dengan informasi berbeda.\n\n` +
        `Sumber lama: ${older.id} (${oldDate}, status: ${older.status || "tidak diketahui"}) — "${oldSnip}..."\n\n` +
        `Sumber baru: ${newer.id} (${newDate}, status: ${newer.status || "aktif"}) — "${newSnip}..."\n\n` +
        `Saya memprioritaskan ${newer.id} karena ${conflict.reason}. Jawaban berdasarkan sumber terbaru: ${newSnip}`;
      const sources = [newer, older].map((t) => ({
        id: t.id, type: t._type, title: t.title || t.name || t.id,
        snippet: (t.content || t.name || "").slice(0, 150),
        timestamp: t.timestamp || null, status: t.status || null,
      }));
      trace.push({ step: "conflict_detector", detail: `${conflict.type} — ${conflict.reason}` });
      return {
        status: "KONFLIK", answer: answerText, sources,
        warnings: ["CONFLICT_RESOLVED_BY_RECENCY"],
        gate, trace,
        meta: {
          user: user.id, query, sources_considered: 2,
          conflict_type: conflict.type, conflict_resolved: true,
          resolution_rule: "newer_source_wins",
        },
      };
    }

    // ---- Section 11: normal answer ----
    const topScore = top[0]._score;
    const displayedTop = top.filter((t, i) => {
      if (i === 0) return true;
      return t._criticalMatches > 0 || t._score >= topScore * 0.6;
    });

    let finalAnswer = buildAnswer(displayedTop, terms);
    const warnings = [];

    const topHasInjection = top[0] && top[0]._injection === true;
    if (injectionCount > 0 && topHasInjection) {
      warnings.push("INJECTION_DETECTED", "INJECTION_SANITIZED");
      finalAnswer =
        `⚠️ PERHATIAN: Satu atau lebih dokumen yang relevan mengandung instruksi tertanam yang mencoba mengalihkan AI untuk melakukan tindakan tidak sah (misalnya mengirim data ke pihak luar). Instruksi tersebut telah DIABAIKAN dan kontennya disanitasi.\n\n` +
        finalAnswer +
        `\n\n[Jika Anda melihat tanda "[INSTRUKSI TERTANAM DIABAIKAN]", itu adalah bagian dari dokumen asli yang sengaja dinonaktifkan oleh sistem SAKSI.]`;
    }
    if (injectionCount > 0) {
      trace.push({ step: "injection_sanitizer", detail: `${injectionCount} instruksi tertanam dinonaktifkan` });
    } else {
      trace.push({ step: "injection_sanitizer", detail: "tidak ada injeksi" });
    }
    trace.push({ step: "pii_masking", detail: "NIK / HP / BPJS / RM disamarkan" });

    const sources = displayedTop.map((t) => {
      const src = {
        id: t.id, type: t._type,
        title: maskSensitive(t.title || t.name || t.id),
        snippet: maskSensitive(extractRelevantExcerpt(t._sanitized || t.content || t.name || "", terms, 500)),
        timestamp: t.timestamp || null,
      };
      if (t._injection) src.injection_detected = true;
      return src;
    });

    trace.push({ step: "answer_composer", detail: `${sources.length} sumber dilampirkan` });

    return {
      status: "TERVERIFIKASI",
      answer: finalAnswer,
      sources,
      warnings,
      gate, trace,
      meta: {
        user: user.id, query, sources_considered: displayedTop.length,
        injections_blocked: injectionCount,
      },
    };
  }

  global.SAKSI_ENGINE = { ask, canAccess, maskQueryForAudit, CRITICAL_TERMS };
})(window);
