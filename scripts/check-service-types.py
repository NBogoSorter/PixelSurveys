"""Check the contact form's service options match what quote.php accepts.

quote.php drops any submitted service that isn't on its allow-list, silently:
no error to the visitor, nothing in the error log. The enquiry just arrives
with the service field blank. That makes a mismatch between the two lists
almost invisible until someone notices enquiries have no service on them.

Run after changing src/data/services.ts, src/data/service-types.ts or the
ALLOWED_SERVICES constant in public/api/quote.php.

    python scripts/check-service-types.py

Exits 1 on a mismatch.
"""

import io
import re
import sys

SERVICES = "src/data/services.ts"
QUOTE_PHP = "public/api/quote.php"

# The form's options are SERVICES' category titles plus this one.
EXTRA = ["Other"]


def category_titles(path):
    """Top-level SERVICES titles only - sub-service titles are indented deeper."""
    src = io.open(path, encoding="utf-8").read()
    return re.findall(r'^    title: "([^"]+)"', src, re.M)


def allowed_services(path):
    src = io.open(path, encoding="utf-8").read()
    block = re.search(r"const ALLOWED_SERVICES = \[(.*?)\];", src, re.S)
    if not block:
        sys.exit("could not find ALLOWED_SERVICES in %s" % path)
    return re.findall(r"'([^']+)'", block.group(1))


def main():
    expected = category_titles(SERVICES) + EXTRA
    actual = allowed_services(QUOTE_PHP)

    if expected == actual:
        print("OK - %d service options, form and handler agree:" % len(expected))
        for t in expected:
            print("   ", t)
        return 0

    print("MISMATCH between the form's options and quote.php's allow-list.\n")
    print("  form offers (%s + 'Other'):" % SERVICES)
    for t in expected:
        print("     ", t, "" if t in actual else "  <-- handler would DROP this")
    print("\n  %s accepts:" % QUOTE_PHP)
    for t in actual:
        print("     ", t, "" if t in expected else "  <-- nothing submits this")
    print("\nAny value the handler drops is lost with no error shown anywhere.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
