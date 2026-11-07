"""Wire a WorkBuddy expert launch link into the public site.

Reads the launch URL from the clipboard (or argv), validates that it is a
WorkBuddy launch link, and writes it into the expert card's data-launch
attribute so the CTA opens the real install card.

    python tools/wire_launch.py                # read from clipboard
    python tools/wire_launch.py "<url>"        # explicit
    python tools/wire_launch.py --check        # report current state
"""
import ctypes
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

INDEX = Path(__file__).resolve().parent.parent / "live-demo" / "index.html"

CF_UNICODETEXT = 13
GMEM_MOVEABLE = 0x0002

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# 64-bit safe signatures: a handle truncated to c_int reads garbage.
user32.OpenClipboard.argtypes = [ctypes.c_void_p]
user32.OpenClipboard.restype = ctypes.c_bool
user32.GetClipboardData.argtypes = [ctypes.c_uint]
user32.GetClipboardData.restype = ctypes.c_void_p
kernel32.GlobalLock.argtypes = [ctypes.c_void_p]
kernel32.GlobalLock.restype = ctypes.c_void_p
kernel32.GlobalUnlock.argtypes = [ctypes.c_void_p]


def clipboard_text() -> str:
    if not user32.OpenClipboard(None):
        return ""
    try:
        handle = user32.GetClipboardData(CF_UNICODETEXT)
        if not handle:
            return ""
        ptr = kernel32.GlobalLock(handle)
        if not ptr:
            return ""
        try:
            return ctypes.wstring_at(ptr)
        finally:
            kernel32.GlobalUnlock(handle)
    finally:
        user32.CloseClipboard()


def find_launch_url(text: str) -> str:
    """Pull a WorkBuddy launch URL out of arbitrary clipboard text."""
    for raw in re.findall(r"https?://[^\s<>\"')]+", text or ""):
        if "/work/launch" in raw:
            return raw.rstrip(".,;")
    return ""


def describe(url: str) -> str:
    q = parse_qs(urlparse(url).query)
    code = (q.get("sharecode") or [""])[0]
    name = (q.get("expertname") or [""])[0]
    host = urlparse(url).netloc
    return f"host={host} sharecode={code or '(none)'} expertname={name or '(none)'}"


def current() -> str:
    html = INDEX.read_text(encoding="utf-8")
    m = re.search(r'id="ec-cta"[^>]*data-launch="([^"]*)"', html)
    return m.group(1) if m else ""


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        cur = current()
        print(f"data-launch: {cur or '(empty — CTA shows the fallback text)'}")
        if cur:
            print(describe(cur))
        return 0

    url = sys.argv[1].strip() if len(sys.argv) > 1 else ""
    if not url:
        url = find_launch_url(clipboard_text())
        if not url:
            print("Tidak ada tautan peluncuran di clipboard.")
            print("Klik 'Bagikan' pada kartu SAKSI di My Experts, lalu jalankan lagi.")
            return 1

    if "/work/launch" not in url:
        print(f"Bukan tautan peluncuran WorkBuddy: {url}")
        return 1

    html = INDEX.read_text(encoding="utf-8")
    new_html, n = re.subn(
        r'(id="ec-cta"[^>]*data-launch=")[^"]*(")',
        lambda m: m.group(1) + url.replace('"', "&quot;") + m.group(2),
        html,
    )
    if n != 1:
        print(f"Gagal: pola data-launch ditemukan {n} kali (harus 1).")
        return 1

    INDEX.write_text(new_html, encoding="utf-8")
    print("Tautan terpasang.")
    print(" ", describe(url))
    print("  Tombol 'Tambahkan ke Ahli Saya' kini membuka kartu ahli di WorkBuddy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
