# EGONON OS Quantitative Research Frontier Policy

Status: mandatory system-wide.

This policy applies first to the default AI-Driven Core and then to all nine optional named strategies. Bottleneck CIO is one optional strategy and has no privileged access to the quantitative infrastructure.

## 1. Core principle

EGONON OS must not confuse historical importance with current methodological leadership. Classical mean-variance optimization, the static efficient frontier, CAPM, Gaussian VaR, fixed-correlation models and single-regime covariance matrices remain diagnostic baselines and control models. They are not the default research frontier.

A method may be old and still useful. It may not be presented as advanced merely because it is mathematically elegant or widely taught.

## 2. Research freshness

The quantitative research engine must continuously prioritize peer-reviewed papers, working papers and reproducible implementations published or materially updated during the previous 48 months.

Older methods may be retained only when they serve as:

- a benchmark;
- a component inside a newer framework;
- a regulatory or industry standard;
- a proven robust fallback;
- a control against over-complexity.

Every quarterly model review must refresh the research scan and record:

- publication date;
- authors and institution;
- paper or journal identifier;
- code repository, when available;
- asset class and sample;
- assumptions;
- claimed contribution;
- reproduction status;
- out-of-sample evidence;
- transaction-cost treatment;
- data requirements;
- failure modes;
- EGONON adoption status.

## 3. Priority research families

The active research frontier includes, without being limited to:

1. distributionally robust optimization and Wasserstein ambiguity sets;
2. robust CVaR, CDaR and drawdown-aware optimization;
3. conformal prediction and calibrated predictive intervals;
4. differentiable optimization and decision-focused learning;
5. online learning, adaptive regret and non-stationary portfolio selection;
6. regime-aware, change-point and hidden-state models;
7. heavy-tail, copula, extreme-value and rare-jump modelling;
8. Bayesian and ensemble uncertainty quantification;
9. graph, network and supply-chain dependency models;
10. causal inference and event-study methods;
11. dynamic factor models and representation learning;
12. hierarchical and clustering-based allocation;
13. robust covariance, denoising and random-matrix methods;
14. reinforcement learning only where leakage, simulator bias and instability are controlled;
15. foundation and time-series models only when compared against strong simple baselines;
16. optimal transport and scenario generation;
17. multi-period optimization with market impact, turnover and tax-lot constraints;
18. synthetic stress generation and adversarial scenario testing;
19. probabilistic forecasting with proper scoring rules;
20. model-confidence weighting and champion-challenger ensembles.

## 4. Admission gate

No paper, model or repository enters production because it is recent, fashionable or has strong backtest results.

Admission requires:

- conceptual relevance to an EGONON decision;
- primary-source paper review;
- code inspection or independent reimplementation;
- license compatibility;
- deterministic environment and dependency record;
- reproducible smoke test;
- leakage and look-ahead audit;
- point-in-time data compatibility;
- walk-forward or purged cross-validation;
- transaction costs, turnover and liquidity treatment;
- comparison against simple and current baselines;
- sensitivity and ablation analysis;
- out-of-sample evidence;
- documented failure conditions.

A method that cannot be reproduced is classified `RESEARCH ONLY`.

## 5. Model statuses

- `DISCOVERED`: identified but not reviewed.
- `SCREENED`: paper and repository reviewed.
- `REPRODUCED`: core result or implementation reproduced.
- `CHALLENGER`: admitted to controlled comparison.
- `SHADOW`: runs on live data without controlling capital.
- `PRODUCTION`: approved for decision support.
- `RETIRED`: removed after decay, instability or superior replacement.
- `REJECTED`: failed methodological, licensing, data or operational gates.

## 6. Champion-challenger discipline

The current production method is the champion. New methods are challengers and must win on more than headline return.

Required dimensions:

- out-of-sample return;
- CVaR and drawdown;
- calibration;
- turnover and costs;
- stability across regimes;
- concentration and liquidity;
- parameter sensitivity;
- data dependence;
- interpretability;
- computational burden;
- operational reliability;
- real-money or shadow evidence.

No challenger is promoted from a retrospective full-history backtest alone.

## 7. Complexity penalty

A more complex method must demonstrate a material net advantage over simpler baselines. The burden of proof rises with:

- parameter count;
- data intensity;
- opacity;
- computational cost;
- dependency fragility;
- sensitivity to hyperparameters;
- difficulty of audit;
- inability to explain failure.

When performance is statistically or economically indistinguishable, prefer the simpler and more robust method.

## 8. AI-Driven Core routing

The AI-Driven Core owns the shared quantitative research layer. It selects the smallest effective method set for each decision.

Named strategies may impose their own objective functions, constraints and evidence hierarchy, but they consume the same validated data, research registry, model-risk controls and champion-challenger framework.

Examples:

- Bottleneck CIO may add supply-chain graphs and scarcity scoring.
- VITA may add CHF-aware multi-asset constraints and liability context.
- Macro Allocation may add regime and state-space models.
- Global Equity Scanner may add cross-sectional ranking and multiple-testing controls.
- ETF Optimizer may add holdings overlap and implementation-cost optimization.
- Risk Manager may run independent tail, liquidity and leverage models.
- Event Driven may add causal event studies and completion-probability models.
- Deep Value may add fundamental uncertainty and distress models.
- Quality Compounders may add persistence and reinvestment-runway models.

These are strategy-specific overlays, not separate data or model-governance systems.

## 9. Review cadence

- Monthly: monitor production model drift, data health and challenger results.
- Quarterly: scan the previous 48 months of research, update the registry and decide promotions or retirements.
- Event-driven: immediate review after material paper, model failure, regime break, data-source change or dependency vulnerability.

## 10. Initial 2024-2026 research directions

The first research queue includes:

- conformal predictive portfolio selection;
- distributionally robust optimization and ambiguity sets;
- scalable robust portfolio optimization;
- differentiable constrained optimization;
- online and adaptive portfolio selection;
- regime-aware covariance and dependence models;
- synthetic and adversarial stress generation.

These entries are research candidates, not production claims. Each must pass the admission gate.
