from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from scipy.optimize import minimize


@dataclass(frozen=True)
class BacktestResult:
    returns: pd.Series
    weights: pd.DataFrame
    turnover: pd.Series
    costs: pd.Series


def validate_prices(prices: pd.DataFrame) -> dict[str, object]:
    """Validate a point-in-time price matrix without silently filling gaps."""
    if not isinstance(prices.index, pd.DatetimeIndex):
        raise TypeError("prices index must be a DatetimeIndex")
    if not prices.index.is_monotonic_increasing:
        raise ValueError("prices index must be monotonic increasing")
    if prices.index.has_duplicates:
        raise ValueError("prices index contains duplicate timestamps")
    if prices.columns.has_duplicates:
        raise ValueError("prices columns contain duplicate assets")
    if (prices <= 0).any().any():
        raise ValueError("prices must be strictly positive where observed")

    missing = prices.isna().mean().sort_values(ascending=False)
    stale = prices.ffill().diff().eq(0).mean().sort_values(ascending=False)
    return {
        "rows": int(len(prices)),
        "assets": int(prices.shape[1]),
        "start": prices.index.min(),
        "end": prices.index.max(),
        "missing_fraction": missing,
        "stale_fraction": stale,
        "late_inception": prices.apply(pd.Series.first_valid_index),
        "early_termination": prices.apply(pd.Series.last_valid_index),
    }


def portfolio_drawdown(returns: pd.Series) -> pd.Series:
    wealth = (1.0 + returns.fillna(0.0)).cumprod()
    return wealth / wealth.cummax() - 1.0


def max_drawdown(returns: pd.Series) -> float:
    return float(portfolio_drawdown(returns).min())


def cvar(losses: np.ndarray, alpha: float = 0.95) -> float:
    losses = np.asarray(losses, dtype=float)
    if losses.size == 0:
        return np.nan
    var = np.quantile(losses, alpha)
    tail = losses[losses >= var]
    return float(tail.mean()) if tail.size else float(var)


def cdar(returns: pd.Series, alpha: float = 0.95) -> float:
    losses = -portfolio_drawdown(returns).to_numpy()
    return cvar(losses, alpha=alpha)


def _clean_training_returns(train: pd.DataFrame, min_obs: int) -> pd.DataFrame:
    complete = train.loc[:, train.notna().sum() >= min_obs]
    if complete.empty:
        raise ValueError("no asset has enough point-in-time observations")
    return complete.dropna(how="any")


def optimize_cvar_weights(
    train_returns: pd.DataFrame,
    *,
    alpha: float = 0.95,
    max_weight: float = 0.15,
    min_weight: float = 0.0,
    l2_penalty: float = 0.02,
    prior_weights: pd.Series | None = None,
) -> pd.Series:
    """Long-only historical CVaR optimizer using only training-window observations."""
    r = train_returns.to_numpy(dtype=float)
    n = r.shape[1]
    if n == 0 or r.shape[0] < 20:
        raise ValueError("insufficient training data")

    x0 = np.repeat(1.0 / n, n)
    if prior_weights is not None:
        aligned = prior_weights.reindex(train_returns.columns).fillna(0.0).to_numpy()
        if aligned.sum() > 0:
            x0 = aligned / aligned.sum()

    def objective(w: np.ndarray) -> float:
        portfolio_returns = r @ w
        loss = -portfolio_returns
        risk = cvar(loss, alpha=alpha)
        regularization = l2_penalty * float(np.sum(w * w))
        return risk + regularization

    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0},)
    bounds = [(min_weight, max_weight) for _ in range(n)]
    result = minimize(objective, x0, method="SLSQP", bounds=bounds, constraints=constraints)
    if not result.success:
        raise RuntimeError(f"CVaR optimization failed: {result.message}")
    return pd.Series(result.x, index=train_returns.columns, name="weight")


def walk_forward_backtest(
    prices: pd.DataFrame,
    *,
    lookback: int = 252,
    rebalance_every: int = 21,
    min_obs: int = 126,
    alpha: float = 0.95,
    max_weight: float = 0.15,
    transaction_cost_bps: float = 10.0,
) -> BacktestResult:
    """Causal walk-forward backtest; each decision uses data available before the rebalance."""
    validate_prices(prices)
    asset_returns = prices.pct_change(fill_method=None)
    dates = asset_returns.index
    weights = pd.DataFrame(0.0, index=dates, columns=prices.columns)
    turnover = pd.Series(0.0, index=dates, name="turnover")
    costs = pd.Series(0.0, index=dates, name="cost")
    current = pd.Series(0.0, index=prices.columns)

    for i in range(lookback, len(dates), rebalance_every):
        decision_date = dates[i]
        train = asset_returns.iloc[max(1, i - lookback):i]
        clean = _clean_training_returns(train, min_obs=min_obs)
        target = optimize_cvar_weights(
            clean,
            alpha=alpha,
            max_weight=max_weight,
            prior_weights=current,
        ).reindex(prices.columns).fillna(0.0)
        trade = (target - current).abs().sum()
        turnover.loc[decision_date] = float(trade)
        costs.loc[decision_date] = float(trade * transaction_cost_bps / 10000.0)
        current = target
        end = min(i + rebalance_every, len(dates))
        weights.iloc[i:end] = current.to_numpy()

    gross = (weights.shift(1).fillna(0.0) * asset_returns.fillna(0.0)).sum(axis=1)
    net = gross - costs
    net.name = "portfolio_return"
    return BacktestResult(returns=net, weights=weights, turnover=turnover, costs=costs)


def arithmetic_attribution(weights: pd.DataFrame, asset_returns: pd.DataFrame) -> pd.DataFrame:
    """Single-period arithmetic contribution by asset; weights are lagged to prevent leakage."""
    aligned_w, aligned_r = weights.align(asset_returns, join="inner", axis=0)
    aligned_w, aligned_r = aligned_w.align(aligned_r, join="inner", axis=1)
    contributions = aligned_w.shift(1).fillna(0.0) * aligned_r.fillna(0.0)
    contributions.loc["TOTAL"] = contributions.sum(axis=0)
    return contributions


def performance_metrics(returns: pd.Series, periods_per_year: int = 252) -> dict[str, float]:
    r = returns.dropna()
    if r.empty:
        raise ValueError("returns are empty")
    wealth = float((1 + r).prod())
    years = len(r) / periods_per_year
    cagr = wealth ** (1 / years) - 1 if years > 0 else np.nan
    vol = float(r.std(ddof=1) * np.sqrt(periods_per_year))
    downside = float(r[r < 0].std(ddof=1) * np.sqrt(periods_per_year))
    return {
        "total_return": wealth - 1,
        "cagr": float(cagr),
        "volatility": vol,
        "sharpe_0rf": float(cagr / vol) if vol > 0 else np.nan,
        "sortino_0rf": float(cagr / downside) if downside > 0 else np.nan,
        "max_drawdown": max_drawdown(r),
        "cvar_95_daily": cvar(-r.to_numpy(), 0.95),
        "cdar_95": cdar(r, 0.95),
    }


def champion_challenger(
    champion: pd.Series,
    challenger: pd.Series,
    *,
    out_of_sample_start: str | pd.Timestamp,
) -> pd.DataFrame:
    """Compare aligned returns and explicitly separate full-history and out-of-sample evidence."""
    aligned = pd.concat({"champion": champion, "challenger": challenger}, axis=1).dropna()
    oos = aligned.loc[pd.Timestamp(out_of_sample_start):]
    rows: list[dict[str, object]] = []
    for window, data in (("FULL", aligned), ("OUT_OF_SAMPLE", oos)):
        if data.empty:
            continue
        cm = performance_metrics(data["champion"])
        qm = performance_metrics(data["challenger"])
        for metric in cm:
            higher_is_better = metric not in {"volatility", "cvar_95_daily", "cdar_95"}
            if metric == "max_drawdown":
                higher_is_better = True
            cval, qval = cm[metric], qm[metric]
            winner = "challenger" if (qval > cval if higher_is_better else qval < cval) else "champion"
            rows.append({
                "window": window,
                "metric": metric,
                "champion": cval,
                "challenger": qval,
                "winner": winner,
            })
    return pd.DataFrame(rows)
