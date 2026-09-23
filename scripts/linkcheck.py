import re, os, collections, sys

root = sys.argv[1] if len(sys.argv) > 1 else "dist"
pages = {}
for dp, dn, fn in os.walk(root):
    for f in fn:
        if f.endswith(".html"):
            full = os.path.join(dp, f)
            key = full.replace(os.sep, "/")
            pages[key] = open(full, encoding="utf-8").read()


def exists(url):
    p = url.split("#")[0].split("?")[0]
    if not p.startswith("/"):
        return True
    if p.endswith("/"):
        return os.path.isfile(root + p + "index.html")
    if os.path.isfile(root + p):
        return True
    return os.path.isfile(root + p + "/index.html")


dead = collections.defaultdict(set)
total = 0
for path, html in pages.items():
    src = path[len(root):] or "/"
    for m in re.finditer(r'href="(/[^"]*)"', html):
        u = m.group(1)
        if u.startswith("//"):
            continue
        total += 1
        if not exists(u):
            dead[u].add(src)

print("pages built           :", len(pages))
print("internal links checked:", total)
print("distinct dead targets :", len(dead))
print()
for u in sorted(dead):
    print("  DEAD", u)
    for s in sorted(dead[u]):
        print("        from", s)
