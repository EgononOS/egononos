# Verified component selection

## Decision matrix

| Component | Primary use | License | Python compatibility observed | Decision |
|---|---|---|---|---|
| skfolio/skfolio | Walk-forward, purged CV, CVaR/CDaR, robust optimization, model selection | BSD-3-Clause | Project declares Python >=3.10 and lists 3.10-3.13 support in README; current package metadata inspected | SELECTED AS PRIMARY OPTIONAL ENGINE |
| cvxgrp/cvxportfolio | Causal point-in-time backtesting, transaction costs, multi-period optimization | GPLv3 | README documents Python 3.8-3.12 testing | SELECTED AS REFERENCE / ISOLATED OPTIONAL ENGINE |
| unionai-oss/pandera | Dataframe schemas and data-quality contracts | MIT | Project declares Python >=3.10 through 3.14 | SELECTED AS OPTIONAL DATA QUALITY ENGINE |
| stefan-jansen/pyfolio-reloaded | Performance/risk tear sheets and in/out-of-sample reporting | Apache-2.0 | Project declares Python >=3.9 through 3.13 | SELECTED AS OPTIONAL REPORTING ENGINE |
| dcajasn/Riskfolio-Lib | CVaR, CDaR, EDaR, risk parity, factor risk attribution | BSD-3-Clause | Project declares Python >=3.10, but current release has broad and compiled dependencies | OPTIONAL, NOT CORE |
| polakowo/vectorbt | Fast vectorized research | Apache-2.0 historically; verify release before use | Not installed in current runtime | DEFERRED; unnecessary for monthly Bottleneck mandate |
| stefan-jansen/zipline-reloaded | Event-driven backtesting | Apache-2.0 lineage; verify installed release | Project documents Python >=3.9 | DEFERRED; heavier data-ingestion burden |

## Incorporation policy

1. Do not vendor or copy third-party implementation code into EGONON unless license review and attribution are complete.
2. Prefer adapters around installed packages.
3. Pin versions only after a clean-room environment smoke test.
4. Keep the native fallback implementation available for auditability.
5. Never label a package `installed` until import and representative test both pass in the target runtime.
