import express from "express";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { TwelveDataProviderError } from "./market-data/twelve-data-provider-error.js";
import { TwelveDataQuoteProvider } from "./market-data/twelve-data-quote-provider.js";
import { TwelveDataTimeSeriesProvider } from "./market-data/twelve-data-time-series-provider.js";

config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")
});

const app = express();

const PORT = 4000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "trading-lab-backend"
  });
});

const quoteProvider = new TwelveDataQuoteProvider(process.env.API_KEY_TWELVEDATA);

app.get("/api/market/quote/:symbol", async (req, res) => {
  try {
    const quote = await quoteProvider.getQuote(req.params.symbol);
    res.json({ data: quote });
  } catch (error) {
    if (error instanceof Error && error.message === "TWELVE_DATA_API_KEY_MISSING") {
      res.status(503).json({ error: "Market data provider is not configured." });
      return;
    }

    if (error instanceof Error && error.message === "SYMBOL_REQUIRED") {
      res.status(400).json({ error: "A market symbol is required." });
      return;
    }

    if (error instanceof TwelveDataProviderError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error("Unexpected quote lookup error", error);
    res.status(502).json({ error: "Unable to retrieve the market quote." });
  }
});

const timeSeriesProvider = new TwelveDataTimeSeriesProvider(
  process.env.API_KEY_TWELVEDATA
);


app.get("/api/market/history/:symbol", async (req, res) => {
  try {
    const interval =
      typeof req.query.interval === "string"
        ? req.query.interval
        : "1day";

    const outputsize =
      typeof req.query.outputsize === "string"
        ? Number(req.query.outputsize)
        : 30;

    if (!Number.isInteger(outputsize) || outputsize < 1 || outputsize > 5000) {
      res.status(400).json({
        error: "outputsize must be an integer between 1 and 5000."
      });
      return;
    }

    const history = await timeSeriesProvider.getTimeSeries(
      req.params.symbol,
      interval,
      outputsize
    );

    res.json({ data: history });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TWELVE_DATA_API_KEY_MISSING"
    ) {
      res.status(503).json({
        error: "Market data provider is not configured."
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "SYMBOL_REQUIRED"
    ) {
      res.status(400).json({
        error: "A market symbol is required."
      });
      return;
    }

    if (error instanceof TwelveDataProviderError) {
      res.status(error.statusCode).json({
        error: error.message
      });
      return;
    }

    console.error("Unexpected historical data lookup error", error);

    res.status(502).json({
      error: "Unable to retrieve historical market data."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Trading Lab API running on http://localhost:${PORT}`);
});
