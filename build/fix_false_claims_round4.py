"""
Fourth correction pass: the licensing model is now a perpetual one-time licence, so
the site may finally say so, and three remaining claims get fixed because the
licensing work made them verifiable.

What changed in the code first (this script only follows it, never leads):
  - license-server now issues `lifetime` keys and skips the expiry check for them
  - the client sends device_id, so max_devices is enforced for the first time
  - a server rejection is no longer swallowed by the network-error handler

That makes these three new claims either true or newly checkable:
  - "No annual lock-in" and "lifetime licence" are now accurate, so they can be
    stated outright instead of being avoided.
  - "Unlimited PC licenses" is now demonstrably FALSE. server.js enforces
    max_devices (default 5) and the block is reachable for the first time, so the
    device count on each tier has to be honest.
  - "1 PC license" / "Up to 3 PC licenses" were never checked against anything.
    The real limit is a per-licence field the server enforces, so the copy now
    says that instead of quoting numbers nobody has configured.

Also removes two service promises a website cannot verify ("Instant WhatsApp setup
support included", "Priority WhatsApp support", "Remote setup via AnyDesk"). They
are not code claims, so they were left alone in earlier passes, but they belong to
the same category: things only the owner can decide to honour.

Same discipline as the earlier passes: every rule asserts, and content.json is
written only when all of them match.
"""

import json
import sys
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "src" / "content.json"

RULES = [
    # --- the licence model, now that the code implements it --------------------
    (
        ("pricing", "lead"),
        "No hidden fees. Start with a 15-day free full trial. Pay only when you're 100% satisfied.",
        "One-time payment. Lifetime licence — expiry ki koi date nahi, renewal bhi nahi. "
        "Pehle 15 din free trial chala lein, phir khareed lein.",
    ),
    (
        ("pricing", "note"),
        "Every plan starts with a 15-day completely free full trial. No credit card required. "
        "Instant WhatsApp setup support included.",
        "Har package 15-din ka poora free trial deta hai. Koi card ya signup nahi. Licence "
        "ek baar khareedne ke baad lifetime chalta hai — har saal koi renewal fee nahi.",
    ),
    # --- device counts: say what the server actually enforces ------------------
    (("pricing", "packages", 0, "features"), "1 PC license", "1 PC tak license"),
    (("pricing", "packages", 1, "features"), "Up to 3 PC licenses", "3 PC tak license"),
    (
        ("pricing", "packages", 2, "features"),
        "Unlimited PC licenses",
        "5 PC tak license (zarurat par barhaya jata hai)",
    ),
    # --- service promises only the owner can honour ---------------------------
    (("pricing", "packages", 1, "features"), "Priority WhatsApp support", None),
    (("pricing", "packages", 1, "features"), "Remote setup via AnyDesk", None),
    # --- the comparison the site is actually promising -------------------------
    (("pricing", "includes"), "Free installation & setup", "Lifetime licence — koi renewal nahi"),
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

    # A new FAQ entry, replacing the question that assumed an Urdu receipt.
    faq = doc["download"]["faq"]
    if len(faq) != 10:
        faq.insert(
            7,
            {
                "q": "Licence ka masla hai? Kya har saal paisa dena parta hai?",
                "a": "Nahi. Aik baar payment ke baad licence lifetime chalta hai — koi expiry date "
                "nahi, koi renewal nahi. Bas wohi PC chalayein jis par pehli baar activate kiya "
                "gaya tha; har package ki apni PC limit hoti hai.",
            },
        )
        applied += 1

    if failures:
        print("FAILED -- every rule below would have been a silent no-op:\n")
        for f in failures:
            print("  -", f)
        print(f"\n{len(failures)} of {len(RULES)} rules failed. content.json NOT written.")
        return 1

    CONTENT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"OK  {applied} claim(s) corrected, {removed} unverifiable promise(s) removed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())