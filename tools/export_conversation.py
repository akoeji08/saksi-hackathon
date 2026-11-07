#!/usr/bin/env python3
"""Export a WorkBuddy conversation transcript to a readable Markdown timeline.

The raw session file is newline-delimited JSON with a lot of internal noise
(reasoning traces, file-history snapshots, provider metadata). This script keeps
only what a reviewer needs to follow the build: what the user asked, what the
assistant answered, and which tools were run.

Usage:
    python tools/export_conversation.py <session.jsonl> <out.md>
"""

import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

WIB = timezone(timedelta(hours=8))

# Internal blocks that should never reach a reviewer-facing document.
STRIP_BLOCKS = [
    re.compile(r"<system-reminder[\s\S]*?</system-reminder>", re.I),
    re.compile(r"<user_info>[\s\S]*?</user_info>", re.I),
    re.compile(r"<identity_context>[\s\S]*?</identity_context>", re.I),
    re.compile(r"<project_context>[\s\S]*?</project_context>", re.I),
    re.compile(r"<product_identity>[\s\S]*?</product_identity>", re.I),
    re.compile(r"<craft_mode>[\s\S]*?</craft_mode>", re.I),
    re.compile(r"<additional-data>[\s\S]*?</additional-data>", re.I),
    re.compile(r"<current_time>[\s\S]*?</current_time>", re.I),
    re.compile(r"<task-notification>[\s\S]*?</task-notification>", re.I),
    re.compile(r"<conversation_history_summary>[\s\S]*?</conversation_history_summary>", re.I),
]


def clean(text: str) -> str:
    for pat in STRIP_BLOCKS:
        text = pat.sub("", text)
    # Collapse runs of blank lines left behind by stripping.
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def text_of(content) -> str:
    """Flatten a content array into plain text, keeping only visible text parts."""
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    out = []
    for part in content:
        if not isinstance(part, dict):
            continue
        t = part.get("type")
        if t in ("input_text", "output_text", "text"):
            out.append(part.get("text") or "")
        elif t == "tool_use":
            name = part.get("name") or "tool"
            args = part.get("input") or {}
            out.append(f"`{name}` {short_args(args)}")
    return "\n\n".join(x for x in out if x)


def short_args(args: dict, limit: int = 160) -> str:
    if not isinstance(args, dict):
        return ""
    for key in ("command", "file_path", "pattern", "query", "path", "directory", "description"):
        if key in args and isinstance(args[key], str):
            v = args[key].replace("\n", " ")
            if len(v) > limit:
                v = v[:limit] + "…"
            return f"— {v}"
    return ""


def tool_line(obj) -> str:
    """Render one function_call as a compact bullet."""
    name = obj.get("name") or "tool"
    raw = obj.get("arguments")
    detail = ""
    if isinstance(raw, str) and raw.strip():
        try:
            detail = short_args(json.loads(raw))
        except (json.JSONDecodeError, TypeError):
            detail = ""
    if not detail:
        disp = (obj.get("providerData") or {}).get("argumentsDisplayText")
        if isinstance(disp, str) and disp.strip():
            d = disp.replace("\n", " ").strip()
            detail = "— " + (d[:160] + "…" if len(d) > 160 else d)
    return f"- `{name}` {detail}".rstrip()


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])

    entries = []
    with src.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            entries.append(obj)

    users = sum(1 for e in entries if e.get("type") == "message" and e.get("role") == "user")
    asst = sum(1 for e in entries if e.get("type") == "message" and e.get("role") == "assistant")
    calls = sum(1 for e in entries if e.get("type") == "function_call")

    stamps = [e["timestamp"] for e in entries if isinstance(e.get("timestamp"), (int, float))]
    first = datetime.fromtimestamp(min(stamps) / 1000, WIB) if stamps else None
    last = datetime.fromtimestamp(max(stamps) / 1000, WIB) if stamps else None

    lines = [
        "# WorkBuddy — Riwayat Percakapan Pengembangan SAKSI",
        "",
        "Transkrip ini diekspor dari sesi WorkBuddy yang dipakai untuk membangun SAKSI.",
        "Isi internal (reasoning model, snapshot berkas, metadata penyedia) dibuang; yang",
        "tersisa adalah apa yang diminta, apa yang dijawab, dan alat apa yang dijalankan.",
        "",
        "| | |",
        "|:---|:---|",
        f"| Sesi | `{src.stem}` |",
        f"| Mulai | {first.strftime('%d %B %Y, %H:%M WIB') if first else '—'} |",
        f"| Selesai | {last.strftime('%d %B %Y, %H:%M WIB') if last else '—'} |",
        f"| Pesan pengguna | {users} |",
        f"| Balasan asisten | {asst} |",
        f"| Pemanggilan alat | {calls} |",
        "",
        "---",
        "",
    ]

    prev_kind = None
    pending_tools = []

    def flush_tools():
        """Emit buffered tool calls as one compact block."""
        if not pending_tools:
            return
        lines.append("<sub>")
        lines.extend(pending_tools)
        lines.append("</sub>")
        lines.append("")
        pending_tools.clear()

    for obj in entries:
        kind = obj.get("type")

        if kind == "function_call":
            pending_tools.append(tool_line(obj))
            continue

        if kind != "message":
            continue

        role = obj.get("role")
        ts = obj.get("timestamp")
        when = ""
        if isinstance(ts, (int, float)):
            when = datetime.fromtimestamp(ts / 1000, WIB).strftime("%d %b %H:%M")

        body = clean(text_of(obj.get("content")))
        if not body:
            continue
        # Skip a user turn that is nothing but injected context.
        if role == "user" and len(body) < 3:
            continue

        if role == "user":
            flush_tools()
            if prev_kind != "user":
                lines.append("")
            lines.append(f"### 👤 Pengguna · {when}")
            lines.append("")
            lines.append(body)
            lines.append("")
            prev_kind = "user"
        elif role == "assistant":
            flush_tools()
            lines.append(f"**Asisten** · {when}")
            lines.append("")
            lines.append(body)
            lines.append("")
            prev_kind = "assistant"

    flush_tools()

    lines.append("---")
    lines.append("")
    lines.append("*Diekspor otomatis oleh `tools/export_conversation.py`.*")

    dst.write_text("\n".join(lines), encoding="utf-8")
    size_kb = dst.stat().st_size / 1024
    print(f"Wrote {dst}  ({size_kb:.0f} KB)")
    print(f"  {users} user · {asst} assistant · {calls} tool calls")
    return 0


if __name__ == "__main__":
    sys.exit(main())
