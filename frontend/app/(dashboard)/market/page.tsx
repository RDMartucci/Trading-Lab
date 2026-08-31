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
type CandlesResponse = { data: { symbol: string; interval: string; data: Candle[] } };
type SyncResponse = { data: { symbol: string; interval: string; candlesInserted: number; status: string; timestamp: string } };

const DEFAULT_SYMBOL = 'AAPL';
const DEFAULT_INTERVAL = '1day';
const API_BASE = 'http://localhost:4000';

function CandlestickChart({ candles }: { candles: Candle[] }) {
  const chartCandles = candles.slice(-20);

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

export default function MarketPage() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestCandle = useMemo(() => candles[candles.length - 1], [candles]);

  const loadMarketData = async (selectedSymbol = symbol) => {
    setLoading(true);
    setError(null);

    try {
      const [quoteRes, candlesRes] = await Promise.all([
        fetch(`${API_BASE}/api/market/quote/${selectedSymbol}`),
        fetch(`${API_BASE}/api/market/candles/${selectedSymbol}?interval=${interval}&limit=30`),
      ]);

      if (!quoteRes.ok || !candlesRes.ok) {
        const quoteText = quoteRes.ok ? await candlesRes.text() : await quoteRes.text();
        throw new Error(quoteText || 'Unable to load market data');
      }

      const quotePayload = (await quoteRes.json()) as QuoteResponse;
      const candlesPayload = (await candlesRes.json()) as CandlesResponse;

      setQuote(quotePayload.data);
      setCandles(candlesPayload.data?.data ?? []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unknown market error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMarketData(DEFAULT_SYMBOL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadMarketData(symbol.trim() || DEFAULT_SYMBOL);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/sync/assets/${symbol.trim() || DEFAULT_SYMBOL}?interval=${interval}&outputsize=30`, {
        method: 'POST',
      });

      const payload = (await response.json()) as SyncResponse | { error?: string };

      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : 'Sync failed');
      }

      await loadMarketData(symbol.trim() || DEFAULT_SYMBOL);
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
                  <option value="1hour">1hour</option>
                  <option value="1day">1day</option>
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
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Candlestick</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{quote?.symbol ?? symbol} / {interval}</h3>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-xs text-slate-300">{candles.length} candles</span>
                </div>
                <CandlestickChart candles={candles} />
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
