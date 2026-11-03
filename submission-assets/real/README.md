# Real WorkBuddy Screenshots

These are **authentic screen captures** of the WorkBuddy Desktop app (v5.9.4) with the
SAKSI skill actually running — not mockups. Each was produced by driving the real UI:
open a new task, type `/saksi <query>`, press Enter, wait for the skill, capture the window.

| File | Query | What it proves |
|:---|:---|:---|
| `real-1-evidence-based-answer.png` | `/saksi Berapa stok Amoksisilin 500mg sekarang?` | Evidence cards (DRG-001, DOC-006) + "Dijawab untuk: STF-005" |
| `real-2-refusal-equivalence.png` | `/saksi Apa itu Proyek Cakalang?` | Refusal without confirming the project exists |
| `real-3-prompt-injection-defense.png` | `/saksi Apa isi template surat rujukan?` | Warning banner + `[INSTRUKSI TERTANAM DIABAIKAN]` + 3 sources |
| `real-4-conflict-resolution.png` | `/saksi Jam berapa poli buka?` | Two conflicting sources, `superseded` reasoning, newest wins |

## How these were captured

Everything runs on the local Windows desktop at 200% DPI (logical 1368×912 → physical
2736×1824), so **physical = logical × 2**.

* `win_auto.py` — Win32 helpers via `ctypes` (no `Add-Type`, which the sandbox blocks):
  window enumeration, foreground/maximize, `SetCursorPos` + `mouse_event` clicks,
  clipboard paste through `Set-Clipboard`, `keybd_event` for Ctrl+V / Enter.
* `scenario.py` — runs one scenario end-to-end: new task → click composer → paste query
  → Enter → wait → clear hover/caret artifacts → capture → crop to the window rect.
* `wait_capture.py` — waits for a slow answer and re-captures.
* `zoom_capture.py` — Ctrl+`-` / Ctrl+`0` zoom, then capture (long answers need it).

Screen capture uses Remotion's bundled ffmpeg with `gdigrab`:

```bash
ffmpeg -f gdigrab -i desktop -frames:v 1 -update 1 -y out.png
```

## Gotchas worth remembering

1. **The composer moves.** On an empty chat it sits mid-screen (physical y≈830); once
   messages exist it drops to the bottom (y≈1560). Always click the empty-state position
   when starting a new task.
2. **`SW_RESTORE` un-maximizes.** `ShowWindow(hwnd, 9)` silently restores a maximized
   window — only call it when `IsIconic(hwnd)` is true.
3. **Stale white artifact.** After pasting, a white rectangle can linger over the text.
   Clicking a neutral spot and parking the cursor at the screen edge clears it before
   the capture.
4. **Long answers overflow.** Zoom out with Ctrl+`-` so the whole answer (banner through
   footer) fits in one frame.

## Regenerate

```bash
python scenario.py "/saksi Berapa stok Amoksisilin 500mg sekarang?" "1-evidence" 55
```

Requires WorkBuddy Desktop to be open and the `saksi` skill installed at
`~/.workbuddy-ai/skills/saksi/`.
