"""Zoom the WorkBuddy chat out one step so a long answer fits, then capture."""
import sys, time, ctypes, ctypes.wintypes as wt
sys.path.insert(0, r"C:/saksi-hackathon/submission-assets/real")
from win_auto import find_window, set_foreground, click_phys, capture, key, tap, user32
from PIL import Image

OUT = r"C:/saksi-hackathon/submission-assets/real"
VK_CONTROL = 0x11
VK_OEM_MINUS = 0xBD

steps = int(sys.argv[1]) if len(sys.argv) > 1 else 1
name = sys.argv[2] if len(sys.argv) > 2 else "zoomed"

hwnd, title, _ = find_window("WorkBuddy AI")
set_foreground(hwnd)

# focus the chat pane first
click_phys(1400, 1150)
time.sleep(0.4)

for _ in range(steps):
    key(VK_CONTROL)
    tap(VK_OEM_MINUS)
    key(VK_CONTROL, up=True)
    time.sleep(0.7)

time.sleep(1.5)
user32.SetCursorPos(1360, 8)
time.sleep(0.8)

raw = f"{OUT}/_raw-{name}.png"
capture(raw)
r = wt.RECT()
user32.GetWindowRect(hwnd, ctypes.byref(r))
box = (max(0, int(r.left*2)), max(0, int(r.top*2)), int(r.right*2), int(r.bottom*2))
Image.open(raw).crop(box).save(f"{OUT}/real-{name}.png")
print("saved", f"{OUT}/real-{name}.png")
