// Wrapper skill SAKSI — memanggil engine dengan identitas user aktif.
//
// Paket ini mandiri: engine dan dataset ikut di dalam folder skill, dan semua
// path diturunkan dari lokasi file ini. Tidak ada path absolut mesin pengembang,
// jadi folder ini bisa dipindah, di-zip, atau dipasang di komputer lain dan
// tetap berjalan tanpa instalasi tambahan.

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(HERE, '..');

const CONFIG_PATH = path.join(SKILL_ROOT, 'current-user.json');
const ENGINE_PATH = path.join(SKILL_ROOT, 'engine', 'ask.mjs');

// === Identitas: dari berkas, bukan dari prompt (batas B2) ===
let currentUser = 'STF-005';
try {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  if (cfg.user_id) currentUser = cfg.user_id;
} catch {
  // Berkas belum ada → pakai default. Tetap bukan dari teks pertanyaan.
}

// === Parse query ===
const args = process.argv.slice(2);
const qIdx = args.indexOf('--query');
const query = qIdx !== -1 ? args[qIdx + 1] : '';

function fail(answer, warning) {
  console.log(JSON.stringify({
    status: 'ERROR',
    answer,
    sources: [],
    warnings: [warning],
  }));
  process.exit(0);
}

if (!query.trim()) {
  fail('Tidak ada pertanyaan yang diberikan.', 'EMPTY_QUERY');
}

if (!fs.existsSync(ENGINE_PATH)) {
  fail(
    `Engine SAKSI tidak ditemukan di paket skill (${ENGINE_PATH}). Pasang ulang paket skill.`,
    'ENGINE_MISSING'
  );
}

// === Jalankan engine ===
// execFileSync + array argumen: pertanyaan tidak pernah melewati shell, jadi
// tanda kutip, backtick, atau $(...) di dalam pertanyaan tidak bisa dieksekusi.
let result;
try {
  result = execFileSync(process.execPath, [ENGINE_PATH, '--query', query], {
    encoding: 'utf-8',
    env: { ...process.env, BRAIN_USER: currentUser },
    maxBuffer: 8 * 1024 * 1024,
  });
} catch (error) {
  fail(`Engine SAKSI gagal dijalankan: ${error.message}`, 'ENGINE_EXEC_FAILED');
}

// === Validasi keluaran ===
let parsed;
try {
  parsed = JSON.parse(result);
} catch {
  fail(
    `Engine mengembalikan output tidak valid: ${String(result).slice(0, 100)}`,
    'INVALID_ENGINE_OUTPUT'
  );
}

// Jawaban non-error wajib membawa identitas penanya (batas B2 dapat diaudit).
if (parsed.status !== 'ERROR' && (!parsed._meta || !parsed._meta.user)) {
  fail('Engine tidak mengembalikan identitas pengguna. Bug kritis.', 'MISSING_USER_META');
}

console.log(result);
