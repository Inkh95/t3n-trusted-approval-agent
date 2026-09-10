from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "demo"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
BG = "#0b1628"
WHITE = "#ffffff"
MUTED = "#bdcbe1"
ACCENT = "#59e0c4"
PURPLE = "#9a7cff"

def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)

def wrap(draw, text, fnt, max_width):
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            current = trial
        else:
            lines.append(current); current = word
    if current: lines.append(current)
    return lines

def slide(number, title, body, accent=ACCENT, footer="T3N · Strands Agents SDK"):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((90, 80, 1830, 1000), 34, fill="#111f35", outline="#355078", width=3)
    d.text((145, 130), f"0{number}", font=font(34, True), fill=accent)
    d.text((145, 205), title, font=font(70, True), fill=WHITE)
    y = 345
    for line in wrap(d, body, font(40), 1570):
        d.text((145, y), line, font=font(40), fill=MUTED)
        y += 65
    d.rectangle((145, 890, 500, 898), fill=accent)
    d.text((145, 925), footer, font=font(27), fill="#8397b7")
    return im

slides = [
    slide(1, "Safe automation for paid work", "Paid tasks are fragmented. Blind automation can expose credentials, accept unclear terms, or spend money. T3N starts only work backed by verifiable evidence."),
    slide(2, "A guarded Strands agent", "Two typed tools evaluate and start tasks. The model can reason about a listing, but deterministic policy decides whether an action is allowed, reviewed, or denied.", PURPLE),
]

arch = Image.open(ROOT / "docs" / "t3n-architecture.png").convert("RGB")
canvas = Image.new("RGB", (W, H), BG)
arch.thumbnail((1760, 990))
canvas.paste(arch, ((W-arch.width)//2, (H-arch.height)//2))
slides.append(canvas)

demo_text = subprocess.check_output(["npm", "run", "demo:strands"], cwd=ROOT, text=True, stderr=subprocess.STDOUT)
safe = "SAFE TASK → CLAIMED\nPayout route: revolut_sepa\nPolicy: task.claim.standing-approval"
risky = "RISKY TASK → REVIEW_REQUIRED\nReward unconfirmed · KYC required\nNo external action executed"
slides.append(slide(4, "Working end-to-end demo", safe + "\n\n" + risky, ACCENT, "Verified locally · audit chain valid"))
slides.append(slide(5, "Professional reach, human authority", "T3N handles repetitive discovery and verification while stopping on ambiguity. It is auditable, zero-cost aware, and designed to fail closed.", PURPLE, "github.com/Inkh95/t3n-trusted-approval-agent"))

for i, im in enumerate(slides, 1):
    im.save(OUT / f"slide-{i}.png", optimize=True)

concat = OUT / "slides.txt"
durations = [14, 15, 20, 22, 18]
with concat.open("w") as f:
    for i, duration in enumerate(durations, 1):
        f.write(f"file 'slide-{i}.png'\n")
        f.write(f"duration {duration}\n")
    f.write("file 'slide-5.png'\n")

subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium",
    "-movflags", "+faststart", str(ROOT / "docs" / "t3n-demo.mp4")
], check=True)

print(demo_text)
print(ROOT / "docs" / "t3n-demo.mp4")
