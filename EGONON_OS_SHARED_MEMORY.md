# EGONON OS — Memoria Condivisa

## Decision

EGONON OS is the single user-facing project and control plane. **EGONON Terminal** is the native visual and analytical surface and replaces Fincept.

The user sees one project. Internally, every dependency group remains isolated, versioned, auditable, and connected through the shared-memory contract.

## Architecture

```text
User / Sidebar Project
        |
EGONON OS AI-Driven Core
        |
+---------------- Shared Memory ----------------+
| mandates | portfolios | decisions | run receipts |
+------------------------------------------------+
        |
EGONON Terminal
  | terminal-ui    -> Dash + FinanceToolkit + FinanceDatabase + jQuantStats
  | portfolio-lab  -> skfolio + Riskfolio-Lib
  | qlib-lab       -> Qlib AI/ML research
  | openbb-gateway -> optional isolated AGPL data gateway
        |
Specialist engines
  | TradingAgents  -> qualitative multi-agent challenge
  | Vibe-Trading   -> research, alpha exploration, broad backtests
  | NautilusTrader -> deterministic validation and paper path
  | Backtrader     -> legacy reproduction and simple baseline
        |
Risk + Compliance + Evidence Gates
        |
Reports / Orders / Committee Outputs / Paper Execution
```

Fincept is not an active engine, dependency, or fallback.

## Shared workspace

```text
~/.egonon/egonon-os-shared-memory/
├── project-policy.json
├── engine-registry.json
├── memory/
├── interchange/
├── engines/
│   ├── egonon-terminal/
│   │   ├── envs/
│   │   │   ├── terminal-ui/
│   │   │   ├── portfolio-lab/
│   │   │   ├── qlib/
│   │   │   └── openbb/
│   │   ├── cache/
│   │   └── exports/
│   ├── tradingagents/
│   ├── vibe/
│   ├── nautilus/
│   └── backtrader/
├── logs/
└── receipts/
```

## Component policy

- **terminal-ui**: Dash 4.4.1, FinanceToolkit 2.1.3, FinanceDatabase 2.4.0, jQuantStats 0.9.6.
- **portfolio-lab**: skfolio 0.20.1 and Riskfolio-Lib 7.3.0.
- **qlib-lab**: pyqlib 0.9.7.
- **openbb-gateway**: OpenBB 4.7.2, optional and isolated because it is AGPL-3.0-only.
- All runtime groups use Python 3.12 unless a later validated compatibility matrix supersedes it.

Use `INSTALLED` only after exact version, environment path, import test, smoke test, policy check, and immutable receipt are present. Otherwise use `PLANNED`, `NOT VALIDATED`, `OPTIONAL NOT INSTALLED`, `PYTHON UNAVAILABLE`, `INSTALL FAILED`, or `SMOKE TEST FAILED`.

## Quant research path

1. Define the research question and point-in-time data contract.
2. Use FinanceToolkit and FinanceDatabase for analytics and universe construction.
3. Use skfolio and Riskfolio-Lib for robust portfolio challenger work.
4. Use Qlib for isolated AI/ML experiments with train/validation/test separation.
5. Challenge hypotheses with TradingAgents and/or Vibe-Trading.
6. Rebuild finalists in NautilusTrader for deterministic validation.
7. Compare order and fill ledgers across engines.
8. Apply risk, compliance, licensing, and operational gates.
9. Paper trade with monitoring and kill switches.
10. Treat live activation as a separate explicitly approved project.

## Licensing and execution

Dash, FinanceToolkit, FinanceDatabase, jQuantStats, and Qlib are MIT. skfolio and Riskfolio-Lib are BSD-3-Clause. OpenBB is AGPL-3.0-only and must remain an optional isolated gateway; do not copy it into the proprietary EGONON core.

Live trading is disabled by default. Installation, research, dashboards, backtesting, and paper trading do not authorize real-capital execution.
