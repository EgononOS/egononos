#!/usr/bin/env python3
"""Install EGONON Terminal components into isolated uv environments."""

from __future__ import annotations

import argparse
import copy
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))
from egonon_terminal.registry import COMPONENTS, merge_terminal_registry

GROUPS = {
    "terminal-ui": {"requirements": "requirements/terminal-ui.txt", "component": "egonon-terminal-ui", "worker": "terminal-ui"},
    "portfolio-lab": {"requirements": "requirements/portfolio-lab.txt", "component": "portfolio-lab", "worker": "portfolio-lab"},
    "qlib": {"requirements": "requirements/qlib.txt", "component": "qlib-lab", "worker": "qlib"},
    "openbb": {"requirements": "requirements/openbb.txt", "component": "openbb-gateway", "worker": "openbb"},
}


def run(command: list[str], dry_run: bool, *, cwd: Path | None = None, env: dict[str, str] | None = None, timeout: int = 60) -> dict:
    if dry_run:
        return {"command": command, "status": "DRY RUN", "returncode": None}
    try:
        completed = subprocess.run(command, check=False, capture_output=True, text=True, cwd=cwd, env=env, timeout=timeout)
    except subprocess.TimeoutExpired as exc:
        return {"command": command, "status": "FAIL", "returncode": None, "stderr": f"timeout after {timeout}s: {exc}"}
    except OSError as exc:
        return {"command": command, "status": "FAIL", "returncode": None, "stderr": str(exc)}
    return {"command": command, "status": "PASS" if completed.returncode == 0 else "FAIL", "returncode": completed.returncode, "stdout": completed.stdout[-4000:], "stderr": completed.stderr[-4000:]}


def env_python(env: Path) -> Path:
    return env / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def ensure_workspace(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    policy = root / "project-policy.json"
    if not policy.exists():
        policy.write_text(json.dumps({"project_name": "EGONON OS — Memoria Condivisa", "created_at": datetime.now(timezone.utc).isoformat(), "live_trading_enabled": False, "paper_trading_enabled": True, "secret_storage": "external-only", "default_bind_address": "127.0.0.1", "memory_mode": "append-and-supersede"}, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    merge_terminal_registry(root / "engine-registry.json")
    (root / "receipts").mkdir(parents=True, exist_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.home() / ".egonon" / "egonon-os-shared-memory")
    parser.add_argument("--include-openbb", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    uv = shutil.which("uv")
    if not uv:
        print("FAIL: uv is required", file=sys.stderr)
        raise SystemExit(2)
    root = args.root.expanduser().resolve()
    ensure_workspace(root)
    env_root = root / "engines" / "egonon-terminal" / "envs"
    groups = ["terminal-ui", "portfolio-lab", "qlib"] + (["openbb"] if args.include_openbb else [])
    steps = []
    components = copy.deepcopy(COMPONENTS)
    python_find = run([uv, "python", "find", "3.12"], args.dry_run, timeout=20)
    steps.append(python_find)
    python_ready = python_find["status"] in {"PASS", "DRY RUN"}
    if not python_ready:
        python_install = run([uv, "python", "install", "3.12"], args.dry_run, timeout=30)
        steps.append(python_install)
        python_ready = python_install["status"] in {"PASS", "DRY RUN"}
    for group in groups:
        definition = GROUPS[group]
        component = components[definition["component"]]
        if not python_ready:
            component["status"] = "PYTHON UNAVAILABLE"
            continue
        env = env_root / group
        requirements = PROJECT / definition["requirements"]
        create = run([uv, "venv", "--python", "3.12", str(env)], args.dry_run)
        steps.append(create)
        install = run([uv, "pip", "install", "--python", str(env_python(env)), "-r", str(requirements)], args.dry_run)
        steps.append(install)
        if args.dry_run:
            component["status"] = "PLANNED"
            continue
        if create["status"] != "PASS" or install["status"] != "PASS":
            component["status"] = "INSTALL FAILED"
            continue
        smoke = run([str(env_python(env)), "-m", "egonon_terminal.workers.health_worker", definition["worker"]], False, cwd=PROJECT, env={**os.environ, "PYTHONPATH": str(PROJECT)})
        steps.append(smoke)
        component["status"] = "INSTALLED" if smoke["status"] == "PASS" else "SMOKE TEST FAILED"
        component["smoke_test"] = smoke
    if not args.include_openbb:
        components["openbb-gateway"]["status"] = "OPTIONAL NOT INSTALLED"
    registry_payload = merge_terminal_registry(root / "engine-registry.json", components)
    payload = {"created_at": datetime.now(timezone.utc).isoformat(), "root": str(root), "python": "3.12", "live_trading_enabled": False, "groups": groups, "steps": steps, "components": registry_payload["egonon_terminal"]["components"], "status": "PASS" if all(step["status"] in {"PASS", "DRY RUN"} for step in steps) else "FAIL"}
    receipt = root / "receipts" / "egonon-terminal-install.json"
    receipt.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2, sort_keys=True))
    raise SystemExit(0 if payload["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
