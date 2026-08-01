# EGONON OS — Memoria Condivisa

## Decision

EGONON OS is the single user-facing project and control plane. TradingAgents, Vibe-Trading, NautilusTrader, Backtrader, and Fincept Terminal are routed as specialist engines behind one shared, versioned memory contract.

The engines must not be installed into one dependency environment. Use one project, one memory, one engine registry, and separate virtual environments, caches, logs, and permissions.

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
Engine Router
  | TradingAgents  -> qualitative multi-agent challenge
  | Vibe-Trading   -> research, alpha exploration, broad backtests
  | NautilusTrader -> deterministic event-driven validation and paper path
  | Backtrader     -> legacy reproduction and simple baseline
  | Fincept        -> licensed standalone visual terminal only
        |
Risk + Compliance + Evidence Gates
        |
Reports / Orders / Committee Outputs / Paper Execution
```

## Shared workspace

```text
~/.egonon/egonon-os-shared-memory/
├── project-policy.json
├── engine-registry.json
├── memory/
│   ├── index.json
│   ├── identity/
│   ├── mandates/
│   ├── portfolios/
│   ├── strategies/
│   ├── decisions/
│   ├── research-runs/
│   ├── source-register/
│   ├── open-items/
│   └── artifacts/
├── interchange/
│   ├── instrument-master/
│   ├── data-manifests/
│   ├── strategy-specs/
│   ├── order-ledgers/
│   ├── fill-ledgers/
│   ├── positions/
│   └── performance/
├── engines/
│   ├── tradingagents/
│   ├── vibe/
│   ├── nautilus/
│   ├── backtrader/
│   └── fincept/
├── logs/
└── receipts/
```

## Engine status rules

Use `INSTALLED` only after exact version or immutable commit, environment path, executable/import check, smoke test, policy check, and receipt are present. Use `AVAILABLE` only when the current runtime can invoke it. Otherwise use `NOT VALIDATED`, `BLOCKED`, or `LICENSE BLOCKED`.

## Memory rules

Use append-and-supersede semantics. Preserve facts, assumptions, calculations, inferences, sources, artifacts, confidence, open items, and superseded records separately. Reconcile actual holdings to a dated bank or depositary source before labelling them actual. Never store passwords, tokens, account identifiers, private certificates, unverifiable rumors, or undated market prices as durable truth.

## Quant research path

1. Define the research question and data contract.
2. Challenge hypotheses with TradingAgents and/or Vibe-Trading.
3. Run point-in-time backtests and robustness checks.
4. Rebuild finalists in NautilusTrader for deterministic validation.
5. Compare order and fill ledgers across engines.
6. Apply risk, compliance, licensing, and operational gates.
7. Paper trade with monitoring and kill switches.
8. Treat live activation as a separate explicitly approved project.

## Licensing and execution

TradingAgents is Apache-2.0, Vibe-Trading is MIT, NautilusTrader is LGPL-3.0-or-later, and Backtrader is GPL-3.0-or-later. Fincept Terminal is license-gated: EGONON SA business or internal use requires an executed commercial-license reference.

Live trading is disabled by default. Installation, research, backtesting, and paper trading do not authorize real-capital execution.
