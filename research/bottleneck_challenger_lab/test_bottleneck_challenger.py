import numpy as np
import pandas as pd

from bottleneck_challenger import (
    arithmetic_attribution,
    champion_challenger,
    performance_metrics,
    validate_prices,
    walk_forward_backtest,
)


def make_prices(seed=7):
    rng = np.random.default_rng(seed)
    idx = pd.bdate_range("2020-01-01", periods=800)
    shocks = rng.normal(0.0004, 0.015, size=(800, 8))
    prices = 100 * np.exp(np.cumsum(shocks, axis=0))
    return pd.DataFrame(prices, index=idx, columns=[f"A{i}" for i in range(8)])


def test_pipeline():
    prices = make_prices()
    quality = validate_prices(prices)
    assert quality["assets"] == 8
    result = walk_forward_backtest(prices, lookback=252, rebalance_every=21, max_weight=0.25)
    assert len(result.returns) == len(prices)
    assert np.isfinite(result.returns).all()
    assert (result.weights.sum(axis=1) <= 1.000001).all()
    contrib = arithmetic_attribution(result.weights, prices.pct_change(fill_method=None))
    assert "TOTAL" in contrib.index
    metrics = performance_metrics(result.returns.iloc[252:])
    assert "max_drawdown" in metrics
    battle = champion_challenger(
        result.returns.iloc[252:],
        result.returns.iloc[252:] + 0.00001,
        out_of_sample_start=prices.index[600],
    )
    assert {"FULL", "OUT_OF_SAMPLE"}.issubset(set(battle["window"]))


if __name__ == "__main__":
    test_pipeline()
    print("SMOKE TEST PASSED")
