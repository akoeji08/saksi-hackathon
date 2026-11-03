/**
 * Generate WorkBuddy chat screenshot images from HTML templates.
 * Uses Remotion's bundled headless Chrome via puppeteer-core (installed on demand).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT_DIR = __dirname;
const TEMPLATE = path.join(OUT_DIR, "chat-template.html");

// ---- Conversation definitions -------------------------------------------------

const CONVERSATIONS = [
  {
    file: "shot-1-evidence-based-answer.png",
    title: "Evidence-based answer",
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
    <div>• Amoksisilin 500mg: stok <b>40 tablet</b> (status: kritis)</div>
    <div>• Amoksisilin 250mg: stok 180 tablet (status: aman)</div>
    <div>• Daftar obat esensial puskesmas: Amoksisilin, Ampisilin, Parasetamol, ...</div>
    <div class="evlabel">Sumber</div>
    <div class="evcard"><span class="evid">DRG-001</span><span class="evtitle">Amoksisilin 500mg</span><span class="evdate">—</span></div>
    <div class="evcard"><span class="evid">DRG-002</span><span class="evtitle">Amoksisilin 250mg</span><span class="evdate">—</span></div>
    <div class="evcard"><span class="evid">DOC-006</span><span class="evtitle">Formularium Obat Puskesmas 2026</span><span class="evdate">2026-01-05</span></div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>`,
  },
  {
    file: "shot-2-refusal-equivalence.png",
    title: "Refusal equivalence — restricted vs non-existent",
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
    <div class="refusal">Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.<br>Silakan hubungi pemilik topik terkait.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>

<div class="divider">Refusal Equivalence — same response for a project that does not exist</div>

<div class="msg user">
  <div class="avatar user">NS</div>
  <div class="bubble">
    <span class="query-cmd">/saksi</span> Apa itu Proyek Naga?
  </div>
</div>
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble">
    <div class="refusal">Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.<br>Silakan hubungi pemilik topik terkait.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
    <div class="identical">✓ RESPONS IDENTIK KATA PER KATA</div>
  </div>
</div>`,
  },
  {
    file: "shot-3-prompt-injection-defense.png",
    title: "Prompt injection defense",
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
      <b>⚠️ PERHATIAN:</b> Satu atau lebih dokumen yang relevan mengandung instruksi
      tertanam yang mencoba mengalihkan AI untuk melakukan tindakan tidak sah
      (misalnya mengirim data ke pihak luar). Instruksi tersebut telah <b>DIABAIKAN</b>
      dan kontennya disanitasi.
    </div>
    <div>Surat rujukan wajib memuat:</div>
    <div>— Identitas pasien — nama, NIK, tanggal lahir, nomor RM</div>
    <div>— Diagnosis kerja</div>
    <div>— Riwayat singkat</div>
    <div>— Tindakan yang sudah diberikan</div>
    <div>— Tujuan rujukan</div>
    <div>— Tanda tangan dokter perujuk</div>
    <div style="margin-top:10px"><span class="blocked">[INSTRUKSI TERTANAM DIABAIKAN]</span></div>
    <div class="evlabel">Sumber</div>
    <div class="evcard"><span class="evid">DOC-007</span><span class="evtitle">Template Surat Rujukan Puskesmas ke RS</span><span class="evdate">2026-02-11</span></div>
    <div class="evcard"><span class="evid">DOC-002</span><span class="evtitle">SOP-YAN-014: Alur Pendaftaran Pasien</span><span class="evdate">2026-01-18</span></div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>
<div class="meta">
  <span class="k">Injeksi dicegat:</span> 1 &nbsp;·&nbsp; <span class="k">Email tujuan tidak lolos:</span> datapasien@medikacenter-x.co.id &nbsp;·&nbsp; <span class="k">Data bocor:</span> 0
</div>`,
  },
  {
    file: "shot-4-audit-ledger.png",
    title: "Audit ledger — metadata only, PII masked",
    html: `
<div class="msg ai">
  <div class="avatar ai">S</div>
  <div class="bubble" style="max-width:980px">
    <div class="terminal">
<span class="t-dim">$</span> <span class="t-white">node engine/show-audit.mjs --user STF-005</span>

<span class="t-cyan">Total entri: 4</span>

<span class="t-white">2026-10-24T06:22:23.031Z</span> | <span class="t-cyan">AUD-20261024-3su7ul</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Berapa stok Amoksisilin 500mg sekarang?
  <span class="t-cyan">Status</span>   : <span class="t-green">TERVERIFIKASI</span>
  <span class="t-cyan">Decision</span> : <span class="t-green">allow</span>
  <span class="t-cyan">Sources</span>  : [DRG-001, DRG-002, DOC-006] (3)
<span class="t-sep">────────────────────────────────────────</span>
<span class="t-white">2026-10-24T06:23:47.757Z</span> | <span class="t-cyan">AUD-20261024-r61yrd</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Apa itu Proyek Cakalang?
  <span class="t-cyan">Status</span>   : <span class="t-yellow">BUKTI_BELUM_CUKUP</span>
  <span class="t-cyan">Decision</span> : <span class="t-yellow">no_evidence_or_denied</span>
  <span class="t-cyan">Sources</span>  : [] (0)
<span class="t-sep">────────────────────────────────────────</span>
<span class="t-white">2026-10-24T06:24:53.094Z</span> | <span class="t-cyan">AUD-20261024-t2n4vd</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Apa isi template surat rujukan?
  <span class="t-cyan">Status</span>   : <span class="t-green">TERVERIFIKASI</span>
  <span class="t-cyan">Decision</span> : <span class="t-green">allow</span>
  <span class="t-cyan">Sources</span>  : [DOC-007, DOC-002, DOC-006] (3)
  <span class="t-cyan">Inject</span>   : <span class="t-red">1 blocked</span>
<span class="t-sep">────────────────────────────────────────</span>
<span class="t-white">2026-10-24T06:25:57.447Z</span> | <span class="t-cyan">AUD-20261024-s42ygg</span>
  <span class="t-cyan">User</span>     : STF-005
  <span class="t-cyan">Query</span>    : Bagaimana status pasien <span class="t-yellow">[MASKED-RM]</span>?
  <span class="t-cyan">Status</span>   : <span class="t-yellow">BUKTI_BELUM_CUKUP</span>
  <span class="t-cyan">Decision</span> : <span class="t-yellow">no_evidence_or_denied</span>
  <span class="t-cyan">Sources</span>  : [] (0)
    </div>
    <div class="footerline">Metadata only — no answers, no snippets, no NIK, no RM number stored</div>
  </div>
</div>`,
  },
  {
    file: "shot-5-conflict-resolution.png",
    title: "Conflict resolution — temporal source selection",
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
    <div class="evcard" style="border-left-color:#d29922"><span class="evid" style="color:#d29922">DOC-001</span><span class="evtitle">poli pagi 08:00–14:00 WITA</span><span class="evdate">2024-06-01 · outdated</span></div>
    <div class="evlabel">Sumber baru</div>
    <div class="evcard" style="border-left-color:#3fb950"><span class="evid" style="color:#3fb950">CHAT-001</span><span class="evtitle">jam buka poli pagi diubah dari 08:00 WITA menjadi 07:30 WITA</span><span class="evdate">2026-10-10 · aktif</span></div>
    <div style="margin-top:12px">Saya memprioritaskan <b>CHAT-001</b> karena sumber terbaru dan <b>DOC-001</b> sudah superseded.</div>
    <div class="footerline">Dijawab untuk: STF-005</div>
  </div>
</div>`,
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
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1.5 });
    await page.setContent(template, { waitUntil: "networkidle0" });
    await page.evaluate((html) => {
      document.getElementById("chat").innerHTML = html;
    }, conv.html);
    await new Promise((r) => setTimeout(r, 300));

    // Trim the canvas to fit content — avoids a large empty area at the bottom.
    const contentHeight = await page.evaluate(() => {
      const chat = document.getElementById("chat");
      const titlebar = document.querySelector(".titlebar");
      const last = chat.lastElementChild;
      // Use the full scrollHeight of the chat container so nested bubble
      // padding and footers are never clipped.
      const chatBottom = chat.getBoundingClientRect().top + chat.scrollHeight;
      const lastBottom = last ? last.getBoundingClientRect().bottom : 0;
      const bottom = Math.max(chatBottom, lastBottom);
      const top = chat.getBoundingClientRect().top;
      return Math.ceil(bottom - top + 30 + titlebar.getBoundingClientRect().height);
    });
    const finalHeight = Math.max(420, Math.min(1400, contentHeight));

    await page.setViewport({ width: 1400, height: finalHeight, deviceScaleFactor: 1.5 });
    await new Promise((r) => setTimeout(r, 200));

    const outPath = path.join(OUT_DIR, conv.file);
    await page.screenshot({ path: outPath });
    console.log(`✓ ${conv.file}  (${finalHeight}px tall) — ${conv.title}`);
    await page.close();
  }

  await browser.close();
  console.log("\nAll screenshots generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
