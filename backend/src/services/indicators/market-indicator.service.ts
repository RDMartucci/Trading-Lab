import { MarketHistoryService } from "../market/market-history.service.js";
import { calculateSma } from "./sma.service.js";

export type SmaIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{ datetime: string; close: number; sma: number | null }>;
};

export class MarketIndicatorService {
  constructor(private readonly marketHistoryService = new MarketHistoryService()) {}

  async getSma(symbol: string, interval: string, period: number): Promise<SmaIndicatorResult> {
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const history = await this.marketHistoryService
      .getPersistedHistory(normalizedSymbol, interval, 200)
      .catch(async () => {
        const liveHistory = await this.marketHistoryService.getHistory(normalizedSymbol, interval, 200);
        return liveHistory;
      });

    const closeValues = history.data.map((entry) => entry.close);
    const smaValues = calculateSma(closeValues, period);

    return {
      symbol: history.symbol,
      interval: history.interval,
      period,
      values: history.data.map((entry, index) => ({
        datetime: entry.datetime,
        close: entry.close,
        sma: smaValues[index]
      }))
    };
  }
}
