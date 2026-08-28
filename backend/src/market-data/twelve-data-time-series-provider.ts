import { TwelveDataProviderError } from "./twelve-data-provider-error.js";


export type MarketCandle = {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

export type MarketTimeSeries = {
  source: "twelve-data";
  symbol: string;
  interval: string;
  data: MarketCandle[];
};

type TwelveDataTimeSeriesResponse = {
  code?: number;
  message?: string;
  status?: string;
  meta?: {
    symbol?: string;
    interval?: string;
  };
  values?: Array<{
    datetime?: string;
    open?: string;
    high?: string;
    low?: string;
    close?: string;
    volume?: string;
  }>;
};

export class TwelveDataTimeSeriesProvider {
  private readonly baseUrl =
    "https://api.twelvedata.com/time_series";

  constructor(private readonly apiKey: string | undefined) {}

  async getTimeSeries(
    symbol: string,
    interval: string,
    outputsize: number
  ): Promise<MarketTimeSeries> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error("SYMBOL_REQUIRED");
    }

    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY_MISSING");
    }

    const url = new URL(this.baseUrl);

    url.searchParams.set("symbol", normalizedSymbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", String(outputsize));
    url.searchParams.set("apikey", this.apiKey);

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new TwelveDataProviderError(
        "Market data provider is unavailable.",
        502
      );
    }

    const payload =
      (await response.json()) as TwelveDataTimeSeriesResponse;

    if (
      !response.ok ||
      payload.status === "error" ||
      payload.code
    ) {
      const statusCode =
        response.status === 429
          ? 429
          : response.status >= 400 && response.status < 500
            ? 400
            : 502;

      throw new TwelveDataProviderError(
        payload.message ??
          "Market data provider returned an error.",
        statusCode
      );
    }

    if (
      !payload.values ||
      !payload.meta?.symbol ||
      !payload.meta?.interval
    ) {
      throw new TwelveDataProviderError(
        "Market data provider returned incomplete historical data.",
        502
      );
    }

    const data: MarketCandle[] = [];

    for (const value of payload.values) {
      const open = toNumber(value.open);
      const high = toNumber(value.high);
      const low = toNumber(value.low);
      const close = toNumber(value.close);

      if (
        !value.datetime ||
        open === null ||
        high === null ||
        low === null ||
        close === null
      ) {
        continue;
      }

      data.push({
        datetime: value.datetime,
        open,
        high,
        low,
        close,
        volume: toNumber(value.volume)
      });
    }

    if (data.length === 0) {
      throw new TwelveDataProviderError(
        "Market data provider returned no valid historical data.",
        502
      );
    }

    return {
      source: "twelve-data",
      symbol: payload.meta.symbol,
      interval: payload.meta.interval,
      data
    };
  }
}


function toNumber(value: string | undefined): number | null {
  if (value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}