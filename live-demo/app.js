/* ============================================================
   SAKSI — Live Demo UI
   ============================================================ */
(function () {
  "use strict";

  const DATA = window.SAKSI_DATA;
  const ENGINE = window.SAKSI_ENGINE;

  const el = {
    userList: document.getElementById("userList"),
    suggestions: document.getElementById("suggestions"),
    welcome: document.getElementById("welcome"),
    messages: document.getElementById("messages"),
    chatScroll: document.getElementById("chatScroll"),
    form: document.getElementById("askForm"),
    input: document.getElementById("queryInput"),
    gateBlocked: document.getElementById("gateBlocked"),
    gateScanned: document.getElementById("gateScanned"),
    gateAllowed: document.getElementById("gateAllowed"),
    gateNote: document.getElementById("gateNote"),
    auditList: document.getElementById("auditList"),
    auditCount: document.getElementById("auditCount"),
  };

  let currentUser = DATA.demoUsers[0];
  let auditCount = 0;
  let askedOnce = false;

  // ---------- helpers ----------
  const escHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const markTokens = (escaped) =>
    escaped.replace(
      /\[(?:MASKED|REDACTED)-[A-Z]+\]|\[INSTRUKSI TERTANAM DIABAIKAN\]/g,
      (m) => `<span class="masked">${m}</span>`
    );

  const STATUS_CLASS = {
    TERVERIFIKASI: "ok",
    BUKTI_BELUM_CUKUP: "refuse",
    KONFLIK: "conflict",
  };

  const DECISION = {
    TERVERIFIKASI: "allow",
    BUKTI_BELUM_CUKUP: "no_evidence_or_denied",
    KONFLIK: "conflict_resolved_by_recency",
  };

  const STATUS_LABEL = {
    TERVERIFIKASI: "Terverifikasi",
    BUKTI_BELUM_CUKUP: "Bukti belum cukup",
    KONFLIK: "Konflik terdeteksi",
  };

  function userById(id) {
    return DATA.staff.find((s) => s.id === id);
  }

  function auditId() {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const rnd = Math.random().toString(36).slice(2, 8);
    return `AUD-${ymd}-${rnd}`;
  }

  function nowHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // ---------- render: users ----------
  function renderUsers() {
    el.userList.innerHTML = DATA.demoUsers
      .map((id) => {
        const u = userById(id);
        const groups = (u.groups || []).slice(0, 3).join(" · ");
        return `
          <button class="user${id === currentUser ? " active" : ""}" data-user="${u.id}" type="button">
            <div class="user-top">
              <span class="user-id">${u.id}</span>
              <span class="user-name">${escHtml(u.name)}</span>
            </div>
            <div class="user-role">${escHtml(u.role)}</div>
            <div class="user-meta">
              <span class="chip clr ${u.clearance}">${u.clearance}</span>
              <span class="chip">${escHtml(groups)}</span>
            </div>
          </button>`;
      })
      .join("");

    el.userList.querySelectorAll(".user").forEach((btn) => {
      btn.addEventListener("click", () => switchUser(btn.dataset.user));
    });
  }

  function switchUser(id) {
    if (id === currentUser) return;
    currentUser = id;
    const u = userById(id);
    renderUsers();

    if (askedOnce) {
      const div = document.createElement("div");
      div.className = "sys-divider";
      div.innerHTML = `Beralih ke <b>${escHtml(u.name)}</b> · ${escHtml(u.role)} · ${u.clearance}`;
      el.messages.appendChild(div);
      scrollDown();
    }
  }

  // ---------- render: suggestions ----------
  function renderSuggestions() {
    el.suggestions.innerHTML = DATA.suggestions
      .map(
        (s) => `<button class="sug" type="button" data-q="${escHtml(s.q)}">
          <span class="tag">${escHtml(s.tag)}</span>${escHtml(s.q)}
        </button>`
      )
      .join("");

    el.suggestions.querySelectorAll(".sug").forEach((b) => {
      b.addEventListener("click", () => {
        el.input.value = b.dataset.q;
        ask(b.dataset.q);
      });
    });
  }

  // ---------- render: answer text ----------
  function renderAnswer(text) {
    const blocks = text.split(/\n{2,}/);
    return blocks
      .map((b) => {
        const esc = escHtml(b);
        if (b.trim().startsWith("⚠️")) {
          return `<span class="warnline">${markTokens(esc)}</span>`;
        }
        return `<div class="para">${markTokens(esc)}</div>`;
      })
      .join("");
  }

  // ---------- render: evidence ----------
  function renderSources(sources) {
    if (!sources.length) return "";
    const cards = sources
      .map((s) => {
        const date = s.timestamp ? s.timestamp.split("T")[0] : "—";
        const flag = s.injection_detected
          ? '<span class="ev-flag">injeksi disanitasi</span>'
          : "";
        return `
          <div class="ev">
            <div class="ev-top">
              <span class="ev-id">${escHtml(s.id)}</span>
              <span class="ev-type">${escHtml(s.type)}</span>
              <span class="ev-title">${escHtml(s.title)}${flag}</span>
              <span class="ev-date">${escHtml(date)}</span>
            </div>
            ${s.snippet ? `<div class="ev-snip">${markTokens(escHtml(s.snippet))}</div>` : ""}
          </div>`;
      })
      .join("");
    return `<div class="ev-label">Sumber</div>${cards}`;
  }

  // ---------- render: trace ----------
  function renderTrace(trace) {
    const items = trace
      .map((t) => {
        const cls = t.blocked ? "trace-item blocked" : "trace-item";
        return `<div class="${cls}"><span class="step">${escHtml(t.step)}</span> — <span class="detail">${escHtml(t.detail)}</span></div>`;
      })
      .join("");
    return `<details class="trace"><summary>lihat pipeline</summary><div class="trace-list">${items}</div></details>`;
  }

  // ---------- render: turn ----------
  function renderTurn(query, result, user) {
    const turn = document.createElement("div");
    turn.className = "turn";

    const statusCls = STATUS_CLASS[result.status] || "refuse";
    const statusLabel = STATUS_LABEL[result.status] || result.status;

    turn.innerHTML = `
      <div class="q-row">
        <div class="q-bubble"><span class="slash">/saksi</span>${escHtml(query)}</div>
      </div>
      <div class="a-row">
        <div class="a-avatar">S</div>
        <div class="a-body">
          <div class="a-head">
            <span class="a-name">SAKSI</span>
            <span class="status ${statusCls}">${escHtml(statusLabel)}</span>
          </div>
          <div class="a-text">${renderAnswer(result.answer)}</div>
          ${renderSources(result.sources)}
          <div class="a-foot">
            <span>Dijawab untuk <b>${escHtml(user.id)}</b> · ${escHtml(user.role)}</span>
            <span><span class="blocked-num">${result.gate.blockedTotal}</span> diblokir sebelum retrieval</span>
          </div>
          ${renderTrace(result.trace)}
        </div>
      </div>`;

    el.messages.appendChild(turn);
  }

  // ---------- render: audit ----------
  function addAudit(query, result, user) {
    auditCount++;
    el.auditCount.textContent = String(auditCount);

    const empty = el.auditList.querySelector(".audit-empty");
    if (empty) empty.remove();

    const masked = ENGINE.maskQueryForAudit(query);
    const cls = STATUS_CLASS[result.status] || "refuse";
    const id = auditId();
    const srcIds = result.sources.map((s) => s.id).join(", ") || "—";

    const entry = document.createElement("div");
    entry.className = "audit-entry";
    entry.innerHTML = `
      <div class="ts">${nowHHMM()} · ${id}</div>
      <div class="q">${markTokens(escHtml(masked))}</div>
      <div class="row">
        <span>${escHtml(user.id)}</span>
        <span class="st ${cls}">${escHtml(DECISION[result.status] || result.status)}</span>
        <span>${result.sources.length} sumber</span>
        ${result.meta.injections_blocked ? `<span style="color:var(--red)">${result.meta.injections_blocked} injeksi</span>` : ""}
      </div>
      <div class="row"><span style="color:var(--dim)">${escHtml(srcIds)}</span></div>`;

    el.auditList.prepend(entry);
  }

  // ---------- gate ----------
  function updateGate(result) {
    el.gateBlocked.textContent = String(result.gate.blockedTotal);
    el.gateScanned.textContent = String(result.gate.scanned);
    el.gateAllowed.textContent = String(result.gate.allowed);

    const pct = result.gate.scanned
      ? Math.round((result.gate.blockedTotal / result.gate.scanned) * 100)
      : 0;
    el.gateNote.textContent = `${pct}% dokumen/chat ditolak ACL sebelum masuk konteks LLM.`;
    el.gateNote.classList.toggle("warn", pct > 0);
  }

  // ---------- ask ----------
  function ask(rawQuery) {
    const query = (rawQuery || "").trim();
    if (!query) return;

    const user = userById(currentUser);
    const result = ENGINE.ask(query, currentUser, DATA);

    if (!askedOnce) {
      askedOnce = true;
      el.welcome.style.display = "none";
    }

    renderTurn(query, result, user);
    addAudit(query, result, user);
    updateGate(result);
    scrollDown();
  }

  function scrollDown() {
    requestAnimationFrame(() => {
      el.chatScroll.scrollTop = el.chatScroll.scrollHeight;
    });
  }

  // ---------- reset ----------
  function reset() {
    el.messages.innerHTML = "";
    el.auditList.innerHTML = '<p class="audit-empty">Belum ada entri.</p>';
    el.auditCount.textContent = "0";
    auditCount = 0;
    askedOnce = false;
    el.welcome.style.display = "";
    el.gateBlocked.textContent = "—";
    el.gateScanned.textContent = "—";
    el.gateAllowed.textContent = "—";
    el.gateNote.textContent = "Ajukan pertanyaan untuk melihat gate bekerja.";
    el.gateNote.classList.remove("warn");
    el.input.value = "";
    el.input.focus();
  }

  // ---------- init ----------
  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    ask(el.input.value);
    el.input.value = "";
  });

  document.getElementById("resetBtn").addEventListener("click", reset);

  renderUsers();
  renderSuggestions();

  el.gateBlocked.textContent = "—";
  el.gateScanned.textContent = "—";
  el.gateAllowed.textContent = "—";

  el.input.focus();
})();
