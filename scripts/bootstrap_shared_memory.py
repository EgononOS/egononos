#!/usr/bin/env python3
"""Create the EGONON OS shared-memory control-plane workspace.

Creates configuration and empty directories only. It does not clone third-party
repositories, collect credentials, or enable live trading.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

MEMORY_DOMAINS = (
    "identity", "mandates", "portfolios", "strategies", "decisions",
    "research-runs", "source-register", "open-items", "artifacts",
)
INTERCHANGE_DOMAINS = (
    "instrument-master", "data-manifests", "strategy-specs", "order-ledgers",
    "fill-ledgers", "positions", "performance",
)
ENGINES = {
    "egonon-core": {"status": "ACTIVE", "environment": "project-control-plane"},
    "tradingagents": {"status": "NOT VALIDATED", "environment": "engines/tradingagents"},
    "vibe-trading": {"status": "NOT VALIDATED", "environment": "engines/vibe"},
    "nautilus-trader": {"status": "NOT VALIDATED", "environment": "engines/nautilus"},
    "backtrader": {"status": "NOT VALIDATED", "environment": "engines/backtrader"},
    "fincept-terminal": {"status": "LICENSE BLOCKED", "environment": "engines/fincept"},
}


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def bootstrap(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    for domain in MEMORY_DOMAINS:
        (root / "memory" / domain).mkdir(parents=True, exist_ok=True)
    for domain in INTERCHANGE_DOMAINS:
        (root / "interchange" / domain).mkdir(parents=True, exist_ok=True)
    for engine in ("tradingagents", "vibe", "nautilus", "backtrader", "fincept"):
        (root / "engines" / engine).mkdir(parents=True, exist_ok=True)
    (root / "logs").mkdir(exist_ok=True)
    (root / "receipts").mkdir(exist_ok=True)

    now = datetime.now(timezone.utc).isoformat()
    write_json(root / "project-policy.json", {
        "project_name": "EGONON OS — Memoria Condivisa",
        "created_at": now,
        "live_trading_enabled": False,
        "paper_trading_enabled": True,
        "fincept_commercial_license_reference": None,
        "secret_storage": "external-only",
        "default_bind_address": "127.0.0.1",
        "memory_mode": "append-and-supersede",
    })
    write_json(root / "engine-registry.json", {"updated_at": now, "engines": ENGINES})
    write_json(root / "memory" / "index.json", {
        "updated_at": now,
        "domains": list(MEMORY_DOMAINS),
        "records": [],
    })
    print(f"Created EGONON OS shared-memory workspace at {root}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.home() / ".egonon" / "egonon-os-shared-memory",
    )
    args = parser.parse_args()
    bootstrap(args.root.expanduser().resolve())


if __name__ == "__main__":
    main()
