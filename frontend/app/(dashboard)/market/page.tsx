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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Trading Lab</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Market dashboard</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              placeholder="AAPL"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none ring-0 transition focus:border-cyan-400"
            />

            <select
              value={interval}
              onChange={(event) => setInterval(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none transition focus:border-cyan-400"
            >
              <option value="1min">1min</option>
              <option value="5min">5min</option>
              <option value="15min">15min</option>
              <option value="1hour">1hour</option>
              <option value="1day">1day</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Load
            </button>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync data'}
            </button>
          </form>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading market data...
          </div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Symbol</p>
                <h2 className="mt-3 text-3xl font-bold text-white">{quote?.symbol ?? symbol}</h2>
                <p className="mt-2 text-slate-400">{quote?.name ?? 'Market asset'}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Last price</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {quote?.price != null ? `$${quote.price.toFixed(2)}` : '—'}
                </p>
                <p className="mt-2 text-slate-400">{quote?.exchange ?? 'Market'} • {quote?.currency ?? 'USD'}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Daily change</p>
                <p className={`mt-3 text-3xl font-bold ${((quote?.change ?? 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {quote?.change != null ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
                </p>
                <p className={`mt-2 ${((quote?.changePercent ?? 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {quote?.changePercent != null ? `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%` : '—'}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Recent candles</h3>
                <span className="text-sm text-slate-400">{candles.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Open</th>
                      <th className="py-2 pr-4">High</th>
                      <th className="py-2 pr-4">Low</th>
                      <th className="py-2 pr-4">Close</th>
                      <th className="py-2 pr-4">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candles.slice(-10).reverse().map((candle) => (
                      <tr key={`${candle.datetime}-${candle.close}`} className="border-b border-slate-800 text-slate-200">
                        <td className="py-2 pr-4">{new Date(candle.datetime).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{candle.open.toFixed(2)}</td>
                        <td className="py-2 pr-4">{candle.high.toFixed(2)}</td>
                        <td className="py-2 pr-4">{candle.low.toFixed(2)}</td>
                        <td className="py-2 pr-4">{candle.close.toFixed(2)}</td>
                        <td className="py-2 pr-4">{candle.volume != null ? candle.volume.toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Open</p>
                <p className="mt-2 text-xl font-semibold text-white">{latestCandle ? latestCandle.open.toFixed(2) : '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">High</p>
                <p className="mt-2 text-xl font-semibold text-white">{latestCandle ? latestCandle.high.toFixed(2) : '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Low</p>
                <p className="mt-2 text-xl font-semibold text-white">{latestCandle ? latestCandle.low.toFixed(2) : '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Volume</p>
                <p className="mt-2 text-xl font-semibold text-white">{latestCandle && latestCandle.volume != null ? latestCandle.volume.toLocaleString() : '—'}</p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
