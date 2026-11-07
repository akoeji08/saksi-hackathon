"""Drive one UI step and capture the result in a single process.

Kept in one process so the cursor cannot drift between moving and clicking,
and so DPI awareness is guaranteed before any coordinate call.

    python tools/ui_step.py <mode> <x> <y> <shotname>

modes: move, click, rclick, dblclick
"""
import ctypes
import ctypes.wintypes
import subprocess
import sys
import time

user32 = ctypes.windll.user32
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    user32.SetProcessDPIAware()

FF = "demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"


def find_workbuddy():
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def _enum(h, _l):
        n = user32.GetWindowTextLengthW(h)
        if n:
            b = ctypes.create_unicode_buffer(n + 1)
            user32.GetWindowTextW(h, b, n + 1)
            if "WorkBuddy AI" in b.value and user32.IsWindowVisible(h):
                found.append(h)
        return True

    user32.EnumWindows(_enum, 0)
    return found[0] if found else None


def shot(name):
    subprocess.run(
        [FF, "-v", "error", "-y", "-f", "gdigrab", "-framerate", "1",
         "-i", "desktop", "-vframes", "1", f"_ui_{name}.png"],
        check=True,
    )


def main():
    mode, x, y, name = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]

    hwnd = find_workbuddy()
    if hwnd:
        user32.SetForegroundWindow(hwnd)
        time.sleep(0.5)

    user32.SetCursorPos(x, y)
    time.sleep(1.0)  # let hover styles settle

    p = ctypes.wintypes.POINT()
    user32.GetCursorPos(ctypes.byref(p))
    print(f"cursor at ({p.x},{p.y}) — requested ({x},{y})")

    if mode in ("click", "dblclick"):
        for _ in range(2 if mode == "dblclick" else 1):
            user32.mouse_event(0x0002, 0, 0, 0, 0)
            time.sleep(0.07)
            user32.mouse_event(0x0004, 0, 0, 0, 0)
            time.sleep(0.06)
    elif mode == "rclick":
        user32.mouse_event(0x0008, 0, 0, 0, 0)
        time.sleep(0.09)
        user32.mouse_event(0x0010, 0, 0, 0, 0)

    time.sleep(1.0)
    user32.GetCursorPos(ctypes.byref(p))
    print(f"cursor after ({p.x},{p.y})")
    shot(name)
    print(f"shot -> _ui_{name}.png")


if __name__ == "__main__":
    main()
