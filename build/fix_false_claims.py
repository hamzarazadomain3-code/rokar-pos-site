"""
Correct every marketing claim on the site that the code does not support.

Every claim below was checked against `pos-app` first. The audit found that the
site copy had been written without reading the app, so it promised things that
were never built:

  * "Cloud backup (Google Drive)" -- there is no Drive API, no OAuth and no
    `googleapis` dependency. `backup.ts:81-103` `copyToCloud()` is a
    `fs.copyFileSync` into a folder the user picks.
  * "encrypted" backup -- `db.ts:58` opens a plain `node:sqlite` DatabaseSync.
    No SQLCipher, no `PRAGMA key`, no cipher anywhere in the app. The backup is a
    byte copy of that plain file, so it is exactly as unencrypted as the original.
  * "Central inventory sync" -- there is no network path for stock at all. The only
    outbound requests in the main process are licensing, SMS and the WhatsApp
    gateway. `branches.ts` is local rows in the same single file.
  * "Urdu & English interface" / "Urdu + English Invoices" -- the language switcher
    translates 24 sidebar labels and 9 login strings. Every page body is hardcoded
    English, and there is no receipt-language setting at all.
  * "A4 tax invoice designer" -- A4 output is real, but the designer persists
    settings that `buildInvoiceJob` never reads and its Preview is hardcoded markup.
  * "SLA support guarantee" / "Dedicated account manager" / "On-site training" --
    no code footprint; these are service promises we cannot make from a website.
  * "No annual lock-in" -- `license-server/server.js:75-81` stamps every key with
    `expires = now + 365 days`. The site was claiming the opposite of the code.

Each rule asserts its source string exists, so a rule that silently stops matching
fails the run instead of quietly doing nothing.
"""

import json
import sys
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "src" / "content.json"

# (json path as a tuple of keys/indices, optional sub-field, old, new)
# new=None means drop the item.
RULES: list[tuple[tuple, str | None, str, str | None]] = []


def rule(path, old, new=None):
    RULES.append((tuple(path), None, old, new))


def sub(path, key, old, new=None):
    """Rule against one field inside an object, e.g. requirements[i].value."""
    RULES.append((tuple(path), key, old, new))


def within(path, old, new):
    """Substring replacement inside a longer string."""
    RULES.append((tuple(path), None, old, new))


# --- hero -------------------------------------------------------------------
rule(("hero", "trust"), "Auto Cloud Backup", "Daily Automatic Backup")
# No receipt-language setting exists anywhere in the app, so this was simply false.
rule(("hero", "trust"), "Urdu + English Invoices", "Daily Profit & Loss Report")

# --- stats ------------------------------------------------------------------
rule(
    ("stats", 0, "sub"),
    "Internet sirf cloud backup ke liye chahiye",
    "Internet sirf licence check, updates aur WhatsApp receipts ke liye chahiye",
)
# "3 second average bill time" is presented as a measurement but nothing in the
# codebase records one. Replaced with a limit we can prove is absent.
# `stats.1.value` is the number 3, so compare it as text rather than as a number.
rule(("stats", 1, "value"), "3", "Unlimited")
rule(("stats", 1, "suffix"), "s", "")
rule(("stats", 1, "label"), "Average Bill Time", "Products & Bills")
rule(("stats", 1, "sub"), "Barcode scan ya 2-letter search se", "Koi limit nahi — kitne bhi ho")

# --- pricing ----------------------------------------------------------------
# The server issues 365-day keys, so "No annual lock-in" contradicted the product.
rule(
    ("pricing", "lead"),
    "No hidden fees. No annual lock-in. Start with 15-day free full trial. Pay only when you're 100% satisfied.",
    "No hidden fees. Start with a 15-day free full trial. Pay only when you're 100% satisfied.",
)
# The switcher only covers nav labels (~2% of the UI), so this read as "the whole
# interface is bilingual".
rule(("pricing", "includes"), "Urdu & English interface", "Barcode scanning & label printing")
rule(
    ("pricing", "packages", 0, "features"),
    "Cloud backup (Google Drive)",
    "Daily automatic backup, folder aap choose karein",
)
rule(
    ("pricing", "packages", 1, "features"),
    "A4 tax invoice designer",
    "A4 invoice printing",
)
# Nothing in the app moves stock between shops, and none of these are things a
# website can promise.
for fake in (
    "Central inventory sync",
    "Dedicated account manager",
    "On-site training session",
    "SLA support guarantee",
):
    rule(("pricing", "packages", 2, "features"), fake, None)

# --- features / ticker ------------------------------------------------------
rule(("features", "items", 9, "title"), "Daily Cloud Backup", "Daily Automatic Backup")
rule(
    ("ticker",),
    "Daily Google Drive & OneDrive Backup",
    "Daily Automatic Backup (folder of your choice)",
)
rule(("ticker",), "3-Second Fast Offline Billing", "Fast Offline Billing")

# --- download ---------------------------------------------------------------
sub(("download", "requirements", 4), "value", "Only needed for cloud backup",
    "Optional — licence check, updates, WhatsApp receipts")
rule(
    ("download", "faq", 0, "a"),
    "Haan, 100%. Billing, stock, reports -- sab offline kaam karta hai. Internet sirf cloud backup ke liye chahiye.",
    "Haan, 100%. Billing, stock, reports -- sab offline kaam karta hai. Internet sirf licence check, "
    "update aur WhatsApp receipt ke liye chahiye. Backup aur reporting hamesha offline chalti hai.",
)
rule(
    ("download", "faq", 4, "a"),
    "Poora data aap ke PC ke andar hi rehta hai. Saath hi rozana encrypted backup "
    "Google Drive ya OneDrive par banta hai, jise aap kisi bhi doosre PC par wapas "
    "le sakte hain.",
    "Poora data aap ke PC ke andar hi rehta hai. Har raat 2 baje app khud aap ke "
    "folder mein backup bana deti hai. Agar woh folder OneDrive ya Google Drive ke "
    " andar ho, to woh khud sync ho jaata hai — iske liye app ko internet nahi "
    "chahiye.",
)
# There is no receipt language setting; receipts are English only.
rule(
    ("download", "faq", 6, "a"),
    "Haan. Receipt aap Urdu ya English mein chun sakte hain, aur alag se A4 tax "
    "invoice bhi banta hai jo wholesale aur udhaar ke billon ke liye use hota hai.",
    "Receipt English mein aati hai. Alag se A4 tax invoice bhi banta hai jo "
    "wholesale aur udhaar ke billon ke liye use hota hai.",
)

# --- changelog --------------------------------------------------------------
# Dates below were invented. These three match the real GitHub release timestamps
# (`gh release list --repo hamzarazadomain3-code/pos-releases`); 2.9.0 and 2.10.0
# already matched.
rule(("changelog", 2, "date"), "2026-06-12", "2026-09-22")  # 2.8.0
rule(("changelog", 3, "date"), "2026-03-20", "2026-09-20")  # 2.7.0
rule(("changelog", 4, "date"), "2025-11-15", "2026-09-19")  # 2.6.0
# The one-word change that matters most: the backup has never been encrypted.
rule(
    ("changelog", 4, "notes"),
    "Automated encrypted daily backup to Google Drive / OneDrive",
    "Automated daily backup to a folder of your choice (OneDrive / Google Drive sync folder)",
)

# The BOGO / weighing-scale / Excel claims were checked and are real, so they stay.


def resolve(doc, path):
    node = doc
    for key in path:
        node = node[key]
    return node


def main() -> int:
    doc = json.loads(CONTENT.read_text(encoding="utf-8"))

    failures: list[str] = []
    applied = 0
    removed = 0

    for path, field, old, new in RULES:
        where = "/".join(map(str, path)) + (f".{field}" if field else "")
        try:
            node = resolve(doc, path)
        except (KeyError, IndexError, TypeError):
            failures.append(f"path not found: {where}")
            continue

        container = node
        if field is not None:
            if not isinstance(node, dict) or field not in node:
                failures.append(f"field {field!r} not found under: {where}")
                continue
            old = node[field] if field != "value" else old
            if str(node[field]) != old:
                failures.append(f"{where}: expected {old!r}, found {node[field]!r}")
                continue
            new_value = new if new is not None else node[field]
            container[field] = new_value
            applied += 1
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
        elif isinstance(node, (str, int, float)):
            # Scalars compare as text; a stats value of 3 arrives as a real int.
            if str(node) != old:
                failures.append(f"{where}: expected {old!r}, found {node!r}")
                continue
            parent = resolve(doc, path[:-1])
            if isinstance(parent, list):
                parent[path[-1]] = new
            else:
                parent[path[-1]] = new
            applied += 1
        else:
            failures.append(f"{where}: unexpected node type {type(node).__name__}")
            continue

    if failures:
        print("FAILED -- every rule below would have been a silent no-op:\n")
        for f in failures:
            print("  -", f)
        print(f"\n{len(failures)} of {len(RULES)} rules failed. content.json NOT written.")
        return 1

    CONTENT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"OK  {applied} claim(s) corrected, {removed} false feature(s) removed, 0 silent failures.")
    return 0


if __name__ == "__main__":
    sys.exit(main())