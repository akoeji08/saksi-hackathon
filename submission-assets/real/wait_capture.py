"""Wait for a pending answer, then capture + crop the WorkBuddy window."""
import sys, time, ctypes, ctypes.wintypes as wt
sys.path.insert(0, r"C:/saksi-hackathon/submission-assets/real")
from win_auto import find_window, set_foreground, click_phys, capture, user32
from PIL import Image

OUT = r"C:/saksi-hackathon/submission-assets/real"

name = sys.argv[1]
waits = [int(x) for x in (sys.argv[2:] or ["60"])]

hwnd, _, _ = find_window("WorkBuddy AI")
set_foreground(hwnd)

for i, w in enumerate(waits, 1):
    time.sleep(w)
    user32.SetCursorPos(1360, 8)
    time.sleep(0.6)
    raw = f"{OUT}/_raw-{name}-w{i}.png"
    capture(raw)
    print(f"poll {i} after {w}s -> {raw}")

# Final clean capture: click neutral, park pointer, capture, crop
click_phys(1400, 1150)
time.sleep(0.4)
user32.SetCursorPos(1360, 8)
time.sleep(1.4)

raw = f"{OUT}/_raw-{name}-final.png"
capture(raw)
r = wt.RECT()
user32.GetWindowRect(hwnd, ctypes.byref(r))
box = (max(0, int(r.left*2)), max(0, int(r.top*2)), int(r.right*2), int(r.bottom*2))
Image.open(raw).crop(box).save(f"{OUT}/real-{name}.png")
print("saved", f"{OUT}/real-{name}.png")
