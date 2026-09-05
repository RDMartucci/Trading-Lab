// backend/src/models/market-candle.ts

export type MarketAsset = {
  id?: number;
  symbol: string;
  source: string;
  name?: string | null;
  exchange?: string | null;
  currency?: string | null;
  assetType?: string | null;
  createdAt?: string;
};

export type MarketCandleRecord = {
  id?: number;
  assetId: number;
  source: string;
  timeframe: string;
  candleTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  createdAt?: string;
};
