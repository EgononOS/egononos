#!/bin/bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERRORE: questo installer e progettato per macOS."
  read -r -p "Premi Invio per chiudere..."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/.egonon/egonon-terminal-lite"
ENV_DIR="$INSTALL_DIR/.venv"
LOG_DIR="$HOME/.egonon/logs"
mkdir -p "$INSTALL_DIR" "$LOG_DIR"
LOG_FILE="$LOG_DIR/egonon-terminal-lite-install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi
command -v uv >/dev/null 2>&1 || { echo "ERRORE: uv non disponibile"; exit 1; }

rm -rf "$INSTALL_DIR/app"
mkdir -p "$INSTALL_DIR/app"
cp -R "$SCRIPT_DIR/egonon_terminal" "$INSTALL_DIR/app/"
cp "$SCRIPT_DIR/bootstrap.py" "$INSTALL_DIR/app/"
cp "$SCRIPT_DIR/health_check.py" "$INSTALL_DIR/app/"
cp "$SCRIPT_DIR/requirements.txt" "$INSTALL_DIR/app/"

uv python install 3.11
uv venv --python 3.11 "$ENV_DIR"
uv pip install --python "$ENV_DIR/bin/python" -r "$INSTALL_DIR/app/requirements.txt"
"$ENV_DIR/bin/python" "$INSTALL_DIR/app/bootstrap.py"
"$ENV_DIR/bin/python" "$INSTALL_DIR/app/health_check.py"
PYTHONPATH="$INSTALL_DIR/app" "$ENV_DIR/bin/python" -m egonon_terminal.app --check

cat > "$INSTALL_DIR/Avvia_EGONON_Terminal.command" <<'RUNNER'
#!/bin/bash
set -euo pipefail
INSTALL_DIR="$HOME/.egonon/egonon-terminal-lite"
ENV_DIR="$INSTALL_DIR/.venv"
PID_FILE="$INSTALL_DIR/egonon-terminal.pid"
LOG_FILE="$HOME/.egonon/logs/egonon-terminal-lite-runtime.log"
if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  open "http://127.0.0.1:8050"
  exit 0
fi
PYTHONPATH="$INSTALL_DIR/app" nohup "$ENV_DIR/bin/python" -m egonon_terminal.app --host 127.0.0.1 --port 8050 >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
for _ in {1..20}; do
  if curl -fsS "http://127.0.0.1:8050" >/dev/null 2>&1; then
    open "http://127.0.0.1:8050"
    exit 0
  fi
  sleep 1
done
echo "Il terminale non ha risposto. Controlla: $LOG_FILE"
exit 1
RUNNER
chmod +x "$INSTALL_DIR/Avvia_EGONON_Terminal.command"

cat > "$INSTALL_DIR/Arresta_EGONON_Terminal.command" <<'STOPPER'
#!/bin/bash
set -euo pipefail
PID_FILE="$HOME/.egonon/egonon-terminal-lite/egonon-terminal.pid"
if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then kill "$PID"; fi
  rm -f "$PID_FILE"
fi
echo "EGONON Terminal Lite arrestato."
STOPPER
chmod +x "$INSTALL_DIR/Arresta_EGONON_Terminal.command"

mkdir -p "$HOME/Desktop"
ln -sfn "$INSTALL_DIR/Avvia_EGONON_Terminal.command" "$HOME/Desktop/Avvia EGONON Terminal.command"
ln -sfn "$INSTALL_DIR/Arresta_EGONON_Terminal.command" "$HOME/Desktop/Arresta EGONON Terminal.command"

"$INSTALL_DIR/Avvia_EGONON_Terminal.command"
echo "Installazione completata: http://127.0.0.1:8050"
