#!/usr/bin/env python3
"""Susun paket skill SAKSI yang mandiri.

Folder `skill/` adalah satu-satunya artefak distribusi: ia harus bisa dipindah
ke komputer lain dan langsung berjalan tanpa clone repo. Supaya itu benar,
engine dan dataset ikut disalin ke dalamnya.

Sumber kebenaran tetap di root repo (`engine/`, `data/`). Skrip ini yang
menyalin, jadi jangan mengedit `skill/engine` atau `skill/data` secara manual.

Pemakaian:
    python tools/build_skill.py            # salin ulang
    python tools/build_skill.py --check    # gagal (exit 1) kalau tidak sinkron
"""

import filecmp
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "skill"

ENGINE_SRC = ROOT / "engine" / "ask.mjs"
ENGINE_DST = SKILL / "engine" / "ask.mjs"
DATA_SRC = ROOT / "data"
DATA_DST = SKILL / "data"

DATA_FILES = ["staff.json", "permissions.json", "documents.json", "chats.json", "drugs.json"]


def plan():
    """Daftar (sumber, tujuan) yang harus identik."""
    pairs = [(ENGINE_SRC, ENGINE_DST)]
    for name in DATA_FILES:
        pairs.append((DATA_SRC / name, DATA_DST / name))
    return pairs


def check() -> int:
    problems = []
    for src, dst in plan():
        if not src.exists():
            problems.append(f"  sumber hilang: {src.relative_to(ROOT)}")
        elif not dst.exists():
            problems.append(f"  belum disalin: {dst.relative_to(ROOT)}")
        elif not filecmp.cmp(src, dst, shallow=False):
            problems.append(f"  tidak sinkron: {dst.relative_to(ROOT)}")
    if problems:
        print("Paket skill TIDAK sinkron dengan sumber:")
        print("\n".join(problems))
        print("\nJalankan: python tools/build_skill.py")
        return 1
    print(f"Paket skill sinkron ({len(plan())} berkas).")
    return 0


def sanitize() -> None:
    """Buang state runtime supaya paket yang dibagikan bersih.

    - `audit.jsonl` adalah jejak audit milik mesin yang menjalankan; engine
      membuatnya sendiri lewat appendFileSync, jadi tidak perlu ikut dikirim.
    - `current-user.json` direset ke persona demo awal (STF-005) agar penerima
      paket tidak mewarisi identitas pengujian orang lain.
    """
    audit = SKILL / "audit.jsonl"
    if audit.exists():
        audit.unlink()

    current = SKILL / "current-user.json"
    current.write_text('{\n  "user_id": "STF-005"\n}\n', encoding="utf-8")


def build() -> int:
    ENGINE_DST.parent.mkdir(parents=True, exist_ok=True)
    DATA_DST.mkdir(parents=True, exist_ok=True)

    for src, dst in plan():
        if not src.exists():
            print(f"ERROR: sumber tidak ada: {src}")
            return 1
        shutil.copy2(src, dst)

    sanitize()

    total = sum(p.stat().st_size for p in SKILL.rglob("*") if p.is_file())
    print(f"Paket skill disusun di {SKILL.relative_to(ROOT)}/  ({total / 1024:.1f} KB)")
    for src, dst in plan():
        print(f"  {dst.relative_to(SKILL)}")
    return 0


if __name__ == "__main__":
    sys.exit(check() if "--check" in sys.argv else build())
