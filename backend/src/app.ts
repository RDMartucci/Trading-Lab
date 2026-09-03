import express from "express";

import { env } from "./config/env.js";
import { pool } from "./database/postgres.js";

import { MarketIndicatorService } from "./services/indicators/market-indicator.service.js";
import { MarketHistoryService } from "./services/market/market-history.service.js";
import { TwelveDataProviderError } from "./market-data/twelve-data-provider-error.js";

// Import routes
import { marketRoutes } from "./routes/market.routes.js";
import { assetsRoutes } from "./routes/assets.routes.js";
import { syncRoutes } from "./routes/sync.routes.js";

const app = express();

const PORT = 4000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "trading-lab-backend"
  });
});

// Mount routes
app.use("/api/market", marketRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/sync", syncRoutes);

// Initialize services
const marketHistoryService = new MarketHistoryService();
const marketIndicatorService = new MarketIndicatorService(marketHistoryService);

// SMA Indicator endpoint
app.get("/api/indicators/sma/:symbol", async (req, res) => {
  try {
    const interval =
      typeof req.query.interval === "string"
        ? req.query.interval
        : "1day";

    const period =
      typeof req.query.period === "string"
        ? Number(req.query.period)
        : 14;

    if (!Number.isInteger(period) || period <= 0) {
      res.status(400).json({
        error: "period must be a positive integer."
      });
      return;
    }

    const result = await marketIndicatorService.getSma(
      req.params.symbol,
      interval,
      period
    );

    res.json({ data: result });
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

    if (error instanceof Error && error.message === "PERIOD_MUST_BE_POSITIVE_INTEGER") {
      res.status(400).json({
        error: "period must be a positive integer."
      });
      return;
    }

    console.error("Unexpected SMA indicator error", error);

    res.status(502).json({
      error: "Unable to compute SMA indicator."
    });
  }
});

app.get("/api/indicators/ema/:symbol", async (req, res) => {
  try {
    const interval = typeof req.query.interval === "string" ? req.query.interval : "1day";
    const period = typeof req.query.period === "string" ? Number(req.query.period) : 14;

    if (!Number.isInteger(period) || period <= 0) {
      res.status(400).json({ error: "period must be a positive integer." });
      return;
    }

    const result = await marketIndicatorService.getEma(req.params.symbol, interval, period);
    res.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "TWELVE_DATA_API_KEY_MISSING") {
      res.status(503).json({ error: "Market data provider is not configured." });
      return;
    }
    if (error instanceof Error && error.message === "SYMBOL_REQUIRED") {
      res.status(400).json({ error: "A market symbol is required." });
      return;
    }
    if (error instanceof Error && error.message === "PERIOD_MUST_BE_POSITIVE_INTEGER") {
      res.status(400).json({ error: "period must be a positive integer." });
      return;
    }

    console.error("Unexpected EMA indicator error", error);
    res.status(502).json({ error: "Unable to compute EMA indicator." });
  }
});

// Verify database connection and start server
pool.query("SELECT NOW()")
  .then(() => {
    console.log("PostgreSQL connection OK");
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed", error);
  }
);

app.listen(PORT, () => {
  console.log(`Trading Lab API running on http://localhost:${PORT}`);
});
