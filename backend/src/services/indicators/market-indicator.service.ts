// backend/src/services/indicators/market-indicator.service.ts
import { MarketHistoryService } from "../market/market-history.service.js";
import { calculateEma } from "./ema.service.js";
import { calculateRsi } from "./rsi.service.js";
import { calculateSma } from "./sma.service.js";

export type SmaIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{
    datetime: string;
    close: number;
    sma: number | null;
  }>;
};

export type EmaIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{
    datetime: string;
    close: number;
    ema: number | null;
  }>;
};

export type RsiIndicatorResult = {
  symbol: string;
  interval: string;
  period: number;
  values: Array<{
    datetime: string;
    close: number;
    rsi: number | null;
  }>;
};

export class MarketIndicatorService {
  constructor(
    private readonly marketHistoryService = new MarketHistoryService()
  ) {}

  async getSma(
    symbol: string,
    interval: string,
    period: number
  ): Promise<SmaIndicatorResult> {
    this.validatePeriod(period);

    const history =
      await this.marketHistoryService.getPersistedHistory(
        symbol,
        interval,
        200
      );

    const closeValues = history.data.map(
      (entry) => entry.close
    );

    const smaValues = calculateSma(
      closeValues,
      period
    );

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

  async getEma(
    symbol: string,
    interval: string,
    period: number
  ): Promise<EmaIndicatorResult> {
    this.validatePeriod(period);

    const history =
      await this.marketHistoryService.getPersistedHistory(
        symbol,
        interval,
        200
      );

    const closeValues = history.data.map(
      (entry) => entry.close
    );

    const emaValues = calculateEma(
      closeValues,
      period
    );

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

  async getRsi(
    symbol: string,
    interval: string,
    period: number
  ): Promise<RsiIndicatorResult> {
    this.validatePeriod(period);

    const history =
      await this.marketHistoryService.getPersistedHistory(
        symbol,
        interval,
        200
      );

    const closeValues = history.data.map(
      (entry) => entry.close
    );

    const rsiValues = calculateRsi(
      closeValues,
      period
    );

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

  private validatePeriod(period: number): void {
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error(
        "PERIOD_MUST_BE_POSITIVE_INTEGER"
      );
    }
  }
}