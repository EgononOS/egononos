from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DEFAULT_ROOT = Path.home() / ".egonon" / "egonon-os-shared-memory"


def load_json(path: Path, default: Any) -> Any:
    if not path.is_file():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def workspace_root(value: str | Path | None = None) -> Path:
    return Path(value).expanduser().resolve() if value else DEFAULT_ROOT.expanduser().resolve()
