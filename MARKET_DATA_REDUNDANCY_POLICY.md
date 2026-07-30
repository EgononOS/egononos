# EGONON OS Market Data Redundancy Policy

Status: mandatory for Bottleneck Portfolio CIO and Challenger Lab.

## 1. Principle

No critical market datum may become the source of truth because one provider returned a number. Every production analysis must preserve the raw observations, source timestamp, market timestamp, adjustment convention, venue, currency, and provider lineage.

Critical data include:

- open, high, low, close, last, bid, ask, NAV and volume;
- FX rates used for valuation or order sizing;
- dividends, splits, spin-offs, symbol changes, delistings and ADR ratios;
- instrument identifiers, exchange venue and trading currency;
- shares outstanding and fundamental fields used in valuation;
- benchmark levels and constituent histories.

## 2. Required redundancy

### Historical analytics and backtests

Minimum standard: three fresh observations from at least two independent processing pipelines. At least one inlier must be an exchange/direct/execution authority source.

Preferred four-source stack:

1. direct/exchange or consolidated-feed source;
2. independent commercial market-data vendor;
3. second independent commercial vendor;
4. public or secondary fallback used only as a verifier.

A backtest is blocked when fewer than two independent pipelines agree. A two-source match is `REVIEW`, not `PASS`.

### Execution and bank orders

Minimum standard: four fresh observations from at least three pipeline groups. One agreeing observation must be the broker, bank, depositary, or executable quote source.

A model price is never a substitute for an executable price. When execution quorum fails, trade status is `NO TRADE` or `INDICATIVE ORDER`.

### Corporate actions

Require at least two confirmations, including one primary authority:

- issuer investor-relations notice;
- exchange notice;
- regulator filing;
- prospectus or official corporate-action document.

A vendor feed may confirm a corporate action but cannot be the sole authority.

### Identifiers and security master

Require at least two of:

- official exchange or issuer document;
- OpenFIGI mapping;
- regulator filing;
- bank/depositary security master;
- licensed institutional reference-data service.

Ticker alone is never a durable key. The preferred keys are ISIN plus FIGI plus venue/MIC plus share class.

### FX

For portfolio valuation, use at least three sources. For bank orders, the bank execution rate or executable quote is authoritative and must be reconciled against two reference sources.

ECB and SNB rates are reference rates, not guaranteed transaction prices.

## 3. Provider architecture

### Tier A - execution and institutional truth

Use when licensed or supplied by the bank/client:

- bank and depositary reports;
- broker executable quotes and trade confirmations;
- Bloomberg, LSEG, FactSet, ICE or equivalent institutional services.

These sources are not assumed to be connected. Credentials and contracts must be verified before use.

### Tier B - direct or consolidated market feeds

- Databento: direct venue feeds, SIPs, point-in-time instrument definitions, trades, quotes, OHLCV, closing prices, dividends and splits.
- Polygon: US equities, consolidated and venue data, snapshots, aggregates, reference data and corporate actions.

### Tier C - independent EOD and global vendors

- Tiingo: US equity EOD raw and adjusted prices with corporate-action error checks.
- EODHD: broad global EOD coverage across equities, ETFs, funds, indices, FX and crypto.
- Twelve Data: multi-asset time series and FIGI-based requests.
- Alpha Vantage: global daily and adjusted daily series; use primarily as a fallback because plan limits and endpoint entitlements vary.

### Tier D - authoritative public reference sources

- SEC EDGAR APIs for US filings, XBRL facts, ticker/CIK/exchange associations and filing history.
- OpenFIGI v3 for identifier mapping.
- ECB Data Portal for euro reference FX and macro series.
- SNB Data Portal for CHF reference rates and Swiss macro/market statistics.
- issuer investor-relations pages and official exchange notices for corporate actions.

Tier D sources may validate reference data and corporate actions but do not replace a licensed real-time price source.

## 4. Independence rules

Multiple APIs must not be counted as independent merely because they have different brand names. Each observation records:

- `source`: provider name;
- `pipeline_group`: processing/upstream lineage;
- `authority`: execution, exchange, direct, vendor or public;
- `market_timestamp`;
- `observed_at`;
- `adjusted` status;
- currency and venue.

Three observations from one shared upstream pipeline count as one pipeline group for quorum purposes.

## 5. Reconciliation rules

1. Compare only like-for-like values: same venue, timestamp, currency and adjusted/unadjusted convention.
2. Use the median of agreeing independent sources, never the first response.
3. Exclude stale observations before calculating consensus.
4. Flag outliers and preserve them in the audit trail.
5. Never silently forward-fill prices through a suspension or delisting.
6. Never combine adjusted and unadjusted histories.
7. Rebuild total returns from validated dividends and splits when provider adjusted series disagree.
8. Store raw vendor payload hashes when practical.

Default tolerances are starting controls, not universal truths:

- EOD equity OHLC: 25 bps;
- FX reference rates: 5 bps;
- NAV: 10 bps;
- volume: 5%;
- live execution fields: 10-15 bps at the same timestamp.

The tolerance must be tightened or widened by liquidity, market, timestamp precision and instrument type. Any override must be documented.

## 6. Point-in-time requirements

Market-data redundancy does not eliminate survivorship or look-ahead bias. A valid point-in-time backtest additionally requires:

- historical universe membership;
- delisted securities;
- symbol and venue history;
- corporate actions as known on each date;
- filing publication timestamps;
- no use of revised fundamentals before their release date;
- no retroactive selection of current winners.

## 7. Operational statuses

- `PASS`: full source and pipeline quorum within tolerance.
- `REVIEW`: at least two independent sources agree, but the production threshold is not met.
- `FAIL`: insufficient independent sources, stale data, required authority missing or material divergence.

`REVIEW` data may support exploratory research but cannot support execution-ready orders. `FAIL` data cannot support performance claims, optimization, attribution or trading.

## 8. Current credential status

As of implementation, no external paid market-data API key is assumed to exist in the runtime. Provider entries are capabilities and integration targets, not claims of active access.

Each adapter must expose a health check and record:

- authentication status;
- entitlement and delay;
- last successful request;
- symbols and venues covered;
- rate-limit status;
- data freshness;
- corporate-action support;
- adjusted/unadjusted methodology.

## 9. Source documentation

- Databento: https://databento.com/docs
- Polygon Stocks API: https://polygon.io/docs/rest/stocks/overview
- Tiingo EOD: https://www.tiingo.com/documentation/end-of-day
- EODHD EOD API: https://eodhd.com/financial-apis/api-for-historical-data-and-volumes
- Twelve Data: https://twelvedata.com/docs/introduction/overview
- Alpha Vantage: https://www.alphavantage.co/documentation/
- OpenFIGI v3: https://www.openfigi.com/api/documentation
- SEC EDGAR APIs: https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- ECB Data API: https://data.ecb.europa.eu/help/api/overview
- SNB Data Portal: https://data.snb.ch/en
