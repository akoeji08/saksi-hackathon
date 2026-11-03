"""Run one real SAKSI scenario in WorkBuddy and capture a clean screenshot.

Usage: python scenario.py "<query>" <out-name> [wait-seconds]

Flow: force window geometry -> new task -> click input -> paste -> Enter
      -> wait for the skill -> clear hover/caret artifacts -> capture -> crop
"""
import sys, time, ctypes, ctypes.wintypes as wt
sys.path.insert(0, r"C:/saksi-hackathon/submission-assets/real")
from win_auto import (find_window, set_foreground, click_phys, set_clipboard,
                      capture, key, tap, VK_CONTROL, VK_V, VK_RETURN, user32)
from PIL import Image

OUT_DIR = r"C:/saksi-hackathon/submission-assets/real"

# Known-good maximized geometry (logical). Forced every run so the click
# coordinates and the crop box stay identical between scenarios.
GEO = (-7, 42, 1381, 877)

# Click targets in PHYSICAL pixels, valid for GEO above.
XY_NEW_TASK = (150, 325)

# The composer sits mid-screen while the chat is EMPTY (welcome screen) and
# drops to the bottom once messages exist. We always start from a new chat,
# so the empty-state position is the one that matters.
XY_INPUT_EMPTY = (1500, 830)

SCALE = 2.0


def force_geometry(hwnd):
    SWP_NOZORDER = 0x0004
    SWP_SHOWWINDOW = 0x0040
    x, y, w, h = GEO
    user32.SetWindowPos(hwnd, 0, x, y, w, h, SWP_NOZORDER | SWP_SHOWWINDOW)
    time.sleep(1.0)


def run(query, out_name, wait_s=55):
    hwnd, title, _ = find_window("WorkBuddy AI")
    set_foreground(hwnd)
    force_geometry(hwnd)

    # 1. New task
    click_phys(*XY_NEW_TASK)
    time.sleep(2.5)

    # 2. Focus input and paste
    click_phys(*XY_INPUT_EMPTY)
    time.sleep(0.7)
    set_clipboard(query)
    key(VK_CONTROL); tap(VK_V); key(VK_CONTROL, up=True)
    time.sleep(1.0)

    # Verify the text actually landed before sending.
    typed = f"{OUT_DIR}/_typed-{out_name}.png"
    capture(typed)

    # 3. Send
    tap(VK_RETURN)
    print(f"sent: {query!r}  (waiting {wait_s}s)")
    time.sleep(wait_s)

    # 4. Clear hover/caret artifacts, park the pointer off-content
    user32.SetCursorPos(1360, 8)
    time.sleep(0.4)
    click_phys(1400, 1150)      # empty area in the chat pane
    time.sleep(0.3)
    user32.SetCursorPos(1360, 8)
    time.sleep(1.6)

    # 5. Capture + crop to the window
    raw = f"{OUT_DIR}/_raw-{out_name}.png"
    capture(raw)

    r = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(r))
    box = (max(0, int(r.left * SCALE)), max(0, int(r.top * SCALE)),
           int(r.right * SCALE), int(r.bottom * SCALE))

    final = f"{OUT_DIR}/real-{out_name}.png"
    Image.open(raw).crop(box).save(final)
    print(f"saved {final}  box={box}")
    return final


if __name__ == "__main__":
    q = sys.argv[1]
    name = sys.argv[2]
    wait = int(sys.argv[3]) if len(sys.argv) > 3 else 55
    run(q, name, wait)
