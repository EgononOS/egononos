#!/usr/bin/env python3
"""Validate the EGONON OS shared-memory control-plane workspace."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_MEMORY = {
    "identity", "mandates", "portfolios", "strategies", "decisions",
    "research-runs", "source-register", "open-items", "artifacts",
}
REQUIRED_ENGINES = {
    "egonon-core", "tradingagents", "vibe-trading", "nautilus-trader",
    "backtrader", "fincept-terminal",
}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    policy_path = root / "project-policy.json"
    registry_path = root / "engine-registry.json"
    if not policy_path.is_file():
        errors.append("missing project-policy.json")
    if not registry_path.is_file():
        errors.append("missing engine-registry.json")
    if errors:
        return errors

    policy = load_json(policy_path)
    registry = load_json(registry_path)
    if policy.get("live_trading_enabled") is not False:
        errors.append("live_trading_enabled must be false")
    if policy.get("secret_storage") != "external-only":
        errors.append("secret_storage must be external-only")

    engines = registry.get("engines", {})
    missing_engines = REQUIRED_ENGINES - set(engines)
    if missing_engines:
        errors.append(f"missing engines: {sorted(missing_engines)}")
    fincept = engines.get("fincept-terminal", {})
    license_ref = policy.get("fincept_commercial_license_reference")
    if not license_ref and fincept.get("status") != "LICENSE BLOCKED":
        errors.append("Fincept must remain LICENSE BLOCKED without a license reference")

    memory_root = root / "memory"
    existing_memory = {
        path.name for path in memory_root.iterdir() if path.is_dir()
    } if memory_root.is_dir() else set()
    missing_memory = REQUIRED_MEMORY - existing_memory
    if missing_memory:
        errors.append(f"missing memory domains: {sorted(missing_memory)}")

    env_paths = [
        engines[name].get("environment")
        for name in ("tradingagents", "vibe-trading", "nautilus-trader", "backtrader")
        if name in engines
    ]
    if len(env_paths) != len(set(env_paths)):
        errors.append("quant engines must use distinct environments")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.home() / ".egonon" / "egonon-os-shared-memory",
    )
    args = parser.parse_args()
    errors = validate(args.root.expanduser().resolve())
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        sys.exit(1)
    print("PASS: EGONON OS shared-memory workspace is structurally valid")


if __name__ == "__main__":
    main()
