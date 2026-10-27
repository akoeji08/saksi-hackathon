// Wrapper: memanggil engine SAKSI dengan identitas user aktif.
// Path: C:\Users\ansha\.workbuddy-ai\skills\saksi\scripts\ask.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// === Baca user aktif dari current-user.json ===
const CONFIG_PATH = path.join(
  process.env.USERPROFILE || 'C:\\Users\\ansha',
  '.workbuddy-ai', 'skills', 'saksi', 'current-user.json'
);

let currentUser = 'STF-005';  // fallback default
try {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  if (cfg.user_id) currentUser = cfg.user_id;
} catch (e) {
  // File tidak ada atau invalid → pakai default STF-005
}

// === Parse query ===
const args = process.argv.slice(2);
const qIdx = args.indexOf('--query');
const query = qIdx !== -1 ? args[qIdx + 1] : '';

// === Panggil engine dengan env BRAIN_USER ===
try {
  const result = execSync(
    `node "C:\\Users\\ansha\\Documents\\saksi-engine\\brain\\scripts\\ask.mjs" --query "${query.replace(/"/g, '\\"')}"`,
    {
      encoding: 'utf-8',
      env: { ...process.env, BRAIN_USER: currentUser }
    }
  );

  // Verifikasi output adalah JSON valid
  let parsed;
  try {
    parsed = JSON.parse(result);
  } catch (e) {
    console.log(JSON.stringify({
      status: 'ERROR',
      answer: `Engine mengembalikan output tidak valid: ${result.substring(0, 100)}`,
      sources: [],
      warnings: ['INVALID_ENGINE_OUTPUT']
    }));
    process.exit(0);
  }

  // Jika bukan ERROR, wajib ada _meta.user
  if (parsed.status !== 'ERROR' && (!parsed._meta || !parsed._meta.user)) {
    console.log(JSON.stringify({
      status: 'ERROR',
      answer: 'Engine tidak mengembalikan identitas pengguna. Bug kritis.',
      sources: [],
      warnings: ['MISSING_USER_META']
    }));
    process.exit(0);
  }

  console.log(result);
} catch (error) {
  console.log(JSON.stringify({
    status: 'ERROR',
    answer: `Engine SAKSI gagal dijalankan: ${error.message}`,
    sources: [],
    warnings: ['ENGINE_EXEC_FAILED']
  }));
}