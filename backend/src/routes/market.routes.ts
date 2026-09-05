// backend/src/routes/market.routes.ts
import { Router } from "express";

import { MarketController } from "../controllers/market.controller.js";

const router = Router();

const controller = new MarketController();

router.get("/quote/:symbol", (req, res) =>
  controller.getQuote(req, res)
);

router.get("/history/:symbol", (req, res) =>
  controller.getMarketHistory(req, res)
);

router.get("/candles/:symbol", (req, res) =>
  controller.getPersistedHistory(req, res)
);

export const marketRoutes = router;