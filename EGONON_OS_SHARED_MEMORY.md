# EGONON OS — Memoria Condivisa

## Decision

EGONON OS is the single user-facing project and control plane. **EGONON Terminal Lite** is the default local analytical surface and replaces Fincept.

## Active Lite profile

Run one isolated Python 3.11 environment on the user's Mac with:

- Dash 4.4.1
- FinanceToolkit 2.1.3
- FinanceDatabase 2.4.0
- jQuantStats 0.9.6
- skfolio 0.20.1
- Riskfolio-Lib 7.3.0

Qlib, OpenBB, Docker, broker integrations and live trading are deferred. Fincept is not an active engine, dependency or fallback.

## Architecture

```text
User / Sidebar Project
        |
EGONON OS AI-Driven Core
        |
Shared, versioned memory
        |
EGONON Terminal Lite — one Python 3.11 environment
  | Dash
  | FinanceToolkit
  | FinanceDatabase
  | jQuantStats
  | skfolio
  | Riskfolio-Lib
        |
Specialist engines remain isolated when explicitly invoked
  | TradingAgents
  | Vibe-Trading
  | NautilusTrader
  | Backtrader
```

## Local workspace

```text
~/.egonon/
├── egonon-terminal-lite/
│   ├── .venv/
│   ├── app/
│   ├── Avvia_EGONON_Terminal.command
│   └── Arresta_EGONON_Terminal.command
├── egonon-os-shared-memory/
│   ├── project-policy.json
│   ├── engine-registry.json
│   ├── memory/
│   └── receipts/
└── logs/
```

## Installation and validation

Use `scripts/terminal-lite/Installa_EGONON_Terminal_Lite.command` on macOS. It installs `uv`, Python 3.11, the six pinned packages, shared-memory files and local start/stop commands.

Use `INSTALLED` only after all six imports and version checks pass and the health receipt is written. The terminal binds to `127.0.0.1:8050` and must not be exposed publicly.

## Memory and execution controls

Use append-and-supersede semantics. Preserve facts, assumptions, calculations, inferences, sources, artifacts, confidence and superseded records separately. Reconcile actual holdings to a dated bank or depositary source.

Live trading is disabled. Installation, research, dashboards, backtesting and paper analysis do not authorize real-capital execution.
