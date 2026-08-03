from __future__ import annotations

import argparse
import importlib
import importlib.metadata
import json

MODULES = {"terminal-ui": ["dash", "financetoolkit", "financedatabase", "jquantstats"], "portfolio-lab": ["skfolio", "riskfolio"], "qlib": ["qlib"], "openbb": ["openbb"]}
DISTRIBUTIONS = {"riskfolio": "riskfolio-lib", "qlib": "pyqlib"}


def check(group: str) -> dict:
    checks = []
    for module_name in MODULES[group]:
        distribution = DISTRIBUTIONS.get(module_name, module_name)
        try:
            imported = importlib.import_module(module_name)
            version = importlib.metadata.version(distribution)
            checks.append({"module": module_name, "version": version, "imported": imported is not None, "status": "PASS"})
        except Exception as exc:
            checks.append({"module": module_name, "status": "FAIL", "error": f"{type(exc).__name__}: {exc}"})
    return {"group": group, "status": "PASS" if all(item["status"] == "PASS" for item in checks) else "FAIL", "checks": checks}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("group", choices=sorted(MODULES))
    args = parser.parse_args()
    payload = check(args.group)
    print(json.dumps(payload, sort_keys=True))
    raise SystemExit(0 if payload["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
