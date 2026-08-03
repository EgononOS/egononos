from __future__ import annotations

import copy
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

COMPONENTS: dict[str, dict[str, Any]] = {
    "egonon-terminal-ui": {"role": "Single Dash user interface and orchestration surface", "environment": "engines/egonon-terminal/envs/terminal-ui", "packages": {"dash": "4.4.1", "financetoolkit": "2.1.3", "financedatabase": "2.4.0", "jquantstats": "0.9.6"}, "license": "MIT dependencies", "status": "NOT VALIDATED"},
    "portfolio-lab": {"role": "Robust portfolio construction and CVaR/CDaR analysis", "environment": "engines/egonon-terminal/envs/portfolio-lab", "packages": {"skfolio": "0.20.1", "riskfolio-lib": "7.3.0"}, "license": "BSD-3-Clause dependencies", "status": "NOT VALIDATED"},
    "qlib-lab": {"role": "AI/ML quantitative research laboratory", "environment": "engines/egonon-terminal/envs/qlib", "packages": {"pyqlib": "0.9.7"}, "license": "MIT", "status": "NOT VALIDATED"},
    "openbb-gateway": {"role": "Optional isolated market-data gateway", "environment": "engines/egonon-terminal/envs/openbb", "packages": {"openbb": "4.7.2"}, "license": "AGPL-3.0-only", "status": "OPTIONAL NOT INSTALLED", "isolation_required": True},
}


def read_registry(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {"updated_at": None, "engines": {}}
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def merge_terminal_registry(path: Path, components: dict[str, dict[str, Any]] | None = None) -> dict[str, Any]:
    payload = read_registry(path)
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    payload["egonon_terminal"] = {"schema_version": 1, "live_trading_enabled": False, "components": copy.deepcopy(components or COMPONENTS)}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return payload
