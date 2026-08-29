CREATE TABLE IF NOT EXISTS market_assets (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(64) NOT NULL UNIQUE,
    source VARCHAR(32) NOT NULL DEFAULT 'twelve-data',
    asset_type VARCHAR(32) NOT NULL DEFAULT 'stock',
    name VARCHAR(255),
    exchange VARCHAR(128),
    currency VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_candles (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES market_assets(id) ON DELETE CASCADE,
    source VARCHAR(32) NOT NULL DEFAULT 'twelve-data',
    timeframe VARCHAR(16) NOT NULL,
    candle_time TIMESTAMPTZ NOT NULL,
    open NUMERIC(18, 6) NOT NULL,
    high NUMERIC(18, 6) NOT NULL,
    low NUMERIC(18, 6) NOT NULL,
    close NUMERIC(18, 6) NOT NULL,
    volume NUMERIC(18, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, source, timeframe, candle_time)
);

CREATE INDEX IF NOT EXISTS idx_market_candles_asset_timeframe_time
    ON market_candles (asset_id, timeframe, candle_time);
