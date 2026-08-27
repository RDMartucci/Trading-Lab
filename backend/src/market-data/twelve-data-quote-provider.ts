export type MarketQuote = {
  source: "twelve-data";
  symbol: string;
  name: string | null;
  exchange: string | null;
  currency: string | null;
  asOf: string | null;
  price: number;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};

type TwelveDataQuoteResponse = {
  code?: number;
  message?: string;
  status?: string;
  symbol?: string;
  name?: string;
  exchange?: string;
  currency?: string;
  datetime?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  previous_close?: string;
  open?: string;
  high?: string;
  low?: string;
  volume?: string;
};

export class TwelveDataProviderError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "TwelveDataProviderError";
  }
}

export class TwelveDataQuoteProvider {
  private readonly baseUrl = "https://api.twelvedata.com/quote";

  constructor(private readonly apiKey: string | undefined) {}

  async getQuote(symbol: string): Promise<MarketQuote> {
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol) {
      throw new Error("SYMBOL_REQUIRED");
    }

    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY_MISSING");
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set("symbol", normalizedSymbol);
    url.searchParams.set("apikey", this.apiKey);

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new TwelveDataProviderError("Market data provider is unavailable.", 502);
    }

    const payload = (await response.json()) as TwelveDataQuoteResponse;

    if (!response.ok || payload.status === "error" || payload.code) {
      const statusCode = response.status === 429 ? 429 : response.status >= 400 && response.status < 500 ? 400 : 502;
      throw new TwelveDataProviderError(payload.message ?? "Market data provider returned an error.", statusCode);
    }

    const price = toNumber(payload.close);
    if (price === null || !payload.symbol) {
      throw new TwelveDataProviderError("Market data provider returned an incomplete quote.", 502);
    }

    return {
      source: "twelve-data",
      symbol: payload.symbol,
      name: payload.name ?? null,
      exchange: payload.exchange ?? null,
      currency: payload.currency ?? null,
      asOf: payload.datetime ?? null,
      price,
      change: toNumber(payload.change),
      changePercent: toNumber(payload.percent_change),
      previousClose: toNumber(payload.previous_close),
      open: toNumber(payload.open),
      high: toNumber(payload.high),
      low: toNumber(payload.low),
      volume: toNumber(payload.volume)
    };
  }
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}
