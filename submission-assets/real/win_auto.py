"""Win32 helpers via ctypes (no external deps).

Screen is 200% DPI: physical = logical * 2.
SetCursorPos expects LOGICAL coords for a DPI-unaware process.
"""
import ctypes
import ctypes.wintypes as wt
import subprocess
import time

user32 = ctypes.windll.user32

# ---- DPI awareness: keep process DPI-unaware so logical coords match ----
SCALE = 2.0  # physical / logical


def list_windows():
    """Return list of (hwnd, title, rect, visible) for top-level windows."""
    results = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)
    def cb(hwnd, lparam):
        if not user32.IsWindowVisible(hwnd):
            return True
        length = user32.GetWindowTextLengthW(hwnd)
        if length == 0:
            return True
        buf = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buf, length + 1)
        title = buf.value
        rect = wt.RECT()
        user32.GetWindowRect(hwnd, ctypes.byref(rect))
        results.append((hwnd, title, (rect.left, rect.top, rect.right, rect.bottom)))
        return True

    user32.EnumWindows(cb, 0)
    return results


def find_window(keyword):
    for hwnd, title, rect in list_windows():
        if keyword.lower() in title.lower():
            return hwnd, title, rect
    return None


def set_foreground(hwnd):
    """Bring window to front WITHOUT un-maximizing it.

    SW_RESTORE (9) would undo a maximized window, so only restore when the
    window is actually minimized (IsIconic).
    """
    if user32.IsIconic(hwnd):
        user32.ShowWindow(hwnd, 9)  # SW_RESTORE only if minimized
    user32.SetForegroundWindow(hwnd)
    time.sleep(0.4)


def maximize(hwnd):
    user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
    time.sleep(0.9)


def click_phys(px, py):
    """Click at PHYSICAL pixel coords (as seen in ffmpeg gdigrab capture)."""
    lx, ly = int(px / SCALE), int(py / SCALE)
    user32.SetCursorPos(lx, ly)
    time.sleep(0.15)
    user32.mouse_event(0x0002, 0, 0, 0, 0)  # left down
    time.sleep(0.06)
    user32.mouse_event(0x0004, 0, 0, 0, 0)  # left up
    time.sleep(0.35)


def set_clipboard(text):
    # PowerShell Set-Clipboard avoids Add-Type
    p = subprocess.run(
        ["powershell", "-NoProfile", "-Command", "Set-Clipboard -Value $env:CLIPTEXT"],
        capture_output=True,
        text=True,
        env={**__import__("os").environ, "CLIPTEXT": text},
    )
    if p.returncode != 0:
        raise RuntimeError(f"Set-Clipboard failed: {p.stderr}")
    time.sleep(0.2)


VK_CONTROL = 0x11
VK_V = 0x56
VK_RETURN = 0x0D


def key(vk, up=False):
    user32.keybd_event(vk, 0, 0x0002 if up else 0, 0)


def tap(vk):
    key(vk)
    time.sleep(0.04)
    key(vk, up=True)
    time.sleep(0.08)


def paste_and_enter(text):
    set_clipboard(text)
    key(VK_CONTROL)
    tap(VK_V)
    key(VK_CONTROL, up=True)
    time.sleep(0.5)
    tap(VK_RETURN)
    time.sleep(0.5)


def capture(out_path):
    """Capture full desktop via ffmpeg gdigrab."""
    ff = r"C:/saksi-hackathon/demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
    subprocess.run(
        [ff, "-hide_banner", "-loglevel", "error",
         "-f", "gdigrab", "-i", "desktop",
         "-frames:v", "1", "-update", "1", "-y", out_path],
        capture_output=True,
    )
    return out_path


if __name__ == "__main__":
    print("=== visible windows ===")
    for hwnd, title, rect in list_windows():
        w = rect[2] - rect[0]
        h = rect[3] - rect[1]
        if w > 300 and h > 300:
            print(f"hwnd={hwnd:<10} {w}x{h} at ({rect[0]},{rect[1]})  {title[:80]!r}")
