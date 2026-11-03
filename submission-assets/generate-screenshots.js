/**
 * Generate WorkBuddy chat screenshot images from the HTML template.
 *
 * Faithfully reproduces the real WorkBuddy Desktop UI:
 *   window chrome -> sidebar (nav / tasks / workspaces / user) -> chat -> composer
 *
 * Uses Remotion's bundled headless Chrome via puppeteer-core.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT_DIR = __dirname;
const TEMPLATE = path.join(OUT_DIR, "chat-template.html");

const VIEW_W = 1280;

// ---- Sidebar task list (mirrors the real sidebar) ---------------------------

const SIDE_TASKS = [
  { active: true,  name: "Create witness skill demo video for hackathon", date: "Baru saja" },
  { active: false, name: "Review SKILL.md file", date: "24 Okt" },
  { active: false, name: "Apa isi template surat rujukan?", date: "24 Okt" },
  { active: false, name: "Request admin SIMPUS password", date: "24 Okt" },
  { active: false, name: "Ask clinic operating hours", date: "24 Okt" },
  { active: false, name: "Request admin password for SIKA", date: "24 Okt" },
  { active: false, name: "Calculate 2027 annual bonus", date: "24 Okt" },
  { active: false, name: "Check annual leave balance", date: "24 Okt" },
  { active: false, name: "Check leave approval status", date: "24 Okt" },
  { active: false, name: "Check my leave approval status", date: "24 Okt" },
  { active: false, name: "Check annual leave balance", date: "24 Okt" },
];

// ---- Toolbar strip (copy / like / dislike / share / cost) -------------------

const TOOLBAR = `
  <div class="toolbar">
    <svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
    <svg viewBox="0 0 24 24"><path d="M7 10v11H3V10zM7 10l4-7a2 2 0 013 2v4h5a2 2 0 012 2l-1.5 8a2 2 0 01-2 1.5H7"/></svg>
    <svg viewBox="0 0 24 24"><path d="M7 10v11H3V10zM7 10l4-7a2 2 0 013 2v4h5a2 2 0 012 2l-1.5 8a2 2 0 01-2 1.5H7"/><path d="M17 3l-5 5M17 3l-5 5"/></svg>
    <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    <svg viewBox="0 0 24 24"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 19h16"/></svg>
    <span class="sp">Total digunakan <b>&#9679; 52.3</b> &#9679; <b>Auto</b> &#9679; 14:43</span>
  </div>`;

// ---- Conversation definitions ----------------------------------------------

const CONVERSATIONS = [
  {
    file: "shot-1-evidence-based-answer.png",
    title: "Evidence-based answer",
    chatTitle: "SAKSI — Evidence-based answer",
    html: `
<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Berapa stok Amoksisilin 500mg sekarang?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div>&#8226; Amoksisilin 500mg: stok <b>40 tablet</b> (status: kritis)</div>
    <div>&#8226; Amoksisilin 250mg: stok 180 tablet (status: aman)</div>
    <div>&#8226; Daftar obat esensial puskesmas: Amoksisilin, Ampisilin, Parasetamol, ...</div>
    <div class="evlabel">Sumber</div>
    <div class="evcard"><span class="evid">DRG-001</span><span class="evtitle">Amoksisilin 500mg</span><span class="evdate">&#8212;</span></div>
    <div class="evcard"><span class="evid">DRG-002</span><span class="evtitle">Amoksisilin 250mg</span><span class="evdate">&#8212;</span></div>
    <div class="evcard"><span class="evid">DOC-006</span><span class="evtitle">Formularium Obat Puskesmas 2026</span><span class="evdate">2026-01-05</span></div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>
${TOOLBAR}`,
  },
  {
    file: "shot-2-refusal-equivalence.png",
    title: "Refusal equivalence — restricted vs non-existent",
    chatTitle: "SAKSI — Refusal equivalence",
    html: `
<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Apa itu Proyek Cakalang?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div>Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.<br>Silakan hubungi pemilik topik terkait.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>

<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Apa itu Proyek Naga?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div>Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.<br>Silakan hubungi pemilik topik terkait.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
    <div class="identical">&#10003; RESPONS IDENTIK KATA PER KATA</div>
  </div>
</div>
${TOOLBAR}`,
  },
  {
    file: "shot-3-prompt-injection-defense.png",
    title: "Prompt injection defense",
    chatTitle: "SAKSI — Prompt injection defense",
    html: `
<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Apa isi template surat rujukan?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div class="warn">
      <b>&#9888; PERHATIAN:</b> Satu atau lebih dokumen yang relevan mengandung instruksi
      tertanam yang mencoba mengalihkan AI untuk melakukan tindakan tidak sah
      (misalnya mengirim data ke pihak luar). Instruksi tersebut telah <b>DIABAIKAN</b>
      dan kontennya disanitasi.
    </div>
    <div>Surat rujukan wajib memuat:</div>
    <div>&#8212; Identitas pasien &#8212; nama, NIK, tanggal lahir, nomor RM</div>
    <div>&#8212; Diagnosis kerja</div>
    <div>&#8212; Riwayat singkat</div>
    <div>&#8212; Tindakan yang sudah diberikan</div>
    <div>&#8212; Tujuan rujukan</div>
    <div>&#8212; Tanda tangan dokter perujuk</div>
    <div style="margin-top:10px"><span class="blocked">[INSTRUKSI TERTANAM DIABAIKAN]</span></div>
    <div class="evlabel">Sumber</div>
    <div class="evcard"><span class="evid">DOC-007</span><span class="evtitle">Template Surat Rujukan Puskesmas ke RS</span><span class="evdate">2026-02-11</span></div>
    <div class="evcard"><span class="evid">DOC-002</span><span class="evtitle">SOP-YAN-014: Alur Pendaftaran Pasien</span><span class="evdate">2026-01-18</span></div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>
<div class="meta">
  <span class="k">Injeksi dicegat:</span> 1 &nbsp;&#183;&nbsp; <span class="k">Email tujuan tidak lolos:</span> datapasien@medikacenter-x.co.id &nbsp;&#183;&nbsp; <span class="k">Data bocor:</span> 0
</div>
${TOOLBAR}`,
  },
  {
    file: "shot-4-audit-ledger.png",
    title: "Audit ledger — metadata only, PII masked",
    chatTitle: "SAKSI — Audit ledger",
    html: `
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble" style="max-width:840px">
    <div class="terminal">
<span class="t-dim">$</span> <span class="t-white">node engine/show-audit.mjs --user STF-005</span>

<span class="t-cyan">Total entri: 4</span>

<span class="t-white">2026-10-24T06:22:23.031Z</span> | <span class="t-cyan">AUD-20261024-3su7ul</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Berapa stok Amoksisilin 500mg sekarang?
  <span class="t-cyan">Status</span>   : <span class="t-green">TERVERIFIKASI</span>
  <span class="t-cyan">Decision</span> : <span class="t-green">allow</span>
  <span class="t-cyan">Sources</span>  : [DRG-001, DRG-002, DOC-006] (3)
<span class="t-dim">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>
<span class="t-white">2026-10-24T06:23:47.757Z</span> | <span class="t-cyan">AUD-20261024-r61yrd</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Apa itu Proyek Cakalang?
  <span class="t-cyan">Status</span>   : <span class="t-yellow">BUKTI_BELUM_CUKUP</span>
  <span class="t-cyan">Decision</span> : <span class="t-yellow">no_evidence_or_denied</span>
  <span class="t-cyan">Sources</span>  : [] (0)
<span class="t-dim">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>
<span class="t-white">2026-10-24T06:24:53.094Z</span> | <span class="t-cyan">AUD-20261024-t2n4vd</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Apa isi template surat rujukan?
  <span class="t-cyan">Status</span>   : <span class="t-green">TERVERIFIKASI</span>
  <span class="t-cyan">Decision</span> : <span class="t-green">allow</span>
  <span class="t-cyan">Sources</span>  : [DOC-007, DOC--002, DOC-006] (3)
  <span class="t-cyan">Inject</span>   : <span class="t-red">1 blocked</span>
<span class="t-dim">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>
<span class="t-white">2026-10-24T06:25:57.447Z</span> | <span class="t-cyan">AUD-20261024-s42ygg</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Bagaimana status pasien <span class="t-yellow">[MASKED-RM]</span>?
  <span class="t-cyan">Status</span>   : <span class="t-yellow">BUKTI_BELUM_CUKUP</span>
  <span class="t-cyan">Decision</span> : <span class="t-yellow">no_evidence_or_denied</span>
  <span class="t-cyan">Sources</span>  : [] (0)
    </div>
    <div class="footerline">Metadata only &#8212; no answers, no snippets, no NIK, no RM number stored</div>
  </div>
</div>
${TOOLBAR}`,
  },
  {
    file: "shot-5-conflict-resolution.png",
    title: "Conflict resolution — temporal source selection",
    chatTitle: "SAKSI — Conflict resolution",
    html: `
<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Jam berapa poli buka?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div>Ditemukan dua sumber dengan informasi berbeda.</div>
    <div class="evlabel">Sumber lama</div>
    <div class="evcard" style="border-left-color:#d29922"><span class="evid" style="color:#d29922">DOC-001</span><span class="evtitle">poli pagi 08:00&#8211;14:00 WITA</span><span class="evdate">2024-06-01 &#183; outdated</span></div>
    <div class="evlabel">Sumber baru</div>
    <div class="evcard" style="border-left-color:#3fb950"><span class="evid" style="color:#3fb950">CHAT-001</span><span class="evtitle">jam buka poli pagi diubah dari 08:00 WITA menjadi 07:30 WITA</span><span class="evdate">2026-10-10 &#183; aktif</span></div>
    <div style="margin-top:12px">Saya memprioritaskan <b>CHAT-001</b> karena sumber terbaru dan <b>DOC-001</b> sudah superseded.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>
${TOOLBAR}`,
  },
];

// ---- Rendering ---------------------------------------------------------------

async function main() {
  const puppeteer = require("puppeteer-core");
  const template = fs.readFileSync(TEMPLATE, "utf8");

  const chromePath = path.join(
    __dirname,
    "..",
    "demo-video",
    "node_modules",
    ".remotion",
    "chrome-headless-shell",
    "win64",
    "chrome-headless-shell-win64",
    "chrome-headless-shell.exe"
  );

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });

  for (const conv of CONVERSATIONS) {
    const page = await browser.newPage();
    // Measure at a tall viewport so flex layout never compresses the content.
    await page.setViewport({ width: VIEW_W, height: 1800, deviceScaleFactor: 1 });
    await page.setContent(template, { waitUntil: "networkidle0" });

    // Populate the dynamic parts of the UI.
    await page.evaluate(
      (html, tasks, chatTitle) => {
        document.getElementById("chatinner").innerHTML = html;
        document.getElementById("chattitle").textContent = chatTitle;
        document.getElementById("sbtasks").innerHTML = tasks
          .map(
            (t) =>
              `<div class="sb-task${t.active ? " active" : ""}">` +
              `<span class="dot"></span>` +
              `<span class="nm">${t.name}</span>` +
              `<span class="dt">${t.date}</span>` +
              `</div>`
          )
          .join("");
      },
      conv.html,
      SIDE_TASKS,
      conv.chatTitle
    );

    await new Promise((r) => setTimeout(r, 300));

    // Measure the chat content so the window can be sized to fit it exactly.
    const metrics = await page.evaluate(() => {
      const inner = document.getElementById("chatinner");
      const chat = document.getElementById("chat");
      const composer = document.querySelector(".composer");
      const chatHead = document.querySelector(".chat-head");
      const chrome = document.querySelector(".window-chrome");

      const contentH = inner.getBoundingClientRect().height;
      const term = inner.querySelector(".terminal");
      const termH = term ? term.getBoundingClientRect().height : 0;

      return {
        contentH,
        termH,
        chatPadTop: parseFloat(getComputedStyle(chat).paddingTop),
        chatPadBottom: parseFloat(getComputedStyle(chat).paddingBottom),
        composerH: composer.getBoundingClientRect().height,
        chatHeadH: chatHead.getBoundingClientRect().height,
        chromeH: chrome.getBoundingClientRect().height,
      };
    });

    // Required window height = chrome + chat header + chat content + padding + composer
    const needed =
      metrics.chromeH +
      metrics.chatHeadH +
      metrics.contentH +
      metrics.chatPadTop +
      metrics.chatPadBottom +
      metrics.composerH;

    // Guarantee the terminal block itself is never clipped.
    const neededForTerminal =
      metrics.chromeH +
      metrics.chatHeadH +
      metrics.termH +
      metrics.chatPadTop +
      metrics.chatPadBottom +
      metrics.composerH +
      26; // bubble padding + footer line

    let finalHeight = Math.max(560, Math.min(1600, Math.ceil(Math.max(needed, neededForTerminal))));

    await page.setViewport({ width: VIEW_W, height: finalHeight, deviceScaleFactor: 1.5 });
    await new Promise((r) => setTimeout(r, 250));

    const outPath = path.join(OUT_DIR, conv.file);
    await page.screenshot({ path: outPath });
    console.log(`✓ ${conv.file}  (${VIEW_W}x${finalHeight}) — ${conv.title}`);
    await page.close();
  }

  await browser.close();
  console.log("\nAll screenshots generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
