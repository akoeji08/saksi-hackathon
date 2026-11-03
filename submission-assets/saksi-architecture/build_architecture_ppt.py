#!/usr/bin/env python3
"""
Build the SAKSI Architecture Diagram PPTX.

Slides:
  1. Cover
  2. System Overview — 3 layers, 4 trust boundaries
  3. Engine Pipeline — 10-stage deterministic flow
  4. Trust Boundaries detail — B1..B4
  5. Data Flow — normal vs refusal vs conflict vs injection
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(OUT_DIR, "SAKSI-Architecture-Diagram.pptx")

# ---- Palette (matches the video / cover) -------------------------------------
BG = RGBColor(0x05, 0x0B, 0x14)
PANEL = RGBColor(0x0D, 0x16, 0x26)
PANEL_ALT = RGBColor(0x10, 0x1C, 0x30)
ACCENT = RGBColor(0x00, 0xD4, 0xFF)
ACCENT_DIM = RGBColor(0x00, 0x90, 0xCC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x8B, 0x94, 0x9E)
GRAY_DIM = RGBColor(0x5A, 0x63, 0x6E)
RED = RGBColor(0xF8, 0x51, 0x49)
GREEN = RGBColor(0x3F, 0xB9, 0x50)
YELLOW = RGBColor(0xD2, 0x99, 0x22)
PURPLE = RGBColor(0xA3, 0x71, 0xF7)
BORDER = RGBColor(0x1E, 0x30, 0x48)

FONT = "Segoe UI"
MONO = "Consolas"

SW, SH = Inches(13.333), Inches(7.5)


def add_bg(slide):
    bg = slide.background
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG


def rect(slide, x, y, w, h, fill=None, line=None, line_w=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, adj=None):
    sp = slide.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(line_w)
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE and adj is not None:
        try:
            sp.adjustments[0] = adj
        except Exception:
            pass
    sp.shadow.inherit = False
    return sp


def txt(slide, x, y, w, h, text, size=14, color=WHITE, bold=False, align=PP_ALIGN.LEFT,
        font=FONT, anchor=MSO_ANCHOR.TOP, spacing=None, italic=False):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = 0
    lines = text.split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.alignment = align
        if spacing:
            p.space_after = Pt(spacing)
        for run in p.runs:
            run.font.size = Pt(size)
            run.font.color.rgb = color
            run.font.bold = bold
            run.font.italic = italic
            run.font.name = font
    return tb


def arrow_down(slide, cx, y, h, color=ACCENT_DIM, label=None):
    """Downward arrow centred at cx."""
    sp = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, cx - Inches(0.11), y, Inches(0.22), h)
    sp.fill.solid()
    sp.fill.fore_color.rgb = color
    sp.line.fill.background()
    sp.shadow.inherit = False
    if label:
        txt(slide, cx - Inches(1.4), y + h + Inches(0.03), Inches(2.8), Inches(0.3),
            label, size=9, color=GRAY, align=PP_ALIGN.CENTER)
    return sp


def arrow_right(slide, x, cy, w, color=ACCENT_DIM, label=None):
    sp = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x, cy - Inches(0.11), w, Inches(0.22))
    sp.fill.solid()
    sp.fill.fore_color.rgb = color
    sp.line.fill.background()
    sp.shadow.inherit = False
    if label:
        txt(slide, x, cy - Inches(0.42), w, Inches(0.28), label, size=9,
            color=GRAY, align=PP_ALIGN.CENTER)
    return sp


def slide_header(slide, num, title, subtitle=None):
    """Consistent header: number chip + title + subtitle."""
    chip = rect(slide, Inches(0.55), Inches(0.42), Inches(0.62), Inches(0.44),
                fill=ACCENT, adj=0.22)
    tf = chip.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = num
    p.alignment = PP_ALIGN.CENTER
    for r in p.runs:
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = BG
        r.font.name = FONT

    txt(slide, Inches(1.32), Inches(0.40), Inches(9.5), Inches(0.4), title,
        size=24, color=WHITE, bold=True)
    if subtitle:
        txt(slide, Inches(1.34), Inches(0.82), Inches(10.6), Inches(0.32), subtitle,
            size=12.5, color=GRAY)


def footer(slide, page):
    txt(slide, Inches(0.55), Inches(7.02), Inches(7.0), Inches(0.3),
        "SAKSI — Evidence-to-Decision Engine  ·  Tencent Cloud Hackathon Indonesia 2026",
        size=9, color=GRAY_DIM)
    txt(slide, Inches(12.1), Inches(7.02), Inches(0.7), Inches(0.3), str(page),
        size=9, color=GRAY_DIM, align=PP_ALIGN.RIGHT)


# =============================================================================
prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
blank = prs.slide_layouts[6]

# ---------------------------------------------------------------- Slide 1: Cover
s = prs.slides.add_slide(blank)
add_bg(s)

rect(s, Inches(0), Inches(0), SW, Inches(0.09), fill=ACCENT, shape=MSO_SHAPE.RECTANGLE)

txt(s, Inches(1.0), Inches(1.55), Inches(11.3), Inches(1.1), "SAKSI",
    size=72, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
txt(s, Inches(1.0), Inches(2.62), Inches(11.3), Inches(0.5), "Evidence-to-Decision Engine",
    size=26, color=ACCENT, bold=True, align=PP_ALIGN.CENTER)
txt(s, Inches(1.0), Inches(3.25), Inches(11.3), Inches(0.4),
    "Workplace Brain untuk Puskesmas Tamalanrea Jaya",
    size=15, color=GRAY, align=PP_ALIGN.CENTER)

# Five rules strip
rules = [
    ("S", "Sumber", "Evidence card\nper jawaban"),
    ("A", "Akses", "Deny-by-default\nsebelum retrieval"),
    ("K", "Konfirmasi", "Read-only,\nno silent action"),
    ("S", "Sadar Batas", "Refusal\nequivalence"),
    ("I", "Integritas", "Audit metadata-only,\nPII masked"),
]
bx = Inches(0.85)
bw = Inches(2.2)
gap = Inches(0.28)
for i, (letter, word, desc) in enumerate(rules):
    x = bx + i * (bw + gap)
    card = rect(s, x, Inches(4.05), bw, Inches(1.62), fill=PANEL, line=BORDER, line_w=1.0, adj=0.12)
    chip = rect(s, x + Inches(0.82), Inches(4.22), Inches(0.56), Inches(0.56),
                fill=None, line=ACCENT, line_w=1.5, adj=0.18)
    tf = chip.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = letter
    p.alignment = PP_ALIGN.CENTER
    for r in p.runs:
        r.font.size = Pt(24)
        r.font.bold = True
        r.font.color.rgb = ACCENT
        r.font.name = FONT
    txt(s, x, Inches(4.88), bw, Inches(0.28), word, size=13, color=WHITE,
        bold=True, align=PP_ALIGN.CENTER)
    txt(s, x, Inches(5.18), bw, Inches(0.45), desc, size=10, color=GRAY,
        align=PP_ALIGN.CENTER)

txt(s, Inches(1.0), Inches(6.15), Inches(11.3), Inches(0.3),
    "Tencent Cloud AI CAN DO IT Hackathon Indonesia 2026  ·  Challenge A: The Workplace Brain",
    size=12, color=GRAY_DIM, align=PP_ALIGN.CENTER)
txt(s, Inches(1.0), Inches(6.5), Inches(11.3), Inches(0.3),
    "Anshar Priwarsani  ·  akoeji08  ·  github.com/akoeji08/saksi-hackathon",
    size=11, color=GRAY_DIM, align=PP_ALIGN.CENTER)

# ------------------------------------------------- Slide 2: System Overview
s = prs.slides.add_slide(blank)
add_bg(s)
slide_header(s, "01", "Arsitektur Sistem — 3 Lapis, 4 Trust Boundaries",
             "Izin dievaluasi sebelum retrieval. Dokumen terlarang tidak pernah masuk konteks LLM.")

LX = Inches(0.62)
LW = Inches(8.5)
layers = [
    ("USER INTERFACE LAYER", "WorkBuddy Desktop",
     "Input:  /saksi <query>\nOutput: jawaban + evidence cards + \"Dijawab untuk: STF-XXX\"",
     ACCENT, Inches(1.35)),
    ("SKILL LAYER", "~/.workbuddy-ai/skills/saksi/",
     "SKILL.md (triggers + instruksi)  ·  scripts/ask.mjs (wrapper)  ·  current-user.json (identitas)",
     ACCENT_DIM, Inches(2.85)),
    ("ENGINE LAYER", "engine/ask.mjs  (Node.js)",
     "User Resolver → Permission Gate → Retrieval → Scoring → Quality Gate → Conflict → Injection → PII → Answer → Audit",
     PURPLE, Inches(4.35)),
]
for title, subtitle, body, color, y in layers:
    h = Inches(1.2)
    panel = rect(s, LX, y, LW, h, fill=PANEL, line=color, line_w=1.5, adj=0.06)
    rect(s, LX, y, Inches(0.09), h, fill=color, shape=MSO_SHAPE.RECTANGLE)
    txt(s, LX + Inches(0.28), y + Inches(0.10), LW - Inches(0.5), Inches(0.22),
        title, size=9.5, color=color, bold=True)
    txt(s, LX + Inches(0.28), y + Inches(0.32), LW - Inches(0.5), Inches(0.28),
        subtitle, size=15, color=WHITE, bold=True)
    txt(s, LX + Inches(0.28), y + Inches(0.64), LW - Inches(0.5), Inches(0.48),
        body, size=11, color=GRAY)

# Trust boundaries between layers
b_labels = [
    ("B1", "LLM → Skill", "Skill dipanggil by NAMA,\nbukan keputusan LLM", 2.62),
    ("B2", "Identity → Engine", "BRAIN_USER dari file,\nbukan dari prompt", 4.12),
]
for code, name, desc, y in b_labels:
    bx_ = LX + Inches(1.5)
    txt(s, bx_, Inches(y), Inches(6.4), Inches(0.22), f"{code} — {name}",
        size=10, color=YELLOW, bold=True)
    txt(s, bx_ + Inches(0.62), Inches(y), Inches(5.9), Inches(0.22), desc.replace("\n", "  ·  "),
        size=9.5, color=GRAY_DIM)

arrow_down(s, LX + Inches(0.45), Inches(2.55), Inches(0.3))
arrow_down(s, LX + Inches(0.45), Inches(4.05), Inches(0.3))

# B3 — the key one, highlighted
b3y = Inches(5.62)
panel = rect(s, LX, b3y, LW, Inches(0.78), fill=RGBColor(0x2A, 0x14, 0x0F),
             line=RED, line_w=2.0, adj=0.1)
txt(s, LX + Inches(0.28), b3y + Inches(0.09), LW - Inches(0.5), Inches(0.24),
    "B3 — DATA → LLM CONTEXT  (the critical boundary)", size=10, color=RED, bold=True)
txt(s, LX + Inches(0.28), b3y + Inches(0.36), LW - Inches(0.5), Inches(0.32),
    "canAccess() dipanggil SEBELUM retrieval. Dokumen terlarang tidak pernah masuk ke candidates[] — bukan hanya disembunyikan di UI.",
    size=11, color=WHITE)
arrow_down(s, LX + Inches(0.45), Inches(5.32), Inches(0.3))

# Right column — data layer + boundary table
RX = Inches(9.35)
RW = Inches(3.4)

panel = rect(s, RX, Inches(1.35), RW, Inches(1.62), fill=PANEL_ALT, line=BORDER, adj=0.08)
txt(s, RX + Inches(0.22), Inches(1.46), RW - Inches(0.4), Inches(0.24),
    "DATA + AUDIT LAYER", size=9.5, color=ACCENT, bold=True)
data_rows = [
    ("data/staff.json", "22"),
    ("data/permissions.json", "5"),
    ("data/documents.json", "20"),
    ("data/chats.json", "22"),
    ("data/drugs.json", "15"),
    ("audit.jsonl", "meta only"),
]
for i, (f, n) in enumerate(data_rows):
    yy = Inches(1.74) + i * Inches(0.19)
    txt(s, RX + Inches(0.22), yy, Inches(2.3), Inches(0.2), f, size=9.5, color=GRAY, font=MONO)
    txt(s, RX + Inches(2.5), yy, Inches(0.7), Inches(0.2), n, size=9.5, color=WHITE,
        align=PP_ALIGN.RIGHT, font=MONO)

panel = rect(s, RX, Inches(3.14), RW, Inches(1.5), fill=PANEL_ALT, line=BORDER, adj=0.08)
txt(s, RX + Inches(0.22), Inches(3.25), RW - Inches(0.4), Inches(0.24),
    "TRUST BOUNDARIES", size=9.5, color=YELLOW, bold=True)
bounds = [
    ("B1", "Skill by name", GREEN),
    ("B2", "Identity from file", GREEN),
    ("B3", "Filter pre-retrieval", RED),
    ("B4", "Audit metadata-only", GREEN),
]
for i, (code, desc, c) in enumerate(bounds):
    yy = Inches(3.54) + i * Inches(0.25)
    txt(s, RX + Inches(0.22), yy, Inches(0.45), Inches(0.2), code, size=10, color=c, bold=True)
    txt(s, RX + Inches(0.68), yy, Inches(2.4), Inches(0.2), desc, size=10, color=GRAY)

panel = rect(s, RX, Inches(4.81), RW, Inches(1.59), fill=RGBColor(0x0E, 0x22, 0x1A),
             line=GREEN, line_w=1.2, adj=0.08)
txt(s, RX + Inches(0.22), Inches(4.92), RW - Inches(0.4), Inches(0.24),
    "CRITICAL FAILURE CHECK", size=9.5, color=GREEN, bold=True)
checks = [
    "0 kebocoran data terbatas",
    "0 eksekusi tanpa approval",
    "0 klaim terlarang",
    "13 / 13 test lulus",
]
for i, c in enumerate(checks):
    yy = Inches(5.22) + i * Inches(0.26)
    txt(s, RX + Inches(0.22), yy, Inches(0.3), Inches(0.2), "✓", size=11, color=GREEN, bold=True)
    txt(s, RX + Inches(0.52), yy, Inches(2.6), Inches(0.2), c, size=10.5, color=WHITE)

footer(s, 2)

# ------------------------------------------------ Slide 3: Engine Pipeline
s = prs.slides.add_slide(blank)
add_bg(s)
slide_header(s, "02", "Engine Pipeline — 10 Tahap Deterministik",
             "Setiap tahap output bisa diaudit. Tidak ada keputusan LLM di dalam engine.")

stages = [
    ("1", "User Resolver", "staff.json lookup", ACCENT),
    ("2", "Permission Gate", "deny-by-default ACL", RED),
    ("3", "Retrieval", "ACL-filtered only", RED),
    ("4", "Scoring v2", "critical + prefix", ACCENT),
    ("5", "Quality Gate", "min score threshold", ACCENT),
    ("6", "Conflict Detector", "supersession + outdated", YELLOW),
    ("7", "Injection Sanitizer", "10 regex patterns", YELLOW),
    ("8", "PII Masking", "NIK / HP / BPJS / RM", PURPLE),
    ("9", "Answer Composer", "relevance-based excerpt", ACCENT),
    ("10", "Audit Writer", "audit.jsonl", GREEN),
]

# 2 rows of 5
for i, (num, name, desc, color) in enumerate(stages):
    row = i // 5
    col = i % 5
    x = Inches(0.62) + col * Inches(2.42)
    y = Inches(1.62) + row * Inches(1.72)
    w, h = Inches(2.2), Inches(1.32)

    card = rect(s, x, y, w, h, fill=PANEL, line=color, line_w=1.4, adj=0.09)
    chip = rect(s, x + Inches(0.16), y + Inches(0.14), Inches(0.4), Inches(0.4),
                fill=color, adj=0.3)
    tf = chip.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = num
    p.alignment = PP_ALIGN.CENTER
    for r in p.runs:
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = BG
        r.font.name = FONT

    txt(s, x + Inches(0.16), y + Inches(0.62), w - Inches(0.32), Inches(0.26),
        name, size=12, color=WHITE, bold=True)
    txt(s, x + Inches(0.16), y + Inches(0.92), w - Inches(0.32), Inches(0.32),
        desc, size=9.5, color=GRAY)

    if col < 4:
        arrow_right(s, x + w + Inches(0.02), y + h / 2, Inches(0.18))

# Row-2 wrap arrow
arrow_down(s, Inches(0.62) + 4 * Inches(2.42) + Inches(1.1), Inches(2.94), Inches(0.36), color=ACCENT_DIM)

# Gate annotations
panel = rect(s, Inches(0.62), Inches(5.22), Inches(5.85), Inches(1.5),
             fill=RGBColor(0x2A, 0x14, 0x0F), line=RED, line_w=1.2, adj=0.07)
txt(s, Inches(0.86), Inches(5.34), Inches(5.4), Inches(0.24),
    "PERMISSION-FIRST  (tahap 2–3)", size=10, color=RED, bold=True)
txt(s, Inches(0.86), Inches(5.62), Inches(5.4), Inches(1.0),
    "Izin dievaluasi SEBELUM retrieval. Dokumen yang tidak lolos tidak pernah masuk ke "
    "candidates[], sehingga tidak pernah masuk konteks LLM.\n\n"
    "Konsekuensi: \"jangan bocorkan\" di prompt adalah mitigasi kosmetik. "
    "SAKSI mencegah kebocoran secara struktural.",
    size=11, color=WHITE)

panel = rect(s, Inches(6.75), Inches(5.22), Inches(5.95), Inches(1.5),
             fill=PANEL_ALT, line=BORDER, adj=0.07)
txt(s, Inches(6.99), Inches(5.34), Inches(5.5), Inches(0.24),
    "AUDIT TRAIL  (tahap 10)", size=10, color=GREEN, bold=True)
txt(s, Inches(6.99), Inches(5.62), Inches(5.5), Inches(1.0),
    "Setiap query tercatat: user, query dengan PII disamarkan, status keputusan, "
    "sumber yang dipakai, jumlah injeksi yang dicegat.\n\n"
    "Yang TIDAK disimpan: jawaban lengkap, snippet, NIK, nomor RM. "
    "Audit tidak boleh menjadi backdoor.",
    size=11, color=GRAY)

footer(s, 3)

# --------------------------------------------- Slide 4: Trust Boundaries detail
s = prs.slides.add_slide(blank)
add_bg(s)
slide_header(s, "03", "Trust Boundaries — Mengapa Masing-masing Perlu Ada",
             "Setiap boundary menjawab satu pertanyaan: apa yang akan bocor kalau ini gagal?")

brows = [
    ("B1", "LLM → Skill", GREEN,
     "Skill dipanggil berdasarkan NAMA (/saksi), bukan keputusan bebas LLM.",
     "LLM bisa memilih menjawab sendiri jika merasa \"sudah tahu\", melewati engine entirely.",
     "Engine tidak dijalankan, tidak ada permission check sama sekali."),
    ("B2", "Identity File → Engine", GREEN,
     "Wrapper baca current-user.json → set BRAIN_USER env var. Engine menolak argumen --user dari prompt.",
     "Mencegah prompt privilege escalation — user tidak bisa mengaku sebagai STF-001.",
     "User bisa akses data kapan saja hanya dengan mengubah prompt."),
    ("B3", "Data → LLM Context", RED,
     "canAccess() dipanggil SEBELUM retrieval. Dokumen yang tidak lolos tidak masuk candidates[].",
     "Jika dokumen terlarang masuk konteks LLM, larangan di prompt hanya kosmetik.",
     "Data HIV/TB bocor ke perawat umum — pelanggaran UU PDP."),
    ("B4", "Engine → Audit", GREEN,
     "Audit mencatat query_masked + sources_ids. Konten sensitif TIDAK disimpan di log.",
     "Audit log sering jadi tempat penumpukan data — perlu design metadata-only.",
     "Log audit menjadi backdoor yang membocorkan data yang justru dilindungi."),
]

y = Inches(1.5)
for code, name, color, mech, why, risk in brows:
    h = Inches(1.24)
    card = rect(s, Inches(0.62), y, Inches(12.1), h, fill=PANEL, line=color, line_w=1.3, adj=0.07)
    rect(s, Inches(0.62), y, Inches(0.09), h, fill=color, shape=MSO_SHAPE.RECTANGLE)

    chip = rect(s, Inches(0.92), y + Inches(0.32), Inches(0.56), Inches(0.56),
                fill=color, adj=0.24)
    tf = chip.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = code
    p.alignment = PP_ALIGN.CENTER
    for r in p.runs:
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = BG
        r.font.name = FONT

    txt(s, Inches(1.66), y + Inches(0.15), Inches(2.5), Inches(0.28),
        name, size=14, color=WHITE, bold=True)
    txt(s, Inches(1.66), y + Inches(0.48), Inches(2.5), Inches(0.6),
        "MEKANISME", size=8.5, color=ACCENT, bold=True)
    txt(s, Inches(1.66), y + Inches(0.68), Inches(2.6), Inches(0.5),
        "", size=9)

    txt(s, Inches(4.3), y + Inches(0.14), Inches(4.1), Inches(0.26),
        "MENGAPA", size=8.5, color=YELLOW, bold=True)
    txt(s, Inches(4.3), y + Inches(0.36), Inches(4.1), Inches(0.8),
        why, size=10.5, color=GRAY)

    txt(s, Inches(8.6), y + Inches(0.14), Inches(3.9), Inches(0.26),
        "RISIKO JIKA GAGAL", size=8.5, color=RED, bold=True)
    txt(s, Inches(8.6), y + Inches(0.36), Inches(3.9), Inches(0.8),
        risk, size=10.5, color=WHITE)

    y += h + Inches(0.13)

footer(s, 4)

# ---------------------------------------------------- Slide 5: Data Flow
s = prs.slides.add_slide(blank)
add_bg(s)
slide_header(s, "04", "Empat Alur Data — Bukti Perilaku Engine",
             "Setiap alur menghasilkan output yang bisa diverifikasi secara deterministik.")

flows = [
    ("NORMAL", "Jawaban Berbukti", GREEN,
     "/saksi Berapa stok Amoksisilin 500mg?",
     ["Resolve STF-005 → perawat", "Retrieval lolos ACL", "Top score 5 ≥ min 3",
      "Tulis audit: allow"],
     "→ 40 tablet (kritis) + 3 evidence cards + \"Dijawab untuk: STF-005\""),
    ("REFUSAL", "Unauthorized Access", YELLOW,
     "/saksi Apa itu Proyek Cakalang?",
     ["Resolve STF-005", "canAccess() tolak semua kandidat Cakalang", "candidates = []",
      "Tulis audit: no_evidence_or_denied"],
     "→ \"Saya tidak menemukan informasi yang dapat saya akses.\" (tidak menyebut Cakalang)"),
    ("KONFLIK", "Temporal Source Conflict", YELLOW,
     "/saksi Jam berapa poli buka?",
     ["Retrieve DOC-001 + CHAT-001", "Conflict: superseded_by=CHAT-001",
      "Bandingkan timestamp + status", "Tulis audit: conflict_type=SUPERSESSION"],
     "→ Sumber lama vs sumber baru, pilih terbaru dengan alasan eksplisit"),
    ("INJEKSI", "Prompt Injection Defense", RED,
     "/saksi Apa isi template surat rujukan?",
     ["Retrieve DOC-007 (berisi injeksi)", "Sanitizer: 10 regex patterns",
      "Ganti instruksi → [INSTRUKSI TERTANAM DIABAIKAN]", "Tulis audit: injections_blocked=1"],
     "→ Warning banner + konten tersanitasi. Email tujuan TIDAK lolos. 0 data bocor."),
]

y = Inches(1.42)
for tag, name, color, query, steps, result in flows:
    h = Inches(1.28)
    card = rect(s, Inches(0.62), y, Inches(12.1), h, fill=PANEL, line=color, line_w=1.2, adj=0.07)
    rect(s, Inches(0.62), y, Inches(0.09), h, fill=color, shape=MSO_SHAPE.RECTANGLE)

    chip = rect(s, Inches(0.9), y + Inches(0.16), Inches(1.02), Inches(0.3),
                fill=color, adj=0.4)
    tf = chip.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = tag
    p.alignment = PP_ALIGN.CENTER
    for r in p.runs:
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = BG
        r.font.name = FONT

    txt(s, Inches(0.9), y + Inches(0.52), Inches(2.0), Inches(0.24),
        name, size=12, color=WHITE, bold=True)
    txt(s, Inches(0.9), y + Inches(0.78), Inches(2.1), Inches(0.42),
        query, size=8.5, color=ACCENT, font=MONO)

    for i, st in enumerate(steps):
        yy = y + Inches(0.18) + i * Inches(0.26)
        txt(s, Inches(3.15), yy, Inches(0.2), Inches(0.2), "·", size=11, color=color, bold=True)
        txt(s, Inches(3.32), yy, Inches(4.05), Inches(0.24), st, size=10, color=GRAY)

    txt(s, Inches(7.55), y + Inches(0.18), Inches(4.9), Inches(0.24),
        "OUTPUT", size=8.5, color=color, bold=True)
    txt(s, Inches(7.55), y + Inches(0.44), Inches(4.9), Inches(0.76),
        result, size=10.5, color=WHITE)

    y += h + Inches(0.11)

footer(s, 5)

prs.save(OUT_PATH)
print(f"✓ Saved: {OUT_PATH}")
print(f"  Slides: {len(prs.slides.__iter__.__self__._sldIdLst)}")
print(f"  Size: {os.path.getsize(OUT_PATH):,} bytes")
