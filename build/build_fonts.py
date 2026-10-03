"""
Builds public/fonts/*.woff2 - the self-hosted faces the site actually ships.

Why this exists
---------------
The site linked Google Fonts directly, which cost three things:

  * A third-party DNS lookup, TLS handshake and connection to two extra origins
    before a single word could be painted.
  * 1234 KB of woff2 across 15 faces, because Google serves one file per
    family x weight x unicode-range subset.
  * No control over what is in them.

The 15 faces are largely redundant. Every one of them is the *same variable
font* re-served per weight: Plus Jakarta Sans 400/500/600/700/800 are five
copies of a single file whose wght axis already spans 200-800, and Noto Nastaliq
Urdu is three copies of one file spanning 400-700. So instead of shipping five
copies of a variable font we ship the variable font.

Noto Nastaliq Urdu was the worst offender at 233 KB per weight for 1338 glyphs
of which this site uses 29. Subset to the characters actually on the page it
becomes a rounding error.

Self-hosting also drops the third-party origin entirely: one fewer DNS lookup,
one fewer TLS handshake, and no visitor IP or referrer leaking to Google.

Usage:  python build/build_fonts.py        (or: npm run fonts)
"""

import hashlib
import json
import pathlib
import re
import sys
import time
import unicodedata
import urllib.request

from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / ".gfonts-cache"          # upstream downloads, not committed
OUT = ROOT / "public" / "fonts"         # shipped subset, committed

GF_CSS = (
    "https://fonts.googleapis.com/css2?"
    "family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800"
    "&family=Plus+Jakarta+Sans:wght@400;500;600;700;800"
    "&family=Noto+Nastaliq+Urdu:wght@400;600;700"
    "&display=swap"
)
UA = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"}

# Which upstream face to use as the source for each family. They are all the
# same variable font, so any weight works - the subsetter keeps every weight.
SOURCES = {
    "Plus Jakarta Sans": ("PlusJakartaSans-400-latin.woff2", "latin"),
    "Fraunces": ("Fraunces-700-latin.woff2", "latin"),
    "Noto Nastaliq Urdu": ("NotoNastaliqUrdu-400-arabic.woff2", "arabic"),
}

# The weight range each family is actually instanced over. Anything the page
# asks for outside this gets the nearest available weight rather than a
# synthesised (falsely emboldened) one.
WEIGHT_RANGE = {
    "Plus Jakarta Sans": (400, 800),
    "Fraunces": (500, 800),
    "Noto Nastaliq Urdu": (400, 700),
}

# Fraunces' optical size axis costs almost exactly as much as the rest of the
# font put together: keeping opsz 9-144 doubles the file from 29 KB to 59 KB.
# The site's largest text is a 4rem h1, so pinning opsz to 60 matches the
# design's intended optical size for the headings that matter and costs nothing
# visible at h3 sizes. Set to None to keep the axis.
PIN_OPSZ = 60

# ---------------------------------------------------------------------------
# Character inventory
# ---------------------------------------------------------------------------

# The subset has to survive editing, because src/content.json is writable from
# the admin CMS at runtime. A glyph set frozen to today's copy would turn the
# first Urdu shop name an owner typed into a row of tofu boxes. So this is the
# union of what is on the page today plus everything a Pakistani shopkeeper
# would plausibly type into those fields.
LATIN_BASE = (
    " !" + '"' + "#$%&'()*+,-./0123456789:;<=>?@"
    + "ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`"
    + "abcdefghijklmnopqrstuvwxyz{|}~"
)
LATIN_EXTRA = (
    "\u00a0\u00a9\u00ae\u00b0\u00b1\u00b5\u00b7\u00d7\u00f7"
    "\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb"
    "\u00cc\u00cd\u00ce\u00cf\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d8"
    "\u00d9\u00da\u00db\u00dc\u00dd\u00de\u00df"
    "\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00e6\u00e7\u00e8\u00e9\u00ea\u00eb"
    "\u00ec\u00ed\u00ee\u00ef\u00f0\u00f1\u00f2\u00f3\u00f4\u00f5\u00f6\u00f8"
    "\u00f9\u00fa\u00fb\u00fc\u00fd\u00fe\u00ff"
)
PUNCT = (
    "\u2010\u2011\u2012\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e"
    "\u2026\u2039\u203a\u2032\u2033\u2020\u2021\u2022\u2023\u2027"
    "\u2032\u2033\u2044\u20ac\u20a9\u20ab\u20b9\u20ba\u20bc"
    "\u2190\u2191\u2192\u2193\u2194\u21d2\u21d4\u2205"
    "\u2212\u2215\u221a\u221e\u2248\u2260\u2264\u2265"
    "\u00b2\u00b3\u00bc\u00bd\u00be"
)
# Bidi controls and ZWNJ are not decoration here: Urdu is cursive, and dropping
# ZWNJ silently changes how words join rather than showing a missing glyph.
BIDI = "\u200c\u200d\u200e\u200f\u061c"
# Every Arabic codepoint the site's own copy uses, plus the ones an Urdu reader
# would notice missing: the extra letters Urdu proper adds, the Arabic
# punctuation marks, Urdu's full stop, and both digit sets.
URDU = (
    "\u0627\u0628\u067e\u062a\u0679\u062b\u062c\u0686\u062d\u062e\u062f\u0630"
    "\u0631\u0632\u0698\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063a\u0641"
    "\u0642\u0643\u06a9\u06af\u0644\u0645\u0646\u0648\u06c1\u06be\u06cc"
    "\u0688\u0686\u0691\u0698\u06d2\u0686\u06af\u06a9\u0648\u06d5"
    "\u0640\u060c\u061b\u061f\u06d4\u0660\u0661\u0662\u0663\u0664"
    "\u0665\u0666\u0667\u0668\u0669\u06f0\u06f1\u06f2\u06f3\u06f4\u06f5"
    "\u06f6\u06f7\u06f8\u06f9"
    "\u06d5\u06e5\u06e6"
)

EXTRA = (
    " \u00a0"
    "\u2018\u2019\u201c\u201d\u2013\u2014\u2026"
    "\u2713\u2714\u2717\u2718\u2605\u2606\u26a1\u2b50\u2192\u2190"
    "\u00a3\u20b9\u20ac\u00a5"
)


ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]")

# Categories a face genuinely has to cover. Letters, digits, marks and
# punctuation are the font's job. Symbols and emoji are not: the platform draws
# an arrow or a star or a receipt glyph from its own symbol font, and it always
# has, because no Google Fonts latin subset has ever contained them. Treating
# those as failures would mean failing the build for correct behaviour.
MUST_COVER = ("L", "N", "M", "P")


def must_cover(ch: str) -> bool:
    if unicodedata.category(ch) == "Cc":       # \n, \t - not glyphs
        return False
    return unicodedata.category(ch)[0] in MUST_COVER


def in_script(ch: str, kind: str) -> bool:
    """Is this character one that a `latin` or `arabic` face is meant to cover?"""
    if kind == "arabic":
        return bool(ARABIC_RE.match(ch)) or ch in BIDI
    return not ARABIC_RE.match(ch) and ch not in BIDI


def source_characters() -> set:
    """Every character that literally appears in the site's own source."""
    chars = set()
    roots = [ROOT / "src", ROOT / "index.html"]
    for base in roots:
        paths = [base] if base.is_file() else base.rglob("*")
        for p in paths:
            if p.suffix.lower() not in (".tsx", ".ts", ".json", ".css", ".html"):
                continue
            try:
                chars |= set(p.read_text(encoding="utf-8"))
            except UnicodeDecodeError:
                pass
    return chars


def inventory() -> set:
    chars = source_characters()
    chars |= set(LATIN_BASE) | set(LATIN_EXTRA) | set(PUNCT)
    chars |= set(BIDI) | set(URDU) | set(EXTRA)
    chars -= {chr(c) for c in range(0x00, 0x20)}   # C0 controls: not glyphs
    chars.discard("\u007f")
    return {c for c in chars if ord(c) >= 0x20}


# ---------------------------------------------------------------------------
# Download + subset
# ---------------------------------------------------------------------------


def fetch_sources() -> None:
    CACHE.mkdir(exist_ok=True)
    need = [n for n, _ in SOURCES.values() if not (CACHE / n).exists()]
    if not need:
        return

    css_path = CACHE / "gf.css"
    if not css_path.exists():
        for attempt in range(5):
            try:
                css_path.write_bytes(
                    urllib.request.urlopen(urllib.request.Request(GF_CSS, headers=UA), timeout=90).read()
                )
                break
            except Exception as e:
                print("  googleapis retry %d: %s" % (attempt + 1, e))
                time.sleep(3 + attempt * 3)
        else:
            raise SystemExit("could not reach fonts.googleapis.com")

    css = css_path.read_text(encoding="utf-8")
    faces = re.findall(r"(?s)/\*\s*([^*]*?)\s*\*/\s*@font-face\s*\{(.*?)\}", css)

    # Every face for one family+subset is the same variable file, so take the
    # first match rather than trying to match a particular weight.
    wanted = {}
    for family, (filename, needed_subset) in SOURCES.items():
        for label, body in faces:
            fam = (re.search(r"font-family:\s*'([^']+)'", body) or [None, None])[1]
            url = (re.search(r"url\((https:[^)]+)\)", body) or [None, None])[1]
            if fam != family or label.strip().split()[-1] != needed_subset or not url:
                continue
            wanted[filename] = url
            break

    for filename, url in wanted.items():
        for attempt in range(5):
            try:
                (CACHE / filename).write_bytes(
                    urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
                )
                print("  fetched %s" % filename)
                break
            except Exception as e:
                if attempt == 4:
                    raise SystemExit("could not download %s: %s" % (url, e))
                time.sleep(2 + attempt * 3)


def instance(font: TTFont, family: str) -> TTFont:
    """Narrow each axis to what the site actually renders at.

    Leaving Plus Jakarta Sans at wght 200-800 costs bytes for weights nothing on
    the page uses, and narrowing it too far makes a 500 request snap to 400
    instead of interpolating. Fraunces additionally loses its optical size axis
    when PIN_OPSZ is set - see the note there.
    """
    if "fvar" not in font:
        return font
    from fontTools.varLib import instancer

    keep = {"wght"}
    if family == "Fraunces" and not PIN_OPSZ:
        keep.add("opsz")

    limits = {}
    for axis in font["fvar"].axes:
        tag = axis.axisTag
        if tag not in keep:
            limits[tag] = axis.defaultValue if PIN_OPSZ is None else (
                PIN_OPSZ if tag == "opsz" and PIN_OPSZ else axis.defaultValue
            )
            continue
        lo, hi = WEIGHT_RANGE[family] if tag == "wght" else (axis.minValue, axis.maxValue)
        lo, hi = max(lo, axis.minValue), min(hi, axis.maxValue)
        limits[tag] = (lo, hi)

    try:
        return instancer.instantiateVariableFont(font, limits, inplace=False, updateFontNames=False)
    except Exception as e:
        print("  ! could not instance %s (%s) - shipping full axes" % (family, e))
        return font


def fallback_metrics(font: TTFont) -> dict:
    """Numbers for a metric-matched fallback @font-face.

    With font-display:swap the browser paints text in a fallback before the web
    font arrives. Without these overrides that reflow is visible. The units are
    fractions of em, which is what the CSS descriptors want.
    """
    upem = font["head"].unitsPerEm
    os2 = font["OS/2"]
    typo_asc, typo_desc, typo_gap = os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap
    hhea_asc, hhea_desc, hhea_gap = font["hhea"].ascender, font["hhea"].descender, font["hhea"].lineGap

    # Prefer the typo metrics when the font sets USE_TYPO_METRICS, because that
    # is the designer's intended line box; otherwise hhea, which is what
    # browsers actually match against.
    use_typo = bool(os2.fsSelection & (1 << 7))
    asc, desc, gap = (typo_asc, typo_desc, typo_gap) if use_typo else (hhea_asc, hhea_desc, hhea_gap)

    return {
        "ascentOverride": round(asc / upem * 100, 2),
        "descentOverride": round(abs(desc) / upem * 100, 2),
        "lineGapOverride": round(gap / upem * 100, 2),
        "xHeight": round(getattr(os2, "sxHeight", 0) / upem * 100, 2),
        "capHeight": round(getattr(os2, "sCapHeight", 0) / upem * 100, 2),
        "usedTypoMetrics": use_typo,
    }


def cmap_codepoints(font: TTFont) -> list:
    cps = set()
    for table in font["cmap"].tables:
        cps |= {c for c in table.cmap if c <= 0xFFFF}
    return sorted(cps)


def unicode_range(cps: list) -> str:
    """Compress codepoints into CSS unicode-range descriptors.

    Derived from the font's own cmap rather than copied from Google's CSS, so a
    range can never claim coverage the shipped file does not have - the usual
    way a hand-written unicode-range quietly breaks a glyph.
    """
    if not cps:
        return "U+0000"
    out, start, prev = [], cps[0], cps[0]
    for c in cps[1:] + [None]:
        if c is not None and c == prev + 1:
            prev = c
            continue
        out.append("U+%04X" % start if start == prev else "U+%04X-%04X" % (start, prev))
        if c is not None:
            start = prev = c
    return ", ".join(out)


# Local fallbacks, and the x-height each resolves to. These are the faces that
# actually paint during the swap window, so their metrics decide how much the
# layout moves. 51.86% is Arial's, and is what Helvetica, Liberation Sans and
# Nimbus Sans also report; Segoe UI is 50.00% and Roboto/SF sit near 52%.
FALLBACK_XHEIGHT = 51.86

FALLBACKS = {
    "plus-jakarta-sans": {
        "family": "Plus Jakarta Sans Fallback",
        "locals": ["Arial", "Liberation Sans", "Nimbus Sans", "Roboto"],
        "why": "system-ui / sans-serif",
    },
    "fraunces": {
        "family": "Fraunces Fallback",
        "locals": ["Georgia", "Times New Roman", "Liberation Serif"],
        "why": "Georgia, serif",
    },
    "noto-nastaliq-urdu": {
        "family": "Noto Nastaliq Urdu Fallback",
        "locals": ["Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Noto Naskh Arabic", "Urdu Typesetting"],
        "why": "serif",
    },
}


def write_css(report: dict) -> pathlib.Path:
    """Emit src/fonts.css from the manifest so the two cannot disagree."""
    L = []
    A = L.append
    A("/*")
    A(" * GENERATED by build/build_fonts.py - do not edit by hand.")
    A(" * Run `npm run fonts` after changing any copy on the site.")
    A(" *")
    A(" * Each family ships as ONE variable woff2 covering the whole weight range")
    A(" * the page uses, rather than one file per weight the way the Google Fonts")
    A(" * CDN served them.")
    A(" *")
    A(" * The fallback faces below are the part that is easy to skip and the part")
    A(" * that matters. With font-display:swap the browser paints text in these")
    A(" * until the web font arrives, and unmatched metrics mean every heading on")
    A(" * the page visibly jumps. ascent/descent/line-gap are copied from the real")
    A(" * font; size-adjust scales it so its x-height lines up with the local face")
    A(" * that will stand in for it.")
    A(" */")
    A("")

    for slug, fb in FALLBACKS.items():
        m = report["families"][slug]["metrics"]
        size_adjust = m["xHeight"] / FALLBACK_XHEIGHT * 100
        A("/* stands in for %s while it loads; metrics from the shipped font */"
          % report["families"][slug]["family"])
        A("@font-face {")
        A("  font-family: '%s';" % fb["family"])
        A("  src: %s;" % ", ".join("local('%s')" % n for n in fb["locals"]))
        A("  ascent-override: %s%%;" % m["ascentOverride"])
        A("  descent-override: %s%%;" % m["descentOverride"])
        A("  line-gap-override: %s%%;" % m["lineGapOverride"])
        A("  size-adjust: %s%%;" % round(size_adjust, 2))
        A("}")
        A("")

    for slug, f in report["families"].items():
        lo, hi = f["weightRange"]
        A("/* %s, wght %d-%d, %d KB */" % (f["family"], lo, hi, f["kb"]))
        A("@font-face {")
        A("  font-family: '%s';" % f["family"])
        A("  src: url('/fonts/%s') format('woff2');" % f["file"])
        A("  font-weight: %d %d;" % (lo, hi))
        A("  font-style: normal;")
        A("  font-display: swap;")
        A("  /* derived from the font's own cmap, so it cannot over-claim */")
        A("  unicode-range: %s;" % f["unicodeRange"])
        A("}")
        A("")

    dest = ROOT / "src" / "fonts.css"
    dest.write_text("\n".join(L), encoding="utf-8")
    return dest


PRELOAD = ["plus-jakarta-sans", "fraunces"]
PRELOAD_START = "<!-- @fonts:preload -->"
PRELOAD_END = "<!-- /@fonts:preload -->"


def write_preloads(report: dict) -> pathlib.Path:
    """Rewrite the preload block in index.html from the hashed filenames.

    Fonts are content-hashed, so the URLs change whenever a glyph outline
    changes. Leaving them as hand-written <link> tags guarantees that one day
    fonts.css points at a file that exists and index.html preloads a file that
    does not - a 404 on the critical path that only shows up as a slow first
    paint. So the block is generated from the same manifest as the CSS.
    """
    dest = ROOT / "index.html"
    html = dest.read_text(encoding="utf-8")
    if PRELOAD_START not in html or PRELOAD_END not in html:
        print("  ! index.html is missing the %s markers - preload links left alone"
              % PRELOAD_START)
        return dest

    tags = []
    for slug in PRELOAD:
        f = report["families"][slug]
        tags.append(
            '    <link rel="preload" href="/fonts/%s" as="font" type="font/woff2" crossorigin />'
            % f["file"]
        )
    block = PRELOAD_START + "\n" + "\n".join(tags) + "\n    " + PRELOAD_END

    head, rest = html.split(PRELOAD_START, 1)
    _, tail = rest.split(PRELOAD_END, 1)
    dest.write_text(head + block + tail, encoding="utf-8")
    return dest


def build() -> None:
    fetch_sources()
    OUT.mkdir(parents=True, exist_ok=True)
    # Drop the previous run's output. Filenames are content-hashed, so a rebuild
    # that changes even one outline leaves an orphan behind, and an orphan in
    # public/ gets deployed.
    for stale in OUT.glob("*.woff2"):
        stale.unlink()
    chars = inventory()

    report = {"chars": len(chars), "families": {}}
    rows = []
    for family, (src_name, kind) in SOURCES.items():
        src = CACHE / src_name
        if not src.exists():
            raise SystemExit("missing cached source %s" % src)

        font = TTFont(src)
        # Keep the upstream font's own head.modified. Without this fontTools
        # stamps the current time into the file on save, so two runs of this
        # script produce byte-identical-looking fonts with different content
        # hashes - and since the filename *is* that hash, every rebuild would
        # change the font URL and throw away the visitor's cached copy. The
        # output has to be deterministic or the immutable cache header is a lie.
        font.recalcTimestamp = False
        before = src.stat().st_size

        opts = subset.Options()
        opts.flavor = "woff2"
        opts.desubroutinize = True
        opts.name_IDs = ["*"]
        opts.name_legacy = True
        opts.name_languages = ["*"]
        opts.layout_features = ["*"]
        opts.notdef_outline = True
        opts.recalc_bounds = True
        opts.drop_tables = ["DSIG"]

        # Order matters: subsetting first, then instancing.
        # instancer returns gvar.variations as a LazyDict that has no ".notdef"
        # entry, and the subsetter's _dict_subset does d[g] for every retained
        # glyph, so instancing-then-subsetting dies with KeyError: '.notdef'.
        # Subset-then-instance also drops master glyphs before the axis is
        # narrowed, which is both correct and faster.
        subsetter = subset.Subsetter(options=opts)
        subsetter.populate(text="".join(sorted(chars)))
        subsetter.subset(font)

        font = instance(font, family)
        metrics = fallback_metrics(font)

        slug = family.lower().replace(" ", "-")
        dest = OUT / ("%s-%s.woff2" % (slug, kind))

        # Record which requested characters actually survived, so verify can fail
        # on a character that silently vanished. Each face only has to cover the
        # script it exists for: complaining that Plus Jakarta Sans lacks Urdu
        # would be noise, and the whole point of the split is that no single face
        # has to.
        #
        # A character missing from the generous margin is harmless - the browser
        # falls through to the next family in the stack, which is what the stack
        # is for. A character missing that is actually on the page is broken
        # text, and is the only case worth failing on.
        cmap = set()
        for table in font["cmap"].tables:
            cmap |= set(table.cmap.keys())

        used = source_characters()
        broken = sorted(c for c in used if must_cover(c) and in_script(c, kind) and ord(c) not in cmap)
        margin = sorted(
            c for c in chars
            if c not in used and must_cover(c) and in_script(c, kind) and ord(c) not in cmap
        )
        if broken:
            print("  !! %s CANNOT RENDER %d character(s) present on the page: %s"
                  % (family, len(broken),
                     " ".join("U+%04X %s" % (ord(c), unicodedata.name(c, "?")) for c in broken[:10])))
        if margin:
            print("  .. %s: %d spare character(s) fall back to the system stack "
                  "(%s%s)" % (family, len(margin),
                              " ".join(unicodedata.name(c, "?") for c in margin[:3]),
                              ", ..." if len(margin) > 3 else ""))
        if not broken:
            print("  ok %s: every character on the page is covered" % family)

        font.flavor = "woff2"
        font.save(dest)

        # Content-hash the filename. Fonts are immutable bytes, so a hashed name
        # is what makes `Cache-Control: immutable` safe to set: the file is
        # cached for a year and a rebuild that changes the glyphs produces a new
        # URL instead of quietly serving stale text outlines.
        digest = hashlib.sha256(dest.read_bytes()).hexdigest()[:10]
        hashed = dest.with_name("%s-%s.woff2" % (slug, digest))
        dest.replace(hashed)
        dest = hashed

        after = dest.stat().st_size
        rows.append((family, src_name, before, after, kind))
        report["families"][slug] = {
            "family": family,
            "file": dest.name,
            "kind": kind,
            "kb": round(after / 1024, 1),
            "glyphs": font["maxp"].numGlyphs,
            "weightRange": WEIGHT_RANGE[family],
            "metrics": metrics,
            "unicodeRange": unicode_range(cmap_codepoints(font)),
        }

    # The manifest is build metadata, not a site asset, so it lives outside
    # public/ rather than being deployed for 2 KB nobody needs to fetch.
    manifest_path = ROOT / "build" / "fonts.manifest.json"
    manifest_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    css_path = write_css(report)
    html_path = write_preloads(report)

    print()
    print("%-24s %-34s %9s %9s %7s" % ("family", "source face", "before", "after", "saved"))
    tot_b = tot_a = 0
    for family, src_name, b, a, _ in rows:
        tot_b += b
        tot_a += a
        print("%-24s %-34s %7.1f KB %7.1f KB %5.0f%%"
              % (family, src_name, b / 1024, a / 1024, 100 - a / b * 100))
    print("%-24s %-34s %7.1f KB %7.1f KB %5.0f%%" % ("TOTAL", "(1 face per family)", tot_b / 1024, tot_a / 1024, 100 - tot_a / tot_b * 100))
    print("\nsubset character inventory: %d glyphs" % len(chars))
    print("wrote %s" % css_path.relative_to(ROOT))
    print("wrote preload block in %s" % html_path.relative_to(ROOT))
    for slug, f in report["families"].items():
        print("   %-22s %2d KB  %3d glyphs  weights %s" % (f["family"], f["kb"], f["glyphs"], f["weightRange"]))


if __name__ == "__main__":
    build()