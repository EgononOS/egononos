# Bottleneck Challenger Lab

Purpose-built, auditable research layer for `Bottleneck Portfolio CIO`.

## Scope

- point-in-time and causal walk-forward backtesting;
- historical CVaR sizing with explicit weight caps;
- drawdown, CVaR and CDaR metrics;
- arithmetic performance attribution;
- data-quality diagnostics for missing, stale, late-inception and early-termination series;
- champion-challenger comparison with an explicit out-of-sample boundary.

## Design decision

This implementation uses only the scientific stack already available in the EGONON runtime (`numpy`, `pandas`, `scipy`, `scikit-learn`). It does not claim that optional third-party engines are installed.

External projects were used as architectural references, not copied as source code:

- `skfolio/skfolio`: preferred future engine for walk-forward, combinatorial purged cross-validation, CVaR/CDaR and model selection;
- `cvxgrp/cvxportfolio`: preferred reference for causal backtesting, transaction costs and multi-period policies;
- `unionai-oss/pandera`: preferred future data-contract validator;
- `stefan-jansen/pyfolio-reloaded`: preferred future tear-sheet and out-of-sample reporting layer;
- `dcajasn/Riskfolio-Lib`: optional specialist optimizer, not a core dependency because of its broad compiled/dependency footprint.

## Current compatibility

Validated on Python 3.13.5 with:

- numpy 2.3.5
- pandas 2.2.3
- scipy 1.17.0
- scikit-learn 1.8.0

Smoke test: `python test_bottleneck_challenger.py`

## Methodological limits

- Historical CVaR optimization is not a forecast.
- A point-in-time price matrix does not by itself remove survivorship bias; the security universe must also be point-in-time.
- Corporate actions, delistings, ADR ratios, FX, dividends and identifier history must be supplied by a validated data source.
- `FULL` results are not sufficient to promote a challenger. Promotion requires `OUT_OF_SAMPLE` evidence and, where applicable, real-money implementation.
