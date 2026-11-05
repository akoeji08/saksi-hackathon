// set-user.mjs — alat operator untuk menetapkan identitas pemanggil.
//
// Ini SENGAJA bukan sesuatu yang dipanggil model dari dalam percakapan.
// Identitas harus datang dari berkas di sisi mesin, bukan dari kalimat pengguna
// (batas B2). Model hanya boleh memberi tahu perintah ini kepada manusia.
//
//   node scripts/set-user.mjs              # tampilkan daftar identitas
//   node scripts/set-user.mjs STF-001      # tetapkan identitas

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(HERE, '..');
const CONFIG = path.join(SKILL_ROOT, 'current-user.json');
const STAFF = path.join(SKILL_ROOT, 'data', 'staff.json');

let staff = [];
try {
  staff = JSON.parse(fs.readFileSync(STAFF, 'utf-8'));
} catch {
  console.error('Tidak bisa membaca data/staff.json. Paket skill tidak lengkap.');
  process.exit(1);
}

function current() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG, 'utf-8')).user_id || null;
  } catch {
    return null;
  }
}

const target = process.argv[2];
const now = current();

if (!target) {
  console.log('Identitas SAKSI\n');
  for (const s of staff) {
    const mark = s.id === now ? '→' : ' ';
    console.log(
      `${mark} ${s.id}  ${String(s.role).padEnd(24)} ${s.clearance.padEnd(20)} ${s.name}`
    );
  }
  console.log(`\nAktif: ${now || '(belum diset, engine memakai STF-005)'}`);
  console.log('Ganti: node scripts/set-user.mjs <ID>');
  process.exit(0);
}

const found = staff.find((s) => s.id === target);
if (!found) {
  console.error(`ID "${target}" tidak ada di data/staff.json.`);
  console.error('Jalankan tanpa argumen untuk melihat daftar identitas.');
  process.exit(1);
}

fs.writeFileSync(CONFIG, JSON.stringify({ user_id: found.id }, null, 2) + '\n', 'utf-8');
console.log(`Identitas diset: ${found.id} — ${found.name} (${found.role}, ${found.clearance})`);
