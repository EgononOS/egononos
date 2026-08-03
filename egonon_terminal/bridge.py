from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any


def environment_python(workspace: Path, relative_environment: str) -> Path:
    environment = workspace / relative_environment
    unix_python = environment / "bin" / "python"
    windows_python = environment / "Scripts" / "python.exe"
    return windows_python if windows_python.exists() else unix_python


def invoke_worker(workspace: Path, relative_environment: str, module: str, arguments: list[str] | None = None, timeout: int = 120) -> dict[str, Any]:
    python_path = environment_python(workspace, relative_environment)
    if not python_path.is_file():
        return {"ok": False, "error": f"missing environment interpreter: {python_path}"}
    command = [str(python_path), "-m", module, *(arguments or [])]
    try:
        completed = subprocess.run(command, check=False, capture_output=True, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "error": str(exc), "command": command}
    stdout = completed.stdout.strip()
    try:
        payload = json.loads(stdout) if stdout else {}
    except json.JSONDecodeError:
        payload = {"stdout": stdout}
    payload.update({"ok": completed.returncode == 0, "returncode": completed.returncode})
    if completed.stderr.strip():
        payload["stderr"] = completed.stderr.strip()
    return payload
