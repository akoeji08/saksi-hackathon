// Validate the browser port against the expected SAKSI behaviour.
// Runs the ported engine headlessly over the real datasets.
import fs from "fs";
import path from "path";

const dir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const code =
  fs.readFileSync(path.join(dir, "data.js"), "utf8") +
  "\n" +
  fs.readFileSync(path.join(dir, "engine.js"), "utf8");

const win = {};
new Function("window", code)(win);
const { ask } = win.SAKSI_ENGINE;
const data = win.SAKSI_DATA;

const CASES = [
  ["STF-005", "Berapa stok Amoksisilin 500mg sekarang?"],
  ["STF-005", "Apa itu Proyek Cakalang?"],
  ["STF-001", "Apa itu Proyek Cakalang?"],
  ["STF-005", "Apa isi template surat rujukan?"],
  ["STF-005", "Jam berapa poli buka?"],
  ["STF-005", "Berapa sisa cuti tahunan saya?"],
  ["STF-005", "Apa status pasien HIV terbaru?"],
  ["STF-003", "Apa status pasien HIV terbaru?"],
  ["STF-001", "Berapa anggaran Proyek Bahari?"],
  ["STF-015", "Berapa anggaran Proyek Bahari?"],
];

let pass = 0, fail = 0;
for (const [user, q] of CASES) {
  const r = ask(q, user, data);
  const srcIds = r.sources.map((s) => s.id).join(", ") || "—";
  console.log(`\n${"=".repeat(78)}`);
  console.log(`USER ${user}  |  ${q}`);
  console.log(`STATUS   : ${r.status}`);
  console.log(`GATE     : ${r.gate.blockedTotal} diblokir / ${r.gate.scanned} dipindai  →  ${r.gate.allowed} kandidat`);
  console.log(`SOURCES  : ${srcIds}`);
  if (r.warnings.length) console.log(`WARNINGS : ${r.warnings.join(", ")}`);
  const ans = r.answer.replace(/\n/g, " ").slice(0, 240);
  console.log(`ANSWER   : ${ans}${r.answer.length > 240 ? "…" : ""}`);

  // Sanity assertions
  const problems = [];
  if (!["TERVERIFIKASI", "BUKTI_BELUM_CUKUP", "KONFLIK"].includes(r.status)) problems.push("bad status");
  if (r.status === "TERVERIFIKASI" && r.sources.length === 0) problems.push("verified without sources");
  if (r.status === "BUKTI_BELUM_CUKUP" && r.sources.length > 0) problems.push("refusal with sources");

  if (problems.length) { fail++; console.log(`  ✗ ${problems.join(", ")}`); }
  else pass++;
}
console.log(`\n${"=".repeat(78)}\n${pass} passed, ${fail} failed`);
