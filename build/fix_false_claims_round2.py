"""
Round 2 of the claim audit.

Round 1 checked titles and short labels but never read the `desc` fields, so this
one exists to catch what that pass missed. All four industries claims below were
re-checked with a deliberately broad pattern set, and every broad search returned
only unrelated matches (e.g. `generic` matched the string literal 'pos-salt' and a
print-driver name; `serial` matched the word "Serialise" in a comment). A broad
search finding nothing is what makes a claim false rather than merely renamed.

  * "Per-piece & per-kg pricing" -- no weight-based pricing exists anywhere.
    `scaleBarcode.ts` reads a weight off a scanned BayLan barcode, but there is no
    per-kg rate to apply it to.
  * "Serial number / IMEI tracking", "serial/IMEI warranty tracking" -- absent.
  * "Carton to loose pack breakdown" -- absent.
  * "Generic salt / formula quick search" -- absent.
  * "Bill a whole customer in under 3 seconds" -- an unmeasured performance claim.
  * "encrypted backups ... your data is 100% safe" -- the backup is a byte copy of a
    plain SQLite file, and nothing is 100% safe.

Same discipline as round 1: every rule asserts, and content.json is only written
when all of them match.
"""

import json
import sys
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "src" / "content.json"

# (path, old, new) -- new=None drops the list item.
RULES: list[tuple[tuple, str, str | None]] = [
    (
        ("features", "items", 0, "desc"),
        "Bill a whole customer in under 3 seconds. Barcode scan or 2-letter search. "
        "Works fully offline without ever needing internet.",
        "Barcode scan ya 2-letter search se bill — poori tarah offline, kabhi internet ki zarurat nahi.",
    ),
    (
        ("features", "items", 9, "desc"),
        "Automated daily encrypted backups to your Google Drive or OneDrive. "
        "If your PC ever crashes, your data is 100% safe.",
        "Har raat 2 baje aap ke folder mein backup banta hai. Agar woh folder OneDrive ya Google "
        "Drive ke andar ho to woh khud sync ho jaata hai. Backup encrypted nahi hota.",
    ),
    (
        ("changelog", 4, "notes"),
        "A4 Tax Invoice designer for wholesale & credit supply bills",
        "A4 tax invoice printing for wholesale & credit supply bills",
    ),
    (("industries", 1, "points"), "Generic salt / formula quick search", None),
    (("industries", 2, "points"), "Per-piece & per-kg pricing", None),
    (("industries", 4, "points"), "Serial number / IMEI tracking", None),
    (("industries", 4, "points"), "Carton to loose pack breakdown", None),
    (
        ("industries", 4, "desc"),
        "Carton & loose unit billing, serial/IMEI warranty tracking, and dual wholesale pricing.",
        "Wholesale aur retail dono ke alag rate, aur customer ka udhaar ledger.",
    ),
]


def resolve(doc, path):
    node = doc
    for key in path:
        node = node[key]
    return node


def main() -> int:
    doc = json.loads(CONTENT.read_text(encoding="utf-8"))
    failures: list[str] = []
    applied = removed = 0

    for path, old, new in RULES:
        where = "/".join(map(str, path))
        try:
            node = resolve(doc, path)
        except (KeyError, IndexError, TypeError):
            failures.append(f"path not found: {where}")
            continue

        if isinstance(node, list):
            if old not in node:
                failures.append(f"{where}: item not found -> {old!r}")
                continue
            if new is None:
                node.remove(old)
                removed += 1
            else:
                node[node.index(old)] = new
                applied += 1
        elif node == old:
            resolve(doc, path[:-1])[path[-1]] = new
            applied += 1
        else:
            failures.append(f"{where}: expected {old!r}, found {node!r}")

    if failures:
        print("FAILED -- every rule below would have been a silent no-op:\n")
        for f in failures:
            print("  -", f)
        print(f"\n{len(failures)} of {len(RULES)} rules failed. content.json NOT written.")
        return 1

    CONTENT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"OK  {applied} claim(s) corrected, {removed} false claim(s) removed, 0 silent failures.")
    return 0


if __name__ == "__main__":
    sys.exit(main())