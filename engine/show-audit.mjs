// show-audit.mjs — Viewer untuk audit ledger
// Path: C:\Users\ansha\Documents\saksi-engine\brain\scripts\show-audit.mjs
// Pemakaian:
//   node show-audit.mjs              → 20 entri terakhir
//   node show-audit.mjs --user STF-005
//   node show-audit.mjs --status BUKTI_BELUM_CUKUP
//   node show-audit.mjs --all

import fs from 'fs';

const AUDIT_PATH = 'C:\\Users\\ansha\\Documents\\saksi-engine\\audit.jsonl';
const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const filterUser = getArg('--user');
const filterStatus = getArg('--status');
const showAll = args.includes('--all');

if (!fs.existsSync(AUDIT_PATH)) {
  console.log('Audit log belum ada. Jalankan minimal satu query dulu.');
  process.exit(0);
}

const lines = fs.readFileSync(AUDIT_PATH, 'utf-8').trim().split('\n').filter(Boolean);
let entries = lines.map(l => JSON.parse(l));

if (filterUser) entries = entries.filter(e => e.user === filterUser);
if (filterStatus) entries = entries.filter(e => e.status === filterStatus);
if (!showAll) entries = entries.slice(-20);

console.log(`Total entri: ${entries.length}\n`);
console.log('─'.repeat(100));

for (const e of entries) {
  console.log(`${e.ts} | ${e.audit_id}`);
  console.log(`  User     : ${e.user}`);
  console.log(`  Query    : ${e.query_masked}`);
  console.log(`  Status   : ${e.status}`);
  console.log(`  Decision : ${e.policy_decision}`);
  console.log(`  Sources  : [${(e.sources_ids || []).join(', ')}] (${e.sources_count})`);
  if (e.injections_blocked > 0) console.log(`  ⚠ Inject : ${e.injections_blocked} blocked`);
  if (e.conflict_type) console.log(`  ⚡ Conflict: ${e.conflict_type}`);
  console.log('─'.repeat(100));
}