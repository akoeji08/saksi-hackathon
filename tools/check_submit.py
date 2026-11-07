#!/usr/bin/env python3
"""Verify every absolute path referenced by SUBMIT.md actually exists."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
md = (ROOT / "SUBMIT.md").read_text(encoding="utf-8")

paths = sorted(set(re.findall(r"C:\\saksi-hackathon\\[^\s`*)]+", md)))
print(f"{len(paths)} path absolut dirujuk SUBMIT.md:\n")

ok = 0
for raw in paths:
    q = Path(raw)
    rel = raw.replace("C:\\saksi-hackathon\\", "")
    if q.exists():
        kb = q.stat().st_size / 1024
        print(f"  OK    {rel:<62} {kb:>9,.0f} KB")
        ok += 1
    else:
        print(f"  MISS  {rel}")

print(f"\n{ok}/{len(paths)} ada")

# Also verify the repo-relative references used in the appendix.
rel_refs = ["skill/scripts/ask.mjs", "skill/scripts/set-user.mjs", "tools/build_skill.py",
            "docs/demo-script.md", "docs/architecture.md", "submission-assets/project-description.md"]
print("\nReferensi relatif:")
for r in rel_refs:
    print(f"  {'OK  ' if (ROOT / r).exists() else 'MISS'}  {r}")
