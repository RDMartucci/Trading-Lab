import { env } from "../../config/env.js";
import { TwelveDataTimeSeriesProvider } from "../../market-data/twelve-data-time-series-provider.js";
import type { MarketTimeSeries } from "../../market-data/twelve-data-time-series-provider.js";
import { MarketCandleRepository } from "../../repositories/market-candle.repository.js";

export class MarketHistoryService {
  constructor(
    private readonly provider = new TwelveDataTimeSeriesProvider(env.twelveData.apiKey),
    private readonly repository = new MarketCandleRepository()
  ) {}

  async getHistory(
    symbol: string,
    interval: string,
    outputsize: number
  ): Promise<MarketTimeSeries> {
    const history = await this.provider.getTimeSeries(symbol, interval, outputsize);
    await this.repository.upsertHistory(history);
    return history;
  }

  async getPersistedHistory(
    symbol: string,
    interval: string,
    limit = 30
  ): Promise<MarketTimeSeries> {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const data = await this.repository.getHistoryBySymbol(normalizedSymbol, interval, limit);

    return {
      source: "twelve-data",
      symbol: normalizedSymbol,
      interval,
      data
    };
  }

  async syncHistory(
    symbol: string,
    interval: string,
    outputsize = 30
  ): Promise<{
    symbol: string;
    interval: string;
    candlesInserted: number;
    status: "ok";
    timestamp: string;
  }> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const history = await this.provider.getTimeSeries(
      normalizedSymbol,
      interval,
      outputsize
    );
    const candlesInserted = await this.repository.upsertHistory(history);

    return {
      symbol: normalizedSymbol,
      interval,
      candlesInserted,
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
