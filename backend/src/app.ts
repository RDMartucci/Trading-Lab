// backend/src/app.ts
import express from "express";

import { pool } from "./database/postgres.js";

// Import routes
import { marketRoutes } from "./routes/market.routes.js";
import { assetsRoutes } from "./routes/assets.routes.js";
import { syncRoutes } from "./routes/sync.routes.js";
import { indicatorRoutes } from "./routes/indicator.routes.js";

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
app.use("/api/indicators", indicatorRoutes);


// Initialize services


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
