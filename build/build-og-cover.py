"""
Builds public/og-cover.png (1200x630) from the real application screenshots.

The previous cover was a hand-written SVG that drew a fake app window. A link
preview is the one piece of this site that shows up on WhatsApp, Facebook and
Slack, so it should carry the same evidence as the rest of the page: actual
captures of Rokar POS, not an illustration of it.

Everything on the card is derived from files in the repo:
  * public/screens/*.webp  - the captures from pos-app/scripts/capture_screens.js
  * public/logo.png       - the real mark
  * src/styles.css        - the brand palette (COLOURS below mirrors --teal-*)

The screenshots are of a demo database, so the card says so. A share preview is
exactly the sort of surface where that is easy to leave out and easy to regret.

Usage:  python build/build-og-cover.py     (or: npm run og:cover)
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SCREENS = PUBLIC / "screens"

W, H = 1200, 630

# Mirrors src/styles.css. Kept literal rather than parsed so that a palette
# rename in one place cannot silently leave the social card behind.
TEAL_DEEP = (4, 28, 21)
TEAL = (8, 58, 45)
TEAL_RAISE = (14, 95, 73)
CREAM = (247, 243, 233)
CREAM_HI = (255, 255, 255)
GOLD = (245, 158, 11)

WIN_FONTS = Path("C:/Windows/Fonts")


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Load a face, falling back through a sensible chain.

    Windows is the only machine that renders this today, but the card has to
    survive a fresh clone elsewhere, so a missing face degrades to DejaVu
    (bundled with Pillow) instead of crashing the build.
    """
    chain = [WIN_FONTS / name, Path("/usr/share/fonts/truetype/dejavu") / name]
    chain += [
        Path("/usr/share/fonts/truetype/dejavu") / "DejaVuSerif.ttf",
        Path("/usr/share/fonts/truetype/dejavu") / "DejaVuSans.ttf",
    ]
    for path in chain:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    raise SystemExit("no usable TrueType face found")


def gradient() -> Image.Image:
    """Diagonal teal gradient, built small and scaled up so it stays smooth."""
    small = Image.new("RGB", (64, 64))
    px = small.load()
    for y in range(64):
        for x in range(64):
            t = (x / 63 * 0.55 + y / 63 * 0.45) ** 1.15
            px[x, y] = tuple(round(TEAL_DEEP[i] + (TEAL_RAISE[i] - TEAL_DEEP[i]) * t) for i in range(3))
    return small.resize((W, H), Image.LANCZOS)


def glow(base: Image.Image, cx: int, cy: int, r: int, colour, alpha: int) -> None:
    """Soft radial light. Drawn on its own layer and blurred, because a hard
    circle edge is what makes a synthetic background look synthetic."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.45))
    base.alpha_composite(layer)


def rounded(img: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def shot_card(name: str, width: int, angle: float) -> tuple[Image.Image, int, int]:
    """Load one capture into a rounded, shadowed, slightly rotated card.

    Returns the card plus how far the rotation grew it, so the caller can place
    the result by its visible centre rather than its pre-rotation origin.
    """
    src = SCREENS / name
    if not src.exists():
        raise SystemExit(f"missing {src} - run `npm run capture:screens` in pos-app first")

    shot = Image.open(src)
    shot = shot.convert("RGB").resize((width, round(width * shot.height / shot.width)), Image.LANCZOS)

    pad = 8  # the white "bezel" that makes it read as a window rather than a photo
    bezel = Image.new("RGB", (shot.width + pad * 2, shot.height + pad * 2), CREAM_HI)
    bezel.paste(shot, (pad, pad))
    card = rounded(bezel, 14)

    grew_w = card.width - card.width * abs(_cos(angle)) - card.height * abs(_sin(angle))
    grew_h = card.height - card.width * abs(_sin(angle)) - card.height * abs(_cos(angle))
    card = card.rotate(angle, resample=Image.BICUBIC, expand=True)

    shadow = Image.new("RGBA", (card.width + 80, card.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [40, 44, 40 + card.width, 44 + card.height], radius=16, fill=(0, 0, 0, 150)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    out = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    out.alpha_composite(shadow, (0, 0))
    out.alpha_composite(card, (40, 40))
    return out, round(grew_w / 2), round(grew_h / 2)


def _cos(deg: float) -> float:
    import math

    return math.cos(math.radians(deg))


def _sin(deg: float) -> float:
    import math

    return math.sin(math.radians(deg))


def build() -> Path:
    canvas = gradient().convert("RGBA")
    glow(canvas, 1090, 90, 300, GOLD, 26)
    glow(canvas, 120, 600, 260, GOLD, 16)

    draw = ImageDraw.Draw(canvas)

    # ---- wordmark row -------------------------------------------------
    logo = Image.open(PUBLIC / "logo.png").convert("RGBA").resize((62, 62), Image.LANCZOS)
    canvas.alpha_composite(logo, (70, 46))

    head = font("georgiab.ttf", 60)
    draw.text((152, 44), "Rokar POS", font=head, fill=CREAM_HI)

    sub = font("segoeui.ttf", 26)
    draw.text((153, 116), "Apni dukaan ka pura hisaab, ek screen par.", font=sub, fill=CREAM)

    # ---- download pill -------------------------------------------------
    pill_font = font("segoeuib.ttf", 25)
    label = "Download for Windows"
    tw = draw.textlength(label, font=pill_font)
    px1, py1, px2, py2 = 1200 - 70 - tw - 56, 52, 1200 - 70, 108
    draw.rounded_rectangle([px1, py1, px2, py2], radius=28, fill=GOLD)
    draw.text((px1 + 28, py1 + 11), label, font=pill_font, fill=TEAL_DEEP)

    # ---- honesty line --------------------------------------------------
    note = font("segoeui.ttf", 19)
    draw.text((152, 160), "Windows desktop app  \u00b7  Screenshots show sample data", font=note, fill=(222, 235, 228, 210))

    # ---- the real screens ----------------------------------------------
    back, gx, gy = shot_card("dashboard.webp", 604, -2.4)
    front, fx, fy = shot_card("billing.webp", 468, 2.0)
    canvas.alpha_composite(back, (150 - gx, 258 - gy))
    canvas.alpha_composite(front, (612 - fx, 288 - fy))

    out = PUBLIC / "og-cover.png"
    canvas.convert("RGB").save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    path = build()
    kb = path.stat().st_size / 1024
    print(f"wrote {path.relative_to(ROOT)} ({W}x{H}, {kb:.0f} KB)")
    # Social scrapers vary, but an oversized card is a card some of them drop.
    if kb > 500:
        print("WARNING: over 500 KB - some scrapers will refuse it", file=sys.stderr)