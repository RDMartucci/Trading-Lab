// backend/src/services/market/market-history.service.ts
import { env } from "../../config/env.js";
import { TwelveDataTimeSeriesProvider } from "../../market-data/twelve-data-time-series-provider.js";
import type { MarketTimeSeries } from "../../market-data/twelve-data-time-series-provider.js";
import { MarketCandleRepository } from "../../repositories/market-candle.repository.js";

export class MarketHistoryService {
  constructor(
    private readonly provider = new TwelveDataTimeSeriesProvider(
      env.twelveData.apiKey
    ),
    private readonly repository = new MarketCandleRepository()
  ) { }

  /**
   * Obtiene histórico directamente desde Twelve Data.
   *
   * IMPORTANTE:
   * Este método solamente consulta el proveedor.
   * No modifica PostgreSQL.
   */
  async getHistory(
    symbol: string,
    interval: string,
    outputsize: number
  ): Promise<MarketTimeSeries> {
    return this.provider.getTimeSeries(
      symbol,
      interval,
      outputsize
    );
  }

  /**
   * Obtiene histórico previamente persistido en PostgreSQL.
   */
  async getPersistedHistory(
    symbol: string,
    interval: string,
    limit = 30
  ): Promise<MarketTimeSeries> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error("SYMBOL_REQUIRED");
    }

    const data = await this.repository.getHistoryBySymbol(
      normalizedSymbol,
      interval,
      limit
    );

    if (data.length === 0) {
      throw new Error("HISTORY_NOT_FOUND");
    }

    return {
      source: "twelve-data",
      symbol: normalizedSymbol,
      interval,
      data
    };

  }

  /**
   * Sincroniza histórico desde Twelve Data hacia PostgreSQL.
   */
  async syncHistory(
    symbol: string,
    interval: string,
    outputsize = 30
  ) {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error("SYMBOL_REQUIRED");
    }

    const history = await this.provider.getTimeSeries(
      normalizedSymbol,
      interval,
      outputsize
    );

    const candlesInserted =
      await this.repository.upsertHistory(history);

    return {
      symbol: normalizedSymbol,
      interval,
      candlesInserted,
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}