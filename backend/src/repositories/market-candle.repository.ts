// backend/src/repositories/market-candle.repository.ts
import { pool } from "../database/postgres.js";
import type { MarketCandle, MarketTimeSeries } from "../market-data/twelve-data-time-series-provider.js";

const DEFAULT_SOURCE = "twelve-data";

type MarketCandleRow = {
  candle_time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string | null;
};

export class MarketCandleRepository {
  async ensureAsset(symbol: string, source = DEFAULT_SOURCE): Promise<number> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const result = await pool.query<{ id: number }>(
      `
        INSERT INTO market_assets (symbol, source, asset_type)
        VALUES ($1, $2, 'stock')
        ON CONFLICT (symbol) DO UPDATE
        SET source = EXCLUDED.source
        RETURNING id
      `,
      [normalizedSymbol, source]
    );

    return Number(result.rows[0].id);
  }

  async upsertHistory(history: MarketTimeSeries): Promise<number> {
    if (history.data.length === 0) {
      return 0;
    }

    const assetId = await this.ensureAsset(history.symbol, history.source);
    const candleTimes = history.data.map((candle) => normalizeCandleTime(candle.datetime));
    const beforeCount = await this.countCandlesByTimes(
      assetId,
      history.source,
      history.interval,
      candleTimes
    );

    const rows: string[] = [];
    const params: unknown[] = [];

    history.data.forEach((candle, index) => {
      const rowIndex = index * 9;
      rows.push(`(
        $${rowIndex + 1},
        $${rowIndex + 2},
        $${rowIndex + 3},
        $${rowIndex + 4},
        $${rowIndex + 5},
        $${rowIndex + 6},
        $${rowIndex + 7},
        $${rowIndex + 8},
        $${rowIndex + 9}
      )`);

      params.push(
        assetId,
        history.source,
        history.interval,
        normalizeCandleTime(candle.datetime),
        candle.open,
        candle.high,
        candle.low,
        candle.close,
        candle.volume ?? null
      );
    });

    const query = `
      INSERT INTO market_candles (
        asset_id,
        source,
        timeframe,
        candle_time,
        open,
        high,
        low,
        close,
        volume
      )
      VALUES ${rows.join(", ")}
      ON CONFLICT (asset_id, source, timeframe, candle_time) DO UPDATE
      SET open = EXCLUDED.open,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          close = EXCLUDED.close,
          volume = EXCLUDED.volume
    `;

    await pool.query(query, params);

    const afterCount = await this.countCandlesByTimes(
      assetId,
      history.source,
      history.interval,
      candleTimes
    );

    return Math.max(0, afterCount - beforeCount);
  }

  private async countCandlesByTimes(
    assetId: number,
    source: string,
    interval: string,
    candleTimes: string[]
  ): Promise<number> {
    if (candleTimes.length === 0) {
      return 0;
    }

    const result = await pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::int AS count
        FROM market_candles
        WHERE asset_id = $1
          AND source = $2
          AND timeframe = $3
          AND candle_time = ANY($4)
      `,
      [assetId, source, interval, candleTimes]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async getHistoryBySymbol(
    symbol: string,
    interval: string,
    limit = 30
  ): Promise<MarketCandle[]> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const result = await pool.query<MarketCandleRow>(
      `
        SELECT mc.candle_time, mc.open, mc.high, mc.low, mc.close, mc.volume
        FROM market_candles mc
        INNER JOIN market_assets ma ON ma.id = mc.asset_id
        WHERE ma.symbol = $1
          AND mc.timeframe = $2
        ORDER BY mc.candle_time DESC
        LIMIT $3
      `,
      [normalizedSymbol, interval, limit]
    );

    const rows = [...result.rows].reverse();

    return rows.map((row) => ({
      datetime: row.candle_time,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: row.volume === null ? null : Number(row.volume)
    }));
  }
}

function normalizeCandleTime(datetime: string): string {
  const date = new Date(datetime);
  return Number.isNaN(date.getTime()) ? datetime : date.toISOString();
}
