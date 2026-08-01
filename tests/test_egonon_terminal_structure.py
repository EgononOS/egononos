from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_requirements_are_pinned() -> None:
    for path in (ROOT / "requirements").glob("*.txt"):
        lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip() and not line.startswith("#")]
        assert lines
        assert all("==" in line for line in lines)


def test_app_check_without_dash(tmp_path: Path) -> None:
    (tmp_path / "memory").mkdir()
    (tmp_path / "memory" / "index.json").write_text("{}\n", encoding="utf-8")
    (tmp_path / "engine-registry.json").write_text(json.dumps({"engines": {}, "egonon_terminal": {"components": {}}}), encoding="utf-8")
    (tmp_path / "project-policy.json").write_text(json.dumps({"live_trading_enabled": False}), encoding="utf-8")
    result = subprocess.run([sys.executable, "-m", "egonon_terminal.app", "--root", str(tmp_path), "--check"], cwd=ROOT, capture_output=True, text=True, check=False)
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["status"] == "PASS"


def test_install_dry_run(tmp_path: Path) -> None:
    result = subprocess.run([sys.executable, "scripts/install_egonon_terminal.py", "--root", str(tmp_path), "--dry-run", "--include-openbb"], cwd=ROOT, capture_output=True, text=True, check=False)
    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["status"] == "PASS"
    assert payload["live_trading_enabled"] is False
    assert set(payload["groups"]) == {"terminal-ui", "portfolio-lab", "qlib", "openbb"}
