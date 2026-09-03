import { MarketHistoryService } from "../market/market-history.service.js";
import { calculateEma } from "./ema.service.js";
import { calculateRsi } from "./rsi.service.js";
import { calculateSma } from "./sma.service.js";

export type SmaIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{ datetime: string; close: number; sma: number | null }>;
};

export type EmaIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{ datetime: string; close: number; ema: number | null }>;
};

export type RsiIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{ datetime: string; close: number; rsi: number | null }>;
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

  async getEma(symbol: string, interval: string, period: number): Promise<EmaIndicatorResult> {
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const history = await this.marketHistoryService
      .getPersistedHistory(normalizedSymbol, interval, 200)
      .catch(async () => this.marketHistoryService.getHistory(normalizedSymbol, interval, 200));
    const emaValues = calculateEma(history.data.map((entry) => entry.close), period);

    return {
      symbol: history.symbol,
      interval: history.interval,
      period,
      values: history.data.map((entry, index) => ({
        datetime: entry.datetime,
        close: entry.close,
        ema: emaValues[index]
      }))
    };
  }

  async getRsi(symbol: string, interval: string, period: number): Promise<RsiIndicatorResult> {
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const history = await this.marketHistoryService
      .getPersistedHistory(normalizedSymbol, interval, 200)
      .catch(async () => this.marketHistoryService.getHistory(normalizedSymbol, interval, 200));
    const rsiValues = calculateRsi(history.data.map((entry) => entry.close), period);

    return {
      symbol: history.symbol,
      interval: history.interval,
      period,
      values: history.data.map((entry, index) => ({
        datetime: entry.datetime,
        close: entry.close,
        rsi: rsiValues[index]
      }))
    };
  }
}
