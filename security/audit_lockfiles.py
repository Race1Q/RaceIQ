import argparse, json, sys
from pathlib import Path
from collections import defaultdict

def load_compromised(path):
    data = json.load(open(path, "r", encoding="utf-8"))
    bad = defaultdict(set)
    for p in data.get("packages", []):
        name = p["name"]
        for v in p.get("bad", []):
            bad[name].add(str(v))
    return dict(bad)

def derive_name_from_packages_key(key: str) -> str | None:
    # packages map keys look like:
    # "" (root), "node_modules/foo", "node_modules/@scope/name",
    # "node_modules/foo/node_modules/bar", etc.
    if not key or key == "":
        return None
    parts = key.split("/")
    # find last "node_modules" occurrence
    try:
        idx = len(parts) - 1 - parts[::-1].index("node_modules")
    except ValueError:
        idx = -1
    start = idx + 1 if idx >= 0 else 0
    tail = parts[start:]
    if not tail:
        return None
    if len(tail) >= 2 and tail[0].startswith("@"):
        return f"{tail[0]}/{tail[1]}"
    return tail[0]

def scan_lockfile(lock_path: Path, badmap: dict):
    report = {
        "lockfile": str(lock_path),
        "matches": [],
        "summary": {"by_package": {}, "count": 0},
    }
    try:
        data = json.load(open(lock_path, "r", encoding="utf-8"))
    except Exception as e:
        report["error"] = f"Failed to parse JSON: {e}"
        return report

    # Strategy 1: npm v7+ "packages" map (most accurate)
    pkgs = data.get("packages", {})
    if isinstance(pkgs, dict):
        for key, meta in pkgs.items():
            if not isinstance(meta, dict):
                continue
            ver = meta.get("version")
            if not ver:
                continue
            name = meta.get("name") or derive_name_from_packages_key(key)
            if not name:
                continue
            if name in badmap and str(ver) in badmap[name]:
                report["matches"].append({
                    "name": name,
                    "version": str(ver),
                    "where": "packages",
                    "path": key
                })

    # Strategy 2: legacy "dependencies" tree (belt-and-braces)
    def walk_deps(node: dict, path_stack: list[str]):
        deps = node.get("dependencies") or {}
        if not isinstance(deps, dict):
            return
        for nm, meta in deps.items():
            if not isinstance(meta, dict):
                continue
            ver = meta.get("version")
            if ver and nm in badmap and str(ver) in badmap[nm]:
                report["matches"].append({
                    "name": nm,
                    "version": str(ver),
                    "where": "dependencies",
                    "path": "/".join(path_stack + [nm]),
                })
            walk_deps(meta, path_stack + [nm])

    if isinstance(data.get("dependencies"), dict):
        walk_deps({"dependencies": data["dependencies"]}, [])

    # Summaries
    by_pkg = defaultdict(int)
    for m in report["matches"]:
        by_pkg[m["name"]] += 1
    report["summary"]["by_package"] = dict(by_pkg)
    report["summary"]["count"] = len(report["matches"])
    return report

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="where to start scanning (default: .)")
    ap.add_argument("--compromised", required=True, help="path to compromised.json")
    ap.add_argument("--out", required=True, help="output JSON report file")
    ap.add_argument("--fail-on-find", action="store_true",
                    help="exit 2 if any compromised versions are found")
    args = ap.parse_args()

    badmap = load_compromised(args.compromised)
    root = Path(args.root)
    lockfiles = list(root.rglob("package-lock.json"))
    results = []
    for lf in sorted(lockfiles):
        results.append(scan_lockfile(lf, badmap))

    total_hits = sum(r.get("summary", {}).get("count", 0) for r in results)
    out = {
        "root": str(root.resolve()),
        "lockfiles_scanned": [r["lockfile"] for r in results],
        "reports": results,
        "total_matches": total_hits
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {args.out}  (matches: {total_hits})")
    if args.fail_on_find and total_hits > 0:
        sys.exit(2)

if __name__ == "__main__":
    main()