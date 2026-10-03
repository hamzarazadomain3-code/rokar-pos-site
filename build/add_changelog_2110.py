"""
Add the v2.11.0 changelog entry, taking the release date from GitHub rather than
from a value typed here.

The three previous entries were corrected in Phase 0 because their dates had been
made up. Reading the timestamp back from the published release makes the class of
mistake impossible for this entry rather than merely unlikely: if the release is
not published, or is published later than expected, this fails instead of
publishing a wrong date.

Usage:
  GH_TOKEN=... python build/add_changelog_2110.py
"""

import json
import os
import subprocess
import sys
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "src" / "content.json"
REPO = "hamzarazadomain3-code/pos-releases"
VERSION = "2.11.0"

ENTRY = {
    "version": VERSION,
    "title": "One-time licence — ab koi renewal nahi",
    "notes": [
        "Ek baar payment ke baad licence lifetime chalta hai: koi expiry date nahi, "
        "har saal renewal fee nahi.",
        "Licence us PC par activate hoti hai jis par shuru ki thi. Har package ki apni "
        "PC limit hai (1, 3 ya 5) — pehle ye limit kaam nahi karti thi, ab server par "
        "hamesha enforce hoti hai.",
        "Server se licence revoke karne par agli sale se app band ho jata hai. Licence "
        "dobara activate karne se shuru ho jaati hai.",
    ],
}


def release_date() -> str:
    """The published release date (YYYY-MM-DD) for VERSION, straight from GitHub."""
    out = subprocess.run(
        ["gh", "api", f"repos/{REPO}/releases/tags/v{VERSION}"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    published = json.loads(out).get("published_at")
    if not published:
        sys.exit(
            f"v{VERSION} is not published yet, so there is no real date to use.\n"
            "Publish the release first, then run this."
        )
    return published[:10]


def main() -> int:
    date = release_date()
    entries = json.loads(CONTENT.read_text(encoding="utf-8"))
    changelog = entries["changelog"]

    if any(e["version"] == VERSION for e in changelog):
        print(f"v{VERSION} is already in the changelog; nothing to do.")
        return 0

    entry = dict(ENTRY, date=date)
    changelog.insert(0, entry)
    CONTENT.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Added v{VERSION} dated {date} (read from the published release).")
    print(f"Changelog now: {len(changelog)} entries, newest first.")
    return 0


if __name__ == "__main__":
    sys.exit(main())