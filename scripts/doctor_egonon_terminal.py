#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

GROUPS = {"terminal-ui": "terminal-ui", "portfolio-lab": "portfolio-lab", "qlib": "qlib", "openbb": "openbb"}


def python_path(environment: Path) -> Path:
    windows = environment / "Scripts" / "python.exe"
    return windows if windows.exists() else environment / "bin" / "python"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.home() / ".egonon" / "egonon-os-shared-memory")
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    project = Path(__file__).resolve().parents[1]
    env_root = root / "engines" / "egonon-terminal" / "envs"
    results = {}
    for env_name, worker_group in GROUPS.items():
        python = python_path(env_root / env_name)
        if not python.is_file():
            results[env_name] = {"status": "NOT INSTALLED", "python": str(python)}
            continue
        completed = subprocess.run([str(python), "-m", "egonon_terminal.workers.health_worker", worker_group], cwd=project, capture_output=True, text=True, check=False)
        try:
            payload = json.loads(completed.stdout)
        except json.JSONDecodeError:
            payload = {"status": "FAIL", "stdout": completed.stdout, "stderr": completed.stderr}
        results[env_name] = payload
    statuses = [value.get("status") for value in results.values()]
    overall = "PASS" if statuses and all(status == "PASS" for status in statuses) else ("INCOMPLETE" if any(status == "NOT INSTALLED" for status in statuses) else "FAIL")
    receipt = {"created_at": datetime.now(timezone.utc).isoformat(), "status": overall, "live_trading_enabled": False, "results": results}
    receipt_path = root / "receipts" / "egonon-terminal-doctor.json"
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2, sort_keys=True))
    raise SystemExit(0 if overall == "PASS" else (2 if overall == "INCOMPLETE" else 1))


if __name__ == "__main__":
    main()
