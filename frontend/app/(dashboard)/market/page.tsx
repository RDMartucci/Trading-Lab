'use client';

import { useEffect, useMemo, useState } from 'react';

type Quote = {
  symbol: string;
  name: string | null;
  exchange: string | null;
  currency: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  asOf: string | null;
};

type Candle = {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

type QuoteResponse = { data: Quote };
type CandlesResponse = { data: { 
                          symbol: string; 
                          interval: string; 
                          data: Candle[] } 
};
type SyncResponse = { data: { 
                        symbol: string; 
                        interval: string; 
                        candlesInserted: number; 
                        status: string; 
                        timestamp: string }
};
type SmaResponse = {
  data: {
    period: number;
    values: Array<{ datetime: string; close: number; sma: number | null }>;
  };
};
type EmaResponse = {
  data: {
    values: Array<{ datetime: string; close: number; ema: number | null }>;
  };
};
type RsiResponse = {
  data: {
    period: number;
    values: Array<{ datetime: string; close: number; rsi: number | null }>;
  };
};

const DEFAULT_SYMBOL = 'AAPL';
const DEFAULT_INTERVAL = '1day';
const API_BASE = 'http://localhost:4000';

function CandlestickChart({ candles, visibleCandles, windowStart }: { candles: Candle[]; visibleCandles: number; windowStart: number }) {
  const chartCandles = candles.slice(windowStart, windowStart + visibleCandles);

  if (!chartCandles.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 text-sm text-slate-400">
        No chart data available
      </div>
    );
  }

  const width = 780;
  const height = 240;
  const padding = 24;
  const lows = chartCandles.map((c) => c.low);
  const highs = chartCandles.map((c) => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;
  const step = (width - padding * 2) / chartCandles.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full rounded-2xl bg-slate-950/80">
      <text x={padding} y={14} fill="#cbd5e1" fontSize="11">High {max.toFixed(2)}</text>
      <text x={padding} y={height - 6} fill="#cbd5e1" fontSize="11">Low {min.toFixed(2)}</text>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + (height - padding * 2) * (1 - ratio);
        return (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeDasharray="4 4"
          />
        );
      })}

      {chartCandles.map((candle, index) => {
        const x = padding + index * step + step * 0.25;
        const openY = padding + ((max - candle.open) / range) * (height - padding * 2);
        const closeY = padding + ((max - candle.close) / range) * (height - padding * 2);
        const highY = padding + ((max - candle.high) / range) * (height - padding * 2);
        const lowY = padding + ((max - candle.low) / range) * (height - padding * 2);
        const isUp = candle.close >= candle.open;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 6);

        return (
          <g key={`${candle.datetime}-${index}`}>
            <line x1={x + step * 0.25} x2={x + step * 0.25} y1={highY} y2={lowY} stroke={isUp ? '#22c55e' : '#f87171'} strokeWidth={1.5} />
            <rect
              x={x}
              y={bodyTop}
              width={Math.max(step * 0.5, 8)}
              height={bodyHeight}
              rx={3}
              fill={isUp ? '#22c55e' : '#f87171'}
              opacity={0.9}
            />
          </g>
        );
      })}
    </svg>
  );
}

function VolumeChart({ candles, visibleCandles, windowStart }: { candles: Candle[]; visibleCandles: number; windowStart: number }) {
  const chartCandles = candles.slice(windowStart, windowStart + visibleCandles);
  const volumes = chartCandles.map((candle) => candle.volume ?? 0);
  const maxVolume = Math.max(...volumes, 0);

  if (!chartCandles.length || maxVolume === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 text-sm text-slate-400">
        No volume data available
      </div>
    );
  }

  const width = 780;
  const height = 120;
  const padding = 16;
  const step = (width - padding * 2) / chartCandles.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full rounded-2xl bg-slate-950/80">
      <text x={padding} y={12} fill="#cbd5e1" fontSize="11">Max {maxVolume.toLocaleString()}</text>
      {chartCandles.map((candle, index) => {
        const volume = candle.volume ?? 0;
        const barHeight = (volume / maxVolume) * (height - padding * 2);
        const x = padding + index * step + step * 0.2;

        return (
          <rect
            key={`${candle.datetime}-${index}`}
            x={x}
            y={height - padding - barHeight}
            width={Math.max(step * 0.6, 4)}
            height={barHeight}
            rx={2}
            fill={candle.close >= candle.open ? '#22c55e' : '#f87171'}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

function SmaChart({ values, emaValues, candles, visibleCandles, windowStart, showSma, showEma }: { values: SmaResponse['data']['values']; emaValues: EmaResponse['data']['values']; candles: Candle[]; visibleCandles: number; windowStart: number; showSma: boolean; showEma: boolean }) {
  const visibleData = candles.slice(windowStart, windowStart + visibleCandles);
  const valuesByDate = new Map(values.map((value) => [value.datetime, value]));
  const chartValues = visibleData
    .map((candle) => valuesByDate.get(candle.datetime))
    .filter((value): value is SmaResponse['data']['values'][number] => value !== undefined);
  const validSmaValues = chartValues.filter((value) => (showSma && value.sma !== null) || (showEma && emaValues.some((ema) => ema.datetime === value.datetime && ema.ema !== null)));

  if (!chartValues.length || !validSmaValues.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 text-sm text-slate-400">
        Not enough data for SMA 14
      </div>
    );
  }

  const width = 780;
  const height = 160;
  const padding = 20;
  const emaByDate = new Map(emaValues.map((value) => [value.datetime, value.ema]));
  const prices = chartValues.flatMap((value) => [
    value.close,
    ...(showSma && value.sma !== null ? [value.sma] : []),
    ...(showEma && emaByDate.get(value.datetime) !== null && emaByDate.get(value.datetime) !== undefined ? [emaByDate.get(value.datetime) as number] : [])
  ]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const xStep = (width - padding * 2) / Math.max(chartValues.length - 1, 1);
  const toPoint = (value: number, index: number) => `${padding + index * xStep},${padding + ((max - value) / range) * (height - padding * 2)}`;
  const closePoints = chartValues.map((value, index) => toPoint(value.close, index)).join(' ');
  const smaPoints = showSma ? chartValues
    .map((value, index) => value.sma === null ? null : toPoint(value.sma, index))
    .filter((point): point is string => point !== null)
    .join(' ') : '';
  const emaPoints = showEma ? chartValues
    .map((value, index) => {
      const ema = emaByDate.get(value.datetime);
      return ema === null || ema === undefined ? null : toPoint(ema, index);
    })
    .filter((point): point is string => point !== null)
    .join(' ') : '';
  const candleByDate = new Map(candles.map((candle) => [candle.datetime, candle]));
  const maxVolume = Math.max(...chartValues.map((value) => candleByDate.get(value.datetime)?.volume ?? 0), 1);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full rounded-2xl bg-slate-950/80">
      <text x={padding} y={14} fill="#cbd5e1" fontSize="11">High {max.toFixed(2)}</text>
      <text x={padding} y={height - 4} fill="#cbd5e1" fontSize="11">Low {min.toFixed(2)}</text>
      {chartValues.map((value, index) => {
        const candle = candleByDate.get(value.datetime);
        const volume = candle?.volume ?? 0;
        const x = padding + index * xStep;
        const barHeight = (volume / maxVolume) * 24;

        return (
          <rect
            key={`volume-${value.datetime}`}
            x={x - Math.max(xStep * 0.3, 3)}
            y={height - padding - barHeight}
            width={Math.max(xStep * 0.6, 4)}
            height={barHeight}
            rx={2}
            fill="#64748b"
            opacity={0.45}
          />
        );
      })}
      <polyline points={closePoints} fill="none" stroke="#94a3b8" strokeWidth="2" />
      {showSma ? <polyline points={smaPoints} fill="none" stroke="#22d3ee" strokeWidth="2.5" /> : null}
      {showEma ? <polyline points={emaPoints} fill="none" stroke="#f59e0b" strokeWidth="2.5" /> : null}
      {chartValues.map((value, index) => {
        const candle = candleByDate.get(value.datetime);
        return (
          <circle
            key={`close-${value.datetime}`}
            cx={padding + index * xStep}
            cy={padding + ((max - value.close) / range) * (height - padding * 2)}
            r="3"
            fill={candle && candle.close >= candle.open ? '#22c55e' : '#f87171'}
          />
        );
      })}
    </svg>
  );
}

function RsiChart({ values, visibleCandles, windowStart }: { values: RsiResponse['data']['values']; visibleCandles: number; windowStart: number }) {
  const chartValues = values.slice(windowStart, windowStart + visibleCandles);
  const validValues = chartValues.filter((value) => value.rsi !== null);

  if (!validValues.length) {
    return <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 text-sm text-slate-400">Not enough data for RSI 14</div>;
  }

  const width = 780;
  const height = 160;
  const padding = 20;
  const xStep = (width - padding * 2) / Math.max(chartValues.length - 1, 1);
  const point = (value: number, index: number) => `${padding + index * xStep},${padding + ((100 - value) / 100) * (height - padding * 2)}`;
  const rsiPoints = chartValues.map((value, index) => value.rsi === null ? null : point(value.rsi, index)).filter((value): value is string => value !== null).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full rounded-2xl bg-slate-950/80">
      {[30, 50, 70].map((level) => {
        const y = padding + ((100 - level) / 100) * (height - padding * 2);
        return <line key={level} x1={padding} x2={width - padding} y1={y} y2={y} stroke={level === 50 ? 'rgba(148, 163, 184, 0.2)' : 'rgba(245, 158, 11, 0.35)'} strokeDasharray="4 4" />;
      })}
      <polyline points={rsiPoints} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
    </svg>
  );
}

export default function MarketPage() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [smaValues, setSmaValues] = useState<SmaResponse['data']['values']>([]);
  const [emaValues, setEmaValues] = useState<EmaResponse['data']['values']>([]);
  const [rsiValues, setRsiValues] = useState<RsiResponse['data']['values']>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma', 'ema', 'rsi']);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [visibleCandles, setVisibleCandles] = useState(10);
  const [windowStart, setWindowStart] = useState(0);

  const latestCandle = useMemo(() => candles[candles.length - 1], [candles]);

  const loadMarketData = async (selectedSymbol = symbol) => {
    setLoading(true);
    setError(null);

    try {
      const [quoteRes, candlesRes] = await Promise.all([
        fetch(`${API_BASE}/api/market/quote/${selectedSymbol}`),
        fetch(`${API_BASE}/api/market/candles/${selectedSymbol}?interval=${interval}&limit=50`),
      ]);
      const smaRes = await fetch(`${API_BASE}/api/indicators/sma/${selectedSymbol}?interval=${interval}&period=14`);
      const emaRes = await fetch(`${API_BASE}/api/indicators/ema/${selectedSymbol}?interval=${interval}&period=14`);
      const rsiRes = await fetch(`${API_BASE}/api/indicators/rsi/${selectedSymbol}?interval=${interval}&period=14`);

      if (!quoteRes.ok || !candlesRes.ok || !smaRes.ok || !emaRes.ok || !rsiRes.ok) {
        const quoteText = quoteRes.ok
          ? candlesRes.ok ? smaRes.ok ? emaRes.ok ? await rsiRes.text() : await emaRes.text() : await smaRes.text() : await candlesRes.text()
          : await quoteRes.text();
        throw new Error(quoteText || 'Unable to load market data');
      }

      const quotePayload = (await quoteRes.json()) as QuoteResponse;
      const candlesPayload = (await candlesRes.json()) as CandlesResponse;
      const smaPayload = (await smaRes.json()) as SmaResponse;
      const emaPayload = (await emaRes.json()) as EmaResponse;
      const rsiPayload = (await rsiRes.json()) as RsiResponse;

      setQuote(quotePayload.data);
      setCandles(candlesPayload.data?.data ?? []);
      setSmaValues(smaPayload.data?.values ?? []);
      setEmaValues(emaPayload.data?.values ?? []);
      setRsiValues(rsiPayload.data?.values ?? []);
      setWindowStart(0);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unknown market error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadMarketData(DEFAULT_SYMBOL));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSyncMessage(null);
    await loadMarketData(symbol.trim() || DEFAULT_SYMBOL);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/sync/assets/${symbol.trim() || DEFAULT_SYMBOL}?interval=${interval}&outputsize=50`, {
        method: 'POST',
      });

      const payload = (await response.json()) as SyncResponse | { error?: string };

      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : 'Sync failed');
      }

      const syncedData = 'data' in payload ? payload.data : null;
      await loadMarketData(symbol.trim() || DEFAULT_SYMBOL);
      setSyncMessage(
        `Datos guardados en la BBDD: ${syncedData?.candlesInserted ?? 0} new candles.`
      );
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : 'Unable to sync market data';
      setError(message);
    } finally {
      setSyncing(false);
    }
  };

  const dateLabel = quote?.asOf ? new Date(quote.asOf).toLocaleString() : 'Market closed';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,#020817_0%,#0f172a_100%)] p-4 text-slate-100 md:p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-slate-950">
              T
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Terminal</p>
              <h2 className="text-lg font-semibold text-white">Trading Lab</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {['Overview', 'Markets', 'Watchlist', 'Signals', 'Portfolio'].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${index === 0 ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
              >
                <span>{item}</span>
                <span className="text-xs text-slate-500">0{index + 1}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Market status</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm text-emerald-300">Live feed connected</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <header className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Market overview</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{quote?.symbol ?? symbol}</h1>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
                <input
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                />

                <select
                  value={interval}
                  onChange={(event) => setInterval(event.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="1min">1min</option>
                  <option value="5min">5min</option>
                  <option value="15min">15min</option>
                  <option value="30min">30min</option>
                  <option value="45min">45min</option>
                  <option value="1h">1h</option>
                  <option value="2h">2h</option>
                  <option value="4h">4h</option>
                  <option value="8h">8h</option>
                  <option value="1day">1day</option>
                  <option value="1week">1week</option>
                  <option value="1month">1month</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Load
                </button>

                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing}
                  className="rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-2.5 font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {syncing ? 'Syncing...' : 'Sync data'}
                </button>
              </form>
            </div>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200 shadow-lg shadow-rose-950/20">
              {error}
            </div>
          ) : null}

          {syncMessage ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200 shadow-lg shadow-emerald-950/20">
              {syncMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-[0_12px_40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
                <span>Loading market data...</span>
              </div>
            </div>
          ) : (
            <>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last price</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {quote?.price != null ? `$${quote.price.toFixed(2)}` : '—'}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{quote?.exchange ?? 'Market'} • {quote?.currency ?? 'USD'}</p>
                </div>

                <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Daily change</p>
                  <p className={`mt-4 text-3xl font-bold ${((quote?.change ?? 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quote?.change != null ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
                  </p>
                  <p className={`mt-2 text-sm ${((quote?.changePercent ?? 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quote?.changePercent != null ? `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%` : '—'}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open</p>
                  <p className="mt-4 text-3xl font-bold text-white">{latestCandle ? latestCandle.open.toFixed(2) : '—'}</p>
                  <p className="mt-2 text-sm text-slate-400">{quote?.name ?? symbol}</p>
                </div>

                <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Updated</p>
                  <p className="mt-4 text-lg font-semibold text-white">{dateLabel}</p>
                  <p className="mt-2 text-sm text-slate-400">{quote?.currency ?? 'USD'} market feed</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Candlestick</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{quote?.symbol ?? symbol} / {interval}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mr-1 text-xs text-slate-500">Zoom</span>
                    <button
                      type="button"
                      onClick={() => setWindowStart((current) => Math.max(0, current - 1))}
                      disabled={windowStart === 0}
                      title="Move one candle left"
                      aria-label="Move one candle left"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/70 text-lg text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ←
                    </button>
                    {[10, 20, 30, 50].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setVisibleCandles(count)}
                        aria-label={`Show ${count} candles`}
                        className={`h-8 rounded-lg border px-2 text-xs transition ${visibleCandles === count ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'}`}
                      >
                        {count}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWindowStart((current) => Math.min(Math.max(candles.length - visibleCandles, 0), current + 1))}
                      disabled={windowStart >= Math.max(candles.length - visibleCandles, 0)}
                      title="Move one candle right"
                      aria-label="Move one candle right"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/70 text-lg text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      →
                    </button>
                    <span className="ml-1 rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-xs text-slate-300">{windowStart + 1}-{Math.min(windowStart + visibleCandles, candles.length)} / {candles.length}</span>
                  </div>
                </div>
                <CandlestickChart candles={candles} visibleCandles={visibleCandles} windowStart={windowStart} />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</p>
                  <span className="text-xs text-slate-500">Same zoom range</span>
                </div>
                <VolumeChart candles={candles} visibleCandles={visibleCandles} windowStart={windowStart} />
              </section>

              <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Technical indicator</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">Selected indicators</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['sma', 'ema', 'rsi'].map((indicator) => (
                      <label key={indicator} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedIndicators.includes(indicator)}
                          onChange={() => setSelectedIndicators((current) => current.includes(indicator) ? current.filter((item) => item !== indicator) : [...current, indicator])}
                          className="accent-cyan-400"
                        />
                        {indicator.toUpperCase()} 14
                      </label>
                    ))}
                  </div>
                </div>
                {selectedIndicators.some((indicator) => indicator === 'sma' || indicator === 'ema') ? (
                  <div>
                    <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-400">
                      {selectedIndicators.includes('sma') ? <span className="text-cyan-300">SMA 14: {smaValues.filter((value) => value.sma !== null).at(-1)?.sma?.toFixed(2) ?? '—'}</span> : null}
                      {selectedIndicators.includes('ema') ? <span className="text-amber-300">EMA 14: {emaValues.filter((value) => value.ema !== null).at(-1)?.ema?.toFixed(2) ?? '—'}</span> : null}
                    </div>
                    <SmaChart values={smaValues} emaValues={emaValues} candles={candles} visibleCandles={visibleCandles} windowStart={windowStart} showSma={selectedIndicators.includes('sma')} showEma={selectedIndicators.includes('ema')} />
                  </div>
                ) : null}
                {selectedIndicators.includes('rsi') ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>RSI 14</span>
                      <span>Current: {rsiValues.filter((value) => value.rsi !== null).at(-1)?.rsi?.toFixed(2) ?? '—'} | 30 oversold / 70 overbought</span>
                    </div>
                    <RsiChart values={rsiValues} visibleCandles={visibleCandles} windowStart={windowStart} />
                  </div>
                ) : null}
                {!selectedIndicators.length ? <p className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-center text-sm text-slate-400">Select an indicator to display it.</p> : null}
              </section>

              <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Recent candles</h3>
                  <span className="text-sm text-slate-400">Last 10 entries</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Hour</th>
                        <th className="py-3 pr-4">Open</th>
                        <th className="py-3 pr-4">High</th>
                        <th className="py-3 pr-4">Low</th>
                        <th className="py-3 pr-4">Close</th>
                        <th className="py-3 pr-4">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candles.slice(-10).reverse().map((candle) => {
                        const candleDate = new Date(candle.datetime);

                        return (
                          <tr key={`${candle.datetime}-${candle.close}`} className="border-b border-slate-800 text-slate-200 transition hover:bg-slate-800/50">
                            <td className="py-3 pr-4">{candleDate.toLocaleDateString()}</td>
                            <td className="py-3 pr-4">{candleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="py-3 pr-4">{candle.open.toFixed(2)}</td>
                            <td className="py-3 pr-4">{candle.high.toFixed(2)}</td>
                            <td className="py-3 pr-4">{candle.low.toFixed(2)}</td>
                            <td className="py-3 pr-4">{candle.close.toFixed(2)}</td>
                            <td className="py-3 pr-4">{candle.volume != null ? candle.volume.toLocaleString() : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
