import { pool } from "../database/postgres.js";
import type { MarketAsset } from "../models/market-candle.js";

export class AssetRepository {
  /**
   * Obtiene todos los activos de la base de datos
   */
  async getAllAssets(): Promise<MarketAsset[]> {
    const result = await pool.query<{
      id: number;
      symbol: string;
      source: string;
      asset_type: string;
      name: string | null;
      exchange: string | null;
      currency: string | null;
      created_at: string;
    }>(
      `
        SELECT 
          id, 
          symbol, 
          source, 
          asset_type, 
          name, 
          exchange, 
          currency, 
          created_at
        FROM market_assets
        ORDER BY symbol ASC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      symbol: row.symbol,
      source: row.source,
      name: row.name,
      exchange: row.exchange,
      currency: row.currency,
      assetType: row.asset_type,
      createdAt: row.created_at
    }));
  }

  /**
   * Obtiene un activo específico por símbolo
   */
  async getAssetBySymbol(symbol: string): Promise<MarketAsset | null> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const result = await pool.query<{
      id: number;
      symbol: string;
      source: string;
      asset_type: string;
      name: string | null;
      exchange: string | null;
      currency: string | null;
      created_at: string;
    }>(
      `
        SELECT 
          id, 
          symbol, 
          source, 
          asset_type, 
          name, 
          exchange, 
          currency, 
          created_at
        FROM market_assets
        WHERE symbol = $1
      `,
      [normalizedSymbol]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      symbol: row.symbol,
      source: row.source,
      name: row.name,
      exchange: row.exchange,
      currency: row.currency,
      assetType: row.asset_type,
      createdAt: row.created_at
    };
  }

  /**
   * Obtiene información detallada de un activo con estadísticas
   */
  async getAssetWithStats(symbol: string): Promise<
    | (MarketAsset & {
        candlesCount: number;
        firstCandle: string | null;
        lastCandle: string | null;
      })
    | null
  > {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const result = await pool.query<{
      id: number;
      symbol: string;
      source: string;
      asset_type: string;
      name: string | null;
      exchange: string | null;
      currency: string | null;
      created_at: string;
      candles_count: string;
      first_candle: string | null;
      last_candle: string | null;
    }>(
      `
        SELECT 
          ma.id, 
          ma.symbol, 
          ma.source, 
          ma.asset_type, 
          ma.name, 
          ma.exchange, 
          ma.currency, 
          ma.created_at,
          COUNT(mc.id)::TEXT as candles_count,
          MIN(mc.candle_time)::TEXT as first_candle,
          MAX(mc.candle_time)::TEXT as last_candle
        FROM market_assets ma
        LEFT JOIN market_candles mc ON ma.id = mc.asset_id
        WHERE ma.symbol = $1
        GROUP BY ma.id
      `,
      [normalizedSymbol]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      symbol: row.symbol,
      source: row.source,
      name: row.name,
      exchange: row.exchange,
      currency: row.currency,
      assetType: row.asset_type,
      createdAt: row.created_at,
      candlesCount: Number(row.candles_count),
      firstCandle: row.first_candle,
      lastCandle: row.last_candle
    };
  }
}
