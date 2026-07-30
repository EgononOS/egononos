"""Market-data quorum and reconciliation controls for Bottleneck CIO.

The module is provider-agnostic. Adapters must normalize observations into the
MarketObservation dataclass. No network access is performed here.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from statistics import median
from typing import Iterable


class QuorumStatus(str, Enum):
    PASS = "PASS"
    REVIEW = "REVIEW"
    FAIL = "FAIL"


@dataclass(frozen=True)
class MarketObservation:
    symbol: str
    field: str
    value: float
    currency: str
    venue: str
    source: str
    pipeline_group: str
    authority: str
    market_timestamp: datetime
    observed_at: datetime
    adjusted: bool = False

    def age_seconds(self, now: datetime | None = None) -> float:
        reference = now or datetime.now(timezone.utc)
        timestamp = self.market_timestamp
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        return max(0.0, (reference - timestamp).total_seconds())


@dataclass(frozen=True)
class QuorumResult:
    status: QuorumStatus
    consensus: float | None
    accepted_sources: tuple[str, ...]
    accepted_pipeline_groups: tuple[str, ...]
    rejected_sources: tuple[str, ...]
    max_deviation_bps: float | None
    reason: str


def _deviation_bps(value: float, center: float) -> float:
    if center == 0:
        return 0.0 if value == 0 else float("inf")
    return abs(value - center) / abs(center) * 10_000.0


def reconcile_market_data(
    observations: Iterable[MarketObservation],
    *,
    tolerance_bps: float,
    max_age_seconds: float,
    min_sources_review: int = 2,
    min_sources_pass: int = 3,
    min_pipelines_pass: int = 2,
    required_authority_for_pass: set[str] | None = None,
    now: datetime | None = None,
) -> QuorumResult:
    """Return a conservative consensus and quorum status.

    Observations are comparable only when symbol, field, currency, venue and
    adjustment convention match. Stale records are rejected before consensus.
    The median is used as the robust center. Sources outside tolerance are
    rejected and preserved in the result.
    """

    records = list(observations)
    if not records:
        return QuorumResult(
            status=QuorumStatus.FAIL,
            consensus=None,
            accepted_sources=(),
            accepted_pipeline_groups=(),
            rejected_sources=(),
            max_deviation_bps=None,
            reason="No observations supplied",
        )

    key = (
        records[0].symbol,
        records[0].field,
        records[0].currency,
        records[0].venue,
        records[0].adjusted,
    )
    comparable: list[MarketObservation] = []
    rejected: list[MarketObservation] = []
    for item in records:
        item_key = (
            item.symbol,
            item.field,
            item.currency,
            item.venue,
            item.adjusted,
        )
        if item_key != key or item.age_seconds(now) > max_age_seconds:
            rejected.append(item)
        else:
            comparable.append(item)

    if len(comparable) < min_sources_review:
        return QuorumResult(
            status=QuorumStatus.FAIL,
            consensus=None,
            accepted_sources=tuple(sorted({x.source for x in comparable})),
            accepted_pipeline_groups=tuple(
                sorted({x.pipeline_group for x in comparable})
            ),
            rejected_sources=tuple(sorted({x.source for x in rejected})),
            max_deviation_bps=None,
            reason="Insufficient fresh comparable sources",
        )

    center = median(x.value for x in comparable)
    inliers = [x for x in comparable if _deviation_bps(x.value, center) <= tolerance_bps]
    outliers = [x for x in comparable if x not in inliers]
    rejected.extend(outliers)

    if len(inliers) < min_sources_review:
        return QuorumResult(
            status=QuorumStatus.FAIL,
            consensus=None,
            accepted_sources=tuple(sorted({x.source for x in inliers})),
            accepted_pipeline_groups=tuple(sorted({x.pipeline_group for x in inliers})),
            rejected_sources=tuple(sorted({x.source for x in rejected})),
            max_deviation_bps=None,
            reason="No independent consensus within tolerance",
        )

    consensus = median(x.value for x in inliers)
    max_dev = max(_deviation_bps(x.value, consensus) for x in inliers)
    sources = {x.source for x in inliers}
    pipelines = {x.pipeline_group for x in inliers}
    authorities = {x.authority for x in inliers}
    authority_ok = not required_authority_for_pass or bool(
        authorities & required_authority_for_pass
    )

    if (
        len(sources) >= min_sources_pass
        and len(pipelines) >= min_pipelines_pass
        and authority_ok
    ):
        status = QuorumStatus.PASS
        reason = "Full source, pipeline and authority quorum met"
    else:
        status = QuorumStatus.REVIEW
        reason = "Independent consensus exists, but production quorum is incomplete"

    return QuorumResult(
        status=status,
        consensus=consensus,
        accepted_sources=tuple(sorted(sources)),
        accepted_pipeline_groups=tuple(sorted(pipelines)),
        rejected_sources=tuple(sorted({x.source for x in rejected})),
        max_deviation_bps=max_dev,
        reason=reason,
    )


def execution_price_quorum(
    observations: Iterable[MarketObservation],
    *,
    tolerance_bps: float = 15.0,
    max_age_seconds: float = 60.0,
    now: datetime | None = None,
) -> QuorumResult:
    """Execution gate: 4 sources, 3 pipelines and broker/bank/exchange authority."""

    return reconcile_market_data(
        observations,
        tolerance_bps=tolerance_bps,
        max_age_seconds=max_age_seconds,
        min_sources_review=2,
        min_sources_pass=4,
        min_pipelines_pass=3,
        required_authority_for_pass={"broker", "bank", "exchange", "execution"},
        now=now,
    )


def historical_price_quorum(
    observations: Iterable[MarketObservation],
    *,
    tolerance_bps: float = 25.0,
    max_age_seconds: float = 172_800.0,
    now: datetime | None = None,
) -> QuorumResult:
    """Historical analytics gate: 3 sources, 2 pipelines, direct authority inlier."""

    return reconcile_market_data(
        observations,
        tolerance_bps=tolerance_bps,
        max_age_seconds=max_age_seconds,
        min_sources_review=2,
        min_sources_pass=3,
        min_pipelines_pass=2,
        required_authority_for_pass={"exchange", "direct", "execution"},
        now=now,
    )
