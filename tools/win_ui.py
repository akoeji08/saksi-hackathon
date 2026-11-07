"""Minimal Win32 mouse/keyboard helper for driving the WorkBuddy UI.

Used only for the publish flow: it clicks real buttons in the desktop app.
Every call is explicit — no loops, no guessing.
"""
import ctypes
import ctypes.wintypes
import sys
import time

user32 = ctypes.windll.user32

# Match physical pixels so screenshot coordinates equal cursor coordinates.
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PER_MONITOR_AWARE
except Exception:
    user32.SetProcessDPIAware()

SW_MAXIMIZE = 3
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0010


def find_window(title_part: str):
    """Return the first top-level window whose title contains title_part."""
    result = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def _enum(hwnd, _lparam):
        length = user32.GetWindowTextLengthW(hwnd)
        if length:
            buf = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buf, length + 1)
            if title_part.lower() in buf.value.lower():
                result.append((hwnd, buf.value))
        return True

    user32.EnumWindows(_enum, 0)
    return result


def focus(title_part: str = "WorkBuddy AI") -> int:
    """Raise the window without touching its size or position."""
    wins = find_window(title_part)
    if not wins:
        raise SystemExit(f"no window matching {title_part!r}")
    hwnd = wins[0][0]
    user32.SetForegroundWindow(hwnd)
    time.sleep(0.4)
    return hwnd


def maximize(title_part: str = "WorkBuddy AI") -> int:
    wins = find_window(title_part)
    if not wins:
        raise SystemExit(f"no window matching {title_part!r}")
    hwnd = wins[0][0]
    user32.ShowWindow(hwnd, SW_MAXIMIZE)
    user32.SetForegroundWindow(hwnd)
    time.sleep(0.6)
    return hwnd


def window_rect(title_part: str = "WorkBuddy AI"):
    hwnd = focus(title_part)
    rect = ctypes.wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    return hwnd, (rect.left, rect.top, rect.right, rect.bottom)


def click(x: int, y: int) -> None:
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.12)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.06)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    time.sleep(0.35)


def right_click(x: int, y: int) -> None:
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.2)
    user32.mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
    time.sleep(0.08)
    user32.mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
    time.sleep(0.5)


def move(x: int, y: int) -> None:
    user32.SetCursorPos(int(x), int(y))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "focus":
        print("hwnd", focus(sys.argv[2] if len(sys.argv) > 2 else "WorkBuddy AI"))
    elif cmd == "maximize":
        print("maximized hwnd", maximize())
    elif cmd == "rect":
        hwnd, r = window_rect()
        print(f"hwnd={hwnd} rect={r} size={r[2]-r[0]}x{r[3]-r[1]}")
    elif cmd == "click":
        focus()
        click(int(sys.argv[2]), int(sys.argv[3]))
        print("clicked", sys.argv[2], sys.argv[3])
    elif cmd == "rclick":
        focus()
        right_click(int(sys.argv[2]), int(sys.argv[3]))
        print("right-clicked", sys.argv[2], sys.argv[3])
    elif cmd == "move":
        move(int(sys.argv[2]), int(sys.argv[3]))
        print("moved")
    elif cmd == "list":
        for hwnd, title in find_window(""):
            if title.strip():
                print(hwnd, "|", title[:70])
